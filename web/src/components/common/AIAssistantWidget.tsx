"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiApi, riskApi, crimeApi } from "@/lib/api/services";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your SafeSphere AI Assistant. How can I help you navigate safely today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Gather context
      const lat = 28.6139;
      const lng = 77.2090;
      const [risk, crime] = await Promise.all([
        riskApi.evaluate(lat, lng),
        crimeApi.stats(lat, lng)
      ]);

      const context = {
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        community_reports_count: crime.total_nearby_crimes,
        historical_score: crime.historical_score,
        safe_places: ["Police Station 1", "City Hospital"] // mocked for context length
      };

      const reply = await aiApi.chat(userMessage, context);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to the intelligence layer right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-80 md:w-96"
            >
              <Card className="glass-card shadow-2xl border-primary/30 flex flex-col h-[400px]">
                <CardHeader className="py-3 px-4 border-b border-white/10 bg-primary/10 rounded-t-xl flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-primary" /> AI Safety Assistant
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-primary text-white rounded-br-none" : "bg-white/10 text-white rounded-bl-none border border-white/5"}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white rounded-2xl rounded-bl-none border border-white/5 px-4 py-2 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                <CardFooter className="p-3 border-t border-white/10 bg-background/50 rounded-b-xl">
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full space-x-2">
                    <Input 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about your safety..." 
                      className="flex-1 bg-white/5 border-white/10 text-white text-sm h-10"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 h-10 w-10 shrink-0" disabled={isLoading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center transition-colors ${isOpen ? 'bg-white text-primary' : 'bg-primary text-white'}`}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </motion.button>
      </div>
    </>
  );
}
