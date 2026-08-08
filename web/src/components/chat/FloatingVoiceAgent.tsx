"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, ShieldAlert } from "lucide-react";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useState, useRef } from "react";

export function FloatingVoiceAgent() {
  const { isListening, isProcessing, toggleListening, triggerEmergencyManually } = useVoiceAgent();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const pressStartRef = useRef<number>(0);
  const longPressTriggeredRef = useRef<boolean>(false);

  const handlePointerDown = () => {
    setIsPressing(true);
    pressStartRef.current = Date.now();
    longPressTriggeredRef.current = false;
    const timer = setTimeout(() => {
      longPressTriggeredRef.current = true;
      triggerEmergencyManually();
    }, 1500); // 1.5 seconds long press
    setPressTimer(timer);
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleClick = () => {
    // Only toggle listening if it was a short click, not a long press
    if (!longPressTriggeredRef.current) {
      toggleListening();
    }
  };

  return (
    <div className="fixed bottom-[110px] right-6 z-50 flex flex-col items-center">
      {/* Listening status text */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isListening || isProcessing ? 1 : 0, y: isListening || isProcessing ? 0 : 10 }}
        className="mb-2 bg-[#DCFCE7] border border-[#86EFAC] px-3 py-1 rounded-full shadow-xs"
      >
        <span className="text-xs font-bold text-[#14532D]">
          {isProcessing ? "Processing..." : "Listening..."}
        </span>
      </motion.div>

      {/* Main Voice Button */}
      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300
          shadow-md border-2 cursor-pointer
          ${isListening 
              ? 'bg-[#B91C1C] border-[#FFFFFF] shadow-[0_0_20px_rgba(185,28,28,0.4)] text-[#FFFFFF]' 
              : isProcessing 
                ? 'bg-[#16A34A] border-[#FFFFFF] text-[#FFFFFF]' 
                : 'bg-[#15803D] hover:bg-[#166534] border-[#FFFFFF] text-[#FFFFFF]'}
        `}
        aria-label="Voice Assistant"
      >
        {/* Pulsing Aura when listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#B91C1C]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {/* Fill when long pressing (Emergency intent indicator) */}
        {isPressing && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="absolute inset-0 bg-[#991B1B] rounded-full"
          />
        )}

        <div className="relative z-10 w-full h-full flex items-center justify-center rounded-full">
          {isListening ? (
            <Mic className="h-6 w-6 text-[#FFFFFF] animate-pulse" />
          ) : (
            <MicOff className="h-5 w-5 text-[#FFFFFF]/90" />
          )}
        </div>
      </motion.button>

      {/* Tooltip for long press */}
      <div className="absolute -left-28 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity bg-[#FFFFFF] border border-[#DDE8DF] shadow-md px-2.5 py-1 rounded-lg text-[10px] font-medium text-[#4B5563] pointer-events-none flex items-center gap-1">
        <ShieldAlert className="h-3 w-3 text-[#B91C1C]" /> Hold for SOS
      </div>
    </div>
  );
}
