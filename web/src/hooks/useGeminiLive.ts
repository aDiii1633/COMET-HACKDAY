"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useCompanionState } from "@/store/useCompanionState";
import { useChatStore } from "@/store/useChatStore";
import toast from "react-hot-toast";

// Utility to convert Base64 to Int16Array
function base64ToInt16Array(base64: string): Int16Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

// Utility to convert Int16Array to Base64
function int16ArrayToBase64(int16Array: Int16Array): string {
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function useGeminiLive() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  
  const companion = useCompanionState();
  const chatStore = useChatStore();

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioInputContextRef.current) {
      audioInputContextRef.current.close();
      audioInputContextRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    companion.setListening(false);
    companion.setSpeaking(false);
  }, [companion]);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  const sendSystemEvent = useCallback((eventText: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [{ text: `System Event: ${eventText}` }]
            }
          ],
          turnComplete: true
        }
      }));
    }
  }, []);

  const interruptAudio = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      nextPlayTimeRef.current = 0;
      companion.setSpeaking(false);
      
      // Tell Gemini Live to cancel the current turn
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          clientContent: {
            turnComplete: true
          }
        }));
      }
    }
  }, [companion]);

  const connectAndListen = useCallback(async () => {
    if (isConnected) return;
    
    try {
      // 1. Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
      mediaStreamRef.current = stream;

      // 2. Setup Audio Playback Context (Output is 24kHz PCM from Gemini)
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // 3. Setup Audio Input Context (Input must be 16kHz PCM for Gemini)
      audioInputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioInputContextRef.current.createMediaStreamSource(stream);
      const processor = audioInputContextRef.current.createScriptProcessor(4096, 1, 1);
      
      scriptProcessorRef.current = processor;
      source.connect(processor);
      processor.connect(audioInputContextRef.current.destination);

      // 4. Connect WebSocket
      const wsUrl = `ws://localhost:8000/api/v1/ai/live-session`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsListening(true);
        companion.setListening(true);
        
        // Start streaming audio
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && isListening) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            let hasVoice = false;
            for (let i = 0; i < inputData.length; i++) {
              pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              if (Math.abs(inputData[i]) > 0.1) hasVoice = true; // rough VAD
            }
            
            // Send chunk
            ws.send(JSON.stringify({
              realtimeInput: {
                mediaChunks: [{
                  mimeType: "audio/pcm;rate=16000",
                  data: int16ArrayToBase64(pcm16)
                }]
              }
            }));
            
            // Simple barge-in logic (if user speaks loudly, interrupt playback)
            if (hasVoice && companion.isSpeaking) {
              interruptAudio();
            }
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith("audio/pcm")) {
                // Play Audio
                if (!audioContextRef.current) return;
                const ctx = audioContextRef.current;
                
                if (ctx.state === 'suspended') ctx.resume();
                
                const pcm16 = base64ToInt16Array(part.inlineData.data);
                const floatData = new Float32Array(pcm16.length);
                for (let i = 0; i < pcm16.length; i++) floatData[i] = pcm16[i] / 32768;
                
                const buffer = ctx.createBuffer(1, floatData.length, 24000);
                buffer.getChannelData(0).set(floatData);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                const currentTime = ctx.currentTime;
                if (nextPlayTimeRef.current < currentTime) {
                  nextPlayTimeRef.current = currentTime;
                }
                source.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += buffer.duration;
                
                companion.setSpeaking(true);
                
                source.onended = () => {
                  if (ctx.currentTime >= nextPlayTimeRef.current - 0.1) {
                    companion.setSpeaking(false);
                  }
                };
              }
            }
          }

          // Handle Tool Calls (e.g. notify_guardians)
          if (data.toolCall) {
            const calls = data.toolCall.functionCalls;
            const responses = [];
            
            for (const call of calls) {
              if (call.name === "notify_guardians") {
                toast.success("Guardians Notified (Tool Called)");
                companion.setExpression("serious");
                responses.push({
                  id: call.id,
                  name: call.name,
                  response: { result: "Success. Guardians have been notified." }
                });
              } else if (call.name === "trigger_emergency") {
                toast.error("Emergency Workflow Activated (Tool Called)");
                companion.setExpression("serious");
                responses.push({
                  id: call.id,
                  name: call.name,
                  response: { result: "Success. Emergency workflow activated." }
                });
                if (window.location.pathname !== "/emergency") {
                  window.location.href = "/emergency";
                }
              }
            }
            
            if (responses.length > 0) {
              ws.send(JSON.stringify({
                toolResponse: {
                  functionResponses: responses
                }
              }));
            }
          }
          
        } catch (e) {
          console.error("Gemini parse error", e);
        }
      };

      ws.onclose = () => {
        disconnect();
      };
      
    } catch (err) {
      console.error("Failed to connect live session", err);
      toast.error("Microphone access or live connection failed.");
      disconnect();
    }
  }, [isConnected, companion, disconnect, isListening, interruptAudio]);

  const toggleListening = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connectAndListen();
    }
  }, [isConnected, connectAndListen, disconnect]);

  const triggerEmergencyManually = useCallback(() => {
    toast.error("Emergency manually triggered!");
    sendSystemEvent("EMERGENCY triggered manually by user.");
    companion.setExpression("serious");
    if (window.location.pathname !== "/emergency") {
      window.location.href = "/emergency";
    }
  }, [sendSystemEvent, companion]);

  return {
    isListening,
    isProcessing: false, // In live streaming, we don't have a discreet processing phase
    isConnected,
    toggleListening,
    triggerEmergencyManually,
    sendSystemEvent
  };
}
