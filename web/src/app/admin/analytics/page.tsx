"use client";

import { motion } from "framer-motion";
import { BarChart, LineChart, PieChart, Activity, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const stats = [
    { title: "Total Active Users", value: "1,204", icon: Users, color: "text-blue-400" },
    { title: "Community Reports", value: "342", icon: AlertTriangle, color: "text-risk-medium" },
    { title: "SafeRoutes Navigated", value: "8,921", icon: Activity, color: "text-risk-safe" },
    { title: "Prediction Accuracy", value: "94.2%", icon: CheckCircle2, color: "text-primary" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 pt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center">
            <BarChart className="h-8 w-8 mr-3 text-primary" /> Admin Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Platform telemetry and risk prediction monitoring.</p>
        </div>
        <div className="bg-risk-danger/20 text-risk-danger px-3 py-1 rounded-full text-xs font-bold border border-risk-danger/30">
          CONFIDENTIAL
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-background/50 border border-white/5 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts / Data area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card h-80 relative overflow-hidden flex flex-col justify-center items-center">
            <LineChart className="h-24 w-24 text-white/5 absolute" />
            <CardHeader className="absolute top-0 left-0 w-full">
              <CardTitle className="text-lg text-white">Risk Engine Trends (7 Days)</CardTitle>
            </CardHeader>
            <div className="text-center mt-8">
              <p className="text-muted-foreground text-sm">[Demo Mode] Chart visualization placeholder.</p>
              <div className="flex gap-2 mt-4 justify-center items-end h-24">
                {[40, 65, 45, 80, 50, 30, 20].map((h, i) => (
                  <div key={i} className="w-8 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card h-80 relative overflow-hidden flex flex-col justify-center items-center">
            <PieChart className="h-24 w-24 text-white/5 absolute" />
            <CardHeader className="absolute top-0 left-0 w-full">
              <CardTitle className="text-lg text-white">Most Unsafe Areas</CardTitle>
            </CardHeader>
            <div className="w-full px-6 mt-8 space-y-4">
              {[
                { name: "Downtown Alley", score: 85 },
                { name: "Sector 4 Station", score: 72 },
                { name: "North Highway", score: 65 },
              ].map((area, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-white">{area.name}</span>
                  <span className="text-risk-danger font-bold">{area.score}/100</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
