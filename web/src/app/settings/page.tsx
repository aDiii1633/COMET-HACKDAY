"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Bell, Shield, Smartphone, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    smsAlerts: true,
    shareLocation: true,
    autoHapticWarnings: true,
    anonymousReporting: false,
    darkMode: true, // Immutable per instructions
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.success("Settings updated");
      return newState;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#172018] tracking-tight flex items-center">
        <Settings2 className="mr-3 h-8 w-8 text-[#15803D]" /> Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="neo-card bg-[#FFFFFF] h-full">
            <CardHeader>
              <CardTitle className="text-lg text-[#172018] font-bold flex items-center">
                <Bell className="mr-2 h-5 w-5 text-[#15803D]" /> Notifications
              </CardTitle>
              <CardDescription className="text-[#4B5563] text-xs">Manage how we alert you and your guardians.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0FDF4] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#172018]">Push Notifications</p>
                  <p className="text-xs text-[#6B7280]">Receive live safety alerts on your device</p>
                </div>
                <Switch checked={settings.pushNotifications} onCheckedChange={() => handleToggle('pushNotifications')} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0FDF4] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#172018]">SMS Emergency Alerts</p>
                  <p className="text-xs text-[#6B7280]">Send SMS to guardians on Level 2 emergency</p>
                </div>
                <Switch checked={settings.smsAlerts} onCheckedChange={() => handleToggle('smsAlerts')} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety & Privacy */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="neo-card bg-[#FFFFFF] h-full">
            <CardHeader>
              <CardTitle className="text-lg text-[#172018] font-bold flex items-center">
                <Shield className="mr-2 h-5 w-5 text-[#15803D]" /> Safety & Privacy
              </CardTitle>
              <CardDescription className="text-[#4B5563] text-xs">Configure monitoring and data sharing options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0FDF4] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#172018] flex items-center"><Smartphone className="mr-1.5 h-4 w-4 text-[#15803D]" /> Auto Haptic Warnings</p>
                  <p className="text-xs text-[#6B7280]">Vibrate device when entering High Risk zones</p>
                </div>
                <Switch checked={settings.autoHapticWarnings} onCheckedChange={() => handleToggle('autoHapticWarnings')} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F0FDF4] transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#172018] flex items-center"><Eye className="mr-1.5 h-4 w-4 text-[#15803D]" /> Anonymous Reporting</p>
                  <p className="text-xs text-[#6B7280]">Hide profile details when submitting reports</p>
                </div>
                <Switch checked={settings.anonymousReporting} onCheckedChange={() => handleToggle('anonymousReporting')} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
