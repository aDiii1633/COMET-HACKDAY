"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, HeartHandshake, Eye, Rocket, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-4 pt-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ShieldCheck className="h-20 w-20 text-primary mx-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tight text-gradient">SafeSphere AI</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Predict Danger Before It Happens. A comprehensive spatial threat intelligence platform designed to empower individuals with real-time safety analytics and proactive Guardian dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Target className="h-6 w-6 mr-3 text-primary" /> Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              To eradicate geospatial vulnerabilities by democratizing access to hyper-local crime intelligence, predictive AI analytics, and automated emergency deterrence systems. We believe safety is a fundamental human right, not a luxury.
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Eye className="h-6 w-6 mr-3 text-primary" /> The Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              Building a global mesh network of active threat detection. By merging historical government crime statistics with crowdsourced community telemetry and temporal illumination data, we create a living map of urban safety.
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <HeartHandshake className="h-6 w-6 mr-3 text-primary" /> Guardian Circle
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              Technology should connect us when it matters most. Guardian Circle allows you to dispatch high-priority SOS notifications bypassing silent modes, sharing your live SafeRoute geometry to trusted contacts.
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card h-full border-t-primary border-t-4">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Rocket className="h-6 w-6 mr-3 text-primary" /> Hackathon Prototype
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              This application was built as a highly-polished MVP for evaluation. It features a complete spatial Risk Engine (H(s,t)), OpenAI-powered Explainable AI, and Google Maps Polyline Navigation. 
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pt-8 border-t border-white/10">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <Info className="h-4 w-4 mr-2" /> SafeSphere AI v1.0.0 — Privacy by Design. Location data is never sold.
        </p>
      </motion.div>
    </div>
  );
}
