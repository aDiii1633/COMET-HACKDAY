"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Map, ShieldAlert, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const onboardingSteps = [
  {
    id: "predict",
    title: "Predict Danger Before It Happens",
    description: "Our AI spatial risk engine analyzes thousands of community reports to keep you out of harm's way.",
    icon: Map,
    color: "text-[#15803D]",
    bg: "bg-[#DCFCE7] border border-[#86EFAC]",
  },
  {
    id: "guardian",
    title: "Live Guardian Circle",
    description: "Your trusted contacts can monitor your live trajectory when you enter high-risk zones.",
    icon: Users,
    color: "text-[#15803D]",
    bg: "bg-[#DCFCE7] border border-[#86EFAC]",
  },
  {
    id: "alert",
    title: "Level 2 Emergency Escalation",
    description: "If your safety pulse stops, our system automatically dispatches high-urgency alerts with your exact location.",
    icon: ShieldAlert,
    color: "text-[#B91C1C]",
    bg: "bg-[#FEE2E2] border border-[#B91C1C]/30",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#F7F9F7] p-6">
      {/* Top spacer */}
      <div className="w-full flex justify-end pt-4">
        <Button variant="ghost" className="text-[#6B7280] hover:text-[#172018] hover:bg-[#F0FDF4] font-semibold" onClick={() => router.push("/auth/login")}>
          Skip
        </Button>
      </div>

      <div className="flex flex-1 w-full max-w-md flex-col items-center justify-center space-y-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Dynamic Icon */}
            <div className={`p-8 rounded-full shadow-sm ${onboardingSteps[step].bg}`}>
              {(() => {
                const Icon = onboardingSteps[step].icon;
                return <Icon className={`w-20 h-20 ${onboardingSteps[step].color}`} />;
              })()}
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-[#172018]">
                {onboardingSteps[step].title}
              </h2>
              <p className="text-base text-[#4B5563] font-medium max-w-xs mx-auto leading-relaxed">
                {onboardingSteps[step].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex flex-col space-y-8 pb-10">
        {/* Indicators */}
        <div className="flex justify-center space-x-2">
          {onboardingSteps.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full ${idx === step ? "bg-[#15803D] w-8" : "bg-[#DDE8DF] w-2"}`}
              animate={{ width: idx === step ? 32 : 8 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <Button 
          size="lg" 
          className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] rounded-2xl py-6 text-base font-bold shadow-md"
          onClick={nextStep}
        >
          {step === onboardingSteps.length - 1 ? "Get Started" : "Continue"}
          <ArrowRight className="ml-2 w-5 h-5 text-[#FFFFFF]" />
        </Button>
      </div>
    </div>
  );
}
