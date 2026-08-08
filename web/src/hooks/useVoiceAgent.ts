"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { aiApi, riskApi, emergencyApi, guardiansApi } from "@/lib/api/services";
import { useCompanionState } from "@/store/useCompanionState";
import { useChatStore } from "@/store/useChatStore";
import { useLocationStore } from "@/store/useLocationStore";
import toast from "react-hot-toast";

export function useVoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const companion = useCompanionState();
  const chatStore = useChatStore();
  const { lat: storeLat, lng: storeLng, riskData } = useLocationStore();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopListening(false);
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = useCallback(async () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
      companion.setSpeaking(false);
    }

    try {
      if (!streamRef.current || !streamRef.current.active) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processVoiceAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      companion.setListening(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      toast.error("Microphone access is required for the voice agent.");
    }
  }, [companion]);

  const stopListening = useCallback((process = true) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      // If process is false, we want to discard it (e.g. on unmount or manual cancel)
      if (!process) {
        mediaRecorderRef.current.onstop = null;
      }
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    companion.setListening(false);
  }, [companion]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening(true);
    else startListening();
  }, [isListening, startListening, stopListening]);

  const playTTS = useCallback((base64Audio: string) => {
    if (!base64Audio) return;

    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }

    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    const audio = new Audio(audioUrl);
    audioPlaybackRef.current = audio;

    audio.onplay = () => companion.setSpeaking(true);
    audio.onended = () => companion.setSpeaking(false);
    audio.onerror = () => companion.setSpeaking(false);
    audio.onpause = () => companion.setSpeaking(false);

    audio.play().catch(e => {
      console.error("Audio playback failed:", e);
      companion.setSpeaking(false);
    });
  }, [companion]);

  const processVoiceAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    companion.setExpression("thinking");
    companion.triggerGesture("thinking");

    try {
      // 1. Gather Context non-blockingly
      let context: any = {};
      const lat = storeLat || 28.6139;
      const lng = storeLng || 77.2090;

      if (riskData) {
        context = {
          risk_score: riskData.risk_score,
          risk_level: riskData.risk_level,
          lat,
          lng
        };
      }

      // 2. Call backend Voice-Process API
      const historyForApi = chatStore.messages.slice(-5).map(m => ({ role: m.role, content: m.text }));
      
      const response = await aiApi.voiceProcess(audioBlob, historyForApi, context);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const userText = response.transcription;
      const replyText = response.reply;
      const action = response.action;
      const actionData = response.action_data || {};
      const audioB64 = response.audio_b64;

      // 3. Save messages
      chatStore.addMessage({ role: "user", text: userText });
      chatStore.addMessage({ role: "assistant", text: replyText });

      // 4. Play spoken response
      if (audioB64) {
        playTTS(audioB64);
      }

      // 5. Execute Intents
      if (action === "EMERGENCY_MODE") {
        companion.setExpression("serious");
        await emergencyApi.trigger(lat, lng, 100);
        toast.error("Emergency Mode Activated!", { duration: 5000 });
        if (window.location.pathname !== "/emergency") {
          window.location.href = "/emergency";
        }
      } else if (action === "NOTIFY_GUARDIANS") {
        companion.setExpression("serious");
        companion.triggerGesture("wave");
        await guardiansApi.triggerAlert(lat, lng, 100);
        toast.success("Guardians Notified");
      } else if (action === "ROUTE_TO") {
        companion.setExpression("happy");
        companion.triggerGesture("point");
        toast.success(`Routing to: ${actionData.destination}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)._voiceRouteDest = actionData.destination;
        if (window.location.pathname !== "/map") {
          window.location.href = "/map";
        }
      } else {
        companion.setExpression("happy");
      }

    } catch (e) {
      console.error("Voice processing failed", e);
      const fallback = "I'm having trouble connecting right now. Please try again.";
      chatStore.addMessage({ role: "assistant", text: fallback });
      companion.setExpression("concerned");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerEmergencyManually = async () => {
    stopListening(false);
    if (audioPlaybackRef.current) audioPlaybackRef.current.pause();
    
    companion.setExpression("serious");
    const reply = "I am activating emergency mode. Calling guardians and authorities.";
    
    chatStore.addMessage({ role: "assistant", text: reply });
    toast.error("Emergency Mode Triggered!");
    if (window.location.pathname !== "/emergency") {
      window.location.href = "/emergency";
    }
  };

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening: () => stopListening(true),
    toggleListening,
    triggerEmergencyManually
  };
}
