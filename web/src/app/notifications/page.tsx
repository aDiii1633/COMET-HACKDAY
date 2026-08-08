"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldAlert, CheckCircle2, Loader2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/lib/api/services";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Array<{notification_id?: string, channel: string, title: string, body: string, timestamp?: string}>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await notificationsApi.list(50);
        setNotifications(data || []);
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const getIcon = (type: string) => {
    if (type === "PUSH") return <ShieldAlert className="h-5 w-5 text-[#B91C1C]" />;
    if (type === "SMS") return <CheckCircle2 className="h-5 w-5 text-[#15803D]" />;
    return <Info className="h-5 w-5 text-[#0369A1]" />;
  };

  const getColor = (type: string) => {
    if (type === "PUSH") return "bg-[#FEE2E2] border-[#B91C1C]/30";
    if (type === "SMS") return "bg-[#DCFCE7] border-[#86EFAC]";
    return "bg-[#E0F2FE] border-[#0369A1]/30";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#172018] tracking-tight flex items-center">
          <Bell className="mr-3 h-8 w-8 text-[#15803D]" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <Button variant="ghost" className="text-sm text-[#15803D] hover:text-[#14532D] hover:bg-[#DCFCE7]" onClick={() => setNotifications([])}>Mark all as read</Button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-[#15803D]" /></div>
          ) : notifications.map((notif, idx) => (
            <motion.div key={notif.notification_id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: idx * 0.05 }}>
              <Card className={`neo-card bg-[#FFFFFF] border ${getColor(notif.channel)} relative overflow-hidden`}>
                <CardContent className="p-4 flex gap-4">
                  <div className="mt-0.5">{getIcon(notif.channel)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[#172018] text-sm">{notif.title}</h3>
                      <span className="text-xs text-[#6B7280] font-medium">{notif.timestamp ? new Date(notif.timestamp).toLocaleDateString() : 'Just now'}</span>
                    </div>
                    <p className="text-sm text-[#4B5563] mt-1 font-normal leading-relaxed">{notif.body}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {!loading && notifications.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[#6B7280] font-medium py-10">No new notifications.</motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
