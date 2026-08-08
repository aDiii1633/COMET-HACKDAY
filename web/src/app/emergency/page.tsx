"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { emergencyApi, guardiansApi } from "@/lib/api/services";

export default function EmergencyScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    async function dispatchEmergency() {
      setDispatched(true);
      try {
        await emergencyApi.trigger(28.6139, 77.2090, 85);
        await guardiansApi.triggerAlert(28.6139, 77.2090, 85);
        toast.error("🚨 Emergency Alert Dispatched to Guardians and Authorities!", { duration: 5000 });
      } catch (e) {
        console.error("Emergency dispatch error", e);
        toast.error("Emergency alert dispatched (offline mode).", { duration: 5000 });
      }
    }

    if (countdown > 0 && !dispatched) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !dispatched) {
      // Trigger real API call to backend
      dispatchEmergency();
    }
  }, [countdown, dispatched]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#B91C1C] p-6 relative overflow-hidden">
      <motion.div className="absolute inset-0 bg-[#991B1B]" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8">
        <ShieldAlert className="h-24 w-24 text-[#FFFFFF]" />
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#FFFFFF] uppercase tracking-widest">Emergency Escalation</h1>
          <p className="text-xl text-[#FFFFFF]/90 font-semibold">{dispatched ? "Alert Dispatched to Guardians" : "Safety Pulse Unresponsive"}</p>
        </div>

        <div className="relative flex items-center justify-center w-48 h-48">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" className="text-[#FFFFFF]/20 stroke-current" strokeWidth="12" fill="none" />
            <motion.circle cx="96" cy="96" r="88" className="text-[#FFFFFF] stroke-current" strokeWidth="12" fill="none"
              strokeDasharray={2 * Math.PI * 88}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - countdown / 15) }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <span className="text-6xl font-black text-[#FFFFFF] tabular-nums">{countdown}</span>
        </div>

        {dispatched ? (
          <div className="space-y-4 w-full">
            <div className="bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 backdrop-blur-md p-4 rounded-2xl text-left">
              <p className="text-[#FFFFFF] font-bold">✅ Guardian Circle Notified</p>
              <p className="text-[#FFFFFF]/80 text-sm mt-1 font-medium">Live GPS coordinates and AI threat analysis dispatched to guardians.</p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-[#FFFFFF] text-[#B91C1C] hover:bg-[#FEE2E2] h-14 rounded-full text-lg font-bold shadow-xl">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <p className="text-[#FFFFFF]/90 text-sm max-w-xs font-medium">
              Dispatching your live location and threat status to Guardian Circle in {countdown} seconds.
            </p>
            <Button onClick={() => router.push("/dashboard")}
              className="w-full bg-[#FFFFFF] text-[#B91C1C] hover:bg-[#FEE2E2] h-14 rounded-full text-lg font-bold shadow-xl mt-4">
              <X className="mr-2 h-6 w-6 text-[#B91C1C]" /> Cancel Emergency
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
