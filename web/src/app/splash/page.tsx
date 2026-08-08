"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Splash() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9F7]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 1.5,
        }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#DCFCE7] border border-[#86EFAC] shadow-md">
          <ShieldCheck className="h-16 w-16 text-[#15803D]" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#15803D]/30"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black tracking-tight text-[#172018]">
            SafeSphere <span className="text-[#15803D]">AI</span>
          </h1>
          <p className="mt-2.5 text-xs font-bold text-[#4B5563] uppercase tracking-widest">
            Predict Danger Before It Happens
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
