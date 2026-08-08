"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiApi, riskApi } from "@/lib/api/services";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { useCompanionState } from "@/store/useCompanionState";
import { useChatStore } from "@/store/useChatStore";
import { useLocationStore } from "@/store/useLocationStore";

// Lazy load the 3D companion for performance
const SafeSphereCompanion = dynamic(
  () => import("@/components/character/SafeSphereCompanion"),
  { ssr: false, loading: () => <div className="w-14 h-14 rounded-full bg-primary/20 animate-pulse" /> }
);

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, addMessage, updateMessage } = useChatStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { setExpression, triggerGesture, showSpeech, setChatMode } = useCompanionState();
  const { lat, lng, riskData } = useLocationStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Companion reacts to chat state
  useEffect(() => {
    if (isOpen) {
      setChatMode(true);
      setExpression("greeting");
      triggerGesture("wave", 2500);
      showSpeech("Hello! How can I help?", 3000);
    } else {
      setChatMode(false);
      setExpression("idle");
    }
  }, [isOpen, setChatMode, setExpression, triggerGesture, showSpeech]);

  const handleSend = async () => {
    if (!input.trim() || loading || isTyping) return;
    
    const userText = input;
    addMessage({ role: "user", text: userText });
    setInput("");
    setLoading(true);

    // Companion enters thinking mode
    setExpression("thinking");
    triggerGesture("thinking", 10000);

    // Generate a temporary ID for the assistant's streaming response
    const assistantMsgId = Date.now().toString();
    addMessage({ id: assistantMsgId, role: "assistant", text: "" });

    try {
      // Gather context non-blockingly
      // Gather context non-blockingly using global store
      let context: any = {};
      if (lat !== null && lng !== null && riskData) {
        context = {
          risk_score: riskData.risk_score,
          risk_level: riskData.risk_level,
          lat,
          lng
        };
      }
      
      
      setLoading(false);
      setIsTyping(true);

      let currentText = "";
      
      await aiApi.chatStream(
        userText, 
        context,
        (chunk: string) => {
          currentText += chunk;
          updateMessage(assistantMsgId, currentText);
          scrollToBottom();
        },
        () => {
          // Complete
          setIsTyping(false);
          setExpression("happy");
          triggerGesture("none");
        },
        (err: any) => {
          console.error("Stream error:", err);
          toast.error("Connection interrupted.");
          setIsTyping(false);
          setExpression("concerned");
        }
      );

    } catch (e) {
      toast.error("Failed to connect to AI Assistant.");
      updateMessage(assistantMsgId, "I'm having trouble connecting right now. Please try again later.");
      setExpression("concerned");
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-80 sm:w-96 bg-[#FFFFFF] border border-[#DDE8DF] rounded-2xl shadow-xl flex flex-col h-[520px] overflow-hidden">
              {/* Character Header */}
              <CardHeader className="p-0 border-b border-[#DDE8DF] bg-[#F0FDF4] overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <CardTitle className="text-[#172018] text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                    SafeSphere AI Assistant
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-[#6B7280] hover:text-[#172018] hover:bg-[#DCFCE7]" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Inline Companion Character */}
                <div className="flex justify-center -mt-1 -mb-2">
                  <SafeSphereCompanion width={180} height={140} mode="bust" />
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#FFFFFF]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-xs ${
                      msg.role === "user" 
                        ? "bg-[#DCFCE7] text-[#14532D] font-medium rounded-br-none border border-[#86EFAC]" 
                        : "bg-[#F7F9F7] text-[#172018] rounded-bl-none border border-[#DDE8DF]"
                    }`}>
                      {msg.role === "assistant" && <Bot className="h-3.5 w-3.5 mb-1 text-[#15803D]" />}
                      {msg.role === "user" && <User className="h-3.5 w-3.5 mb-1 text-[#14532D]" />}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F7F9F7] text-[#172018] border border-[#DDE8DF] rounded-2xl rounded-bl-none p-3 text-sm shadow-xs flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#15803D]" />
                      <span className="text-[#6B7280] text-xs font-medium">Analyzing environment context...</span>
                    </div>
                  </div>
                )}
                {isTyping && !loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#F7F9F7] border border-[#DDE8DF] text-[#172018] rounded-2xl rounded-bl-none p-2.5 shadow-xs flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#15803D] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <CardFooter className="p-3 border-t border-[#DDE8DF] bg-[#FFFFFF]">
                <form 
                  className="flex w-full space-x-2" 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                >
                  <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about safety in your area..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || loading || isTyping} className="bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF]">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — Character Avatar */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex justify-end">
        <button
          className="relative h-14 w-14 rounded-full overflow-hidden bg-[#15803D] hover:bg-[#166534] shadow-lg border-2 border-[#FFFFFF] cursor-pointer transition-all flex items-center justify-center text-[#FFFFFF]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-[#FFFFFF]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <SafeSphereCompanion width={52} height={52} mode="avatar" />
            </div>
          )}
        </button>
      </motion.div>
    </div>
  );
}
