"use client";

import { motion } from "framer-motion";
import { User, Shield, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("safesphere_token");
    setUser(null);
    toast.success("Logged out successfully.");
    router.push("/auth/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#172018] tracking-tight flex items-center">
        <User className="mr-3 h-8 w-8 text-[#15803D]" /> Profile
      </h1>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="neo-card bg-[#FFFFFF]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#172018]">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-[#DDE8DF]">
              <div className="h-16 w-16 rounded-full bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center">
                <User className="h-8 w-8 text-[#15803D]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#172018]">{user?.user_metadata?.full_name || "Aditya Kumar"}</p>
                <p className="text-sm font-medium text-[#4B5563]">{user?.email || "user@safesphere.ai"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Full Name</label>
                <Input defaultValue={user?.user_metadata?.full_name || "Aditya Kumar"} readOnly />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Email Address</label>
                <Input defaultValue={user?.email || "user@safesphere.ai"} readOnly />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Phone Number</label>
                <Input defaultValue="+91 98765 43210" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4B5563] mb-1 block">Emergency Profile</label>
                <Input defaultValue="Verified User" readOnly />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 bg-[#DCFCE7] border border-[#86EFAC] rounded-xl mt-4">
              <Shield className="h-5 w-5 text-[#15803D]" />
              <p className="text-sm font-semibold text-[#14532D]">Account protected by End-to-End Encryption & Supabase Auth</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Button onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl font-bold">
          <LogOut className="mr-2 h-5 w-5 text-[#FFFFFF]" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
