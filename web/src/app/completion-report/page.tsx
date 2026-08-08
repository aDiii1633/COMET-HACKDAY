"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function CompletionReportPage() {
  const features = [
    { name: "Authentication (Supabase JWT & Firestore Sync)", status: "Completed" },
    { name: "Google Maps Integration (Version Pin 3.64 for Legacy Heatmap)", status: "Completed" },
    { name: "Google Places API (Safe Havens & Autocomplete)", status: "Completed" },
    { name: "data.gov.in API (Government Crime Stats)", status: "Completed" },
    { name: "Kaggle Dataset (Embedded Intelligence DB)", status: "Completed" },
    { name: "OpenAI XAI (Threat Rationalization)", status: "Completed" },
    { name: "Guardian Circle (Live Polling & Notifications)", status: "Completed" },
    { name: "Community Reports (Firestore submission + Verification)", status: "Completed" },
    { name: "Risk Engine (Composite Score: Kaggle + Gov + Community + Time)", status: "Completed" },
    { name: "Dashboard (Data-dense UI + Area Intelligence + Empty States)", status: "Completed" },
    { name: "Notifications (FCM Emergency Dispatch Pipeline)", status: "Completed" },
    { name: "Floating AI Chatbot Assistant (Context-aware responses)", status: "Completed" },
    { name: "Safe Route Journey Planner (Safest vs Fastest Polyline rendering)", status: "Completed" },
    { name: "Live Heatmap (Weighted overlay on Google Maps)", status: "Completed" },
    { name: "AI Future Prediction (Temporal Forecasting)", status: "Completed" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-3">
        <ShieldCheck className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-black text-white tracking-tight">Project Completion Report</h1>
        <p className="text-muted-foreground text-lg">Hackathon Production-Ready Audit</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="glass-card border-t-primary border-t-4 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Module Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                  <span className="text-white font-medium">{feature.name}</span>
                  <div className="flex items-center text-risk-safe bg-risk-safe/10 px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {feature.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
