"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Users, Bell, Settings, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import AIAssistantWidget from "@/components/common/AIAssistantWidget";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Live Map", href: "/map", icon: Map },
  { name: "Guardians", href: "/guardians", icon: Users },
  { name: "Community", href: "/community", icon: AlertTriangle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#F7F9F7] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#FFFFFF] border-r border-[#DDE8DF] h-full z-20 shadow-xs">
        <div className="p-6 flex items-center space-x-3 border-b border-[#DDE8DF]">
          <div className="p-2 rounded-xl bg-[#DCFCE7]">
            <ShieldCheck className="h-6 w-6 text-[#15803D]" />
          </div>
          <span className="text-xl font-bold text-[#172018] tracking-tight">SafeSphere <span className="text-[#15803D]">AI</span></span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center space-x-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#DCFCE7] text-[#14532D] font-semibold shadow-xs' 
                    : 'text-[#4B5563] hover:bg-[#F0FDF4] hover:text-[#166534]'
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 bg-[#15803D] rounded-r-full"
                    />
                  )}
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-[#15803D]' : 'text-[#6B7280] group-hover:text-[#15803D]'}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-[#DDE8DF] space-y-1">
          <Link href="/notifications">
            <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
              pathname === "/notifications"
                ? 'bg-[#DCFCE7] text-[#14532D] font-semibold'
                : 'text-[#4B5563] hover:bg-[#F0FDF4] hover:text-[#166534]'
            }`}>
              <Bell className={`h-5 w-5 ${pathname === "/notifications" ? 'text-[#15803D]' : 'text-[#6B7280]'}`} />
              <span className="font-medium text-sm">Notifications</span>
            </div>
          </Link>
          <Link href="/settings">
            <div className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
              pathname === "/settings"
                ? 'bg-[#DCFCE7] text-[#14532D] font-semibold'
                : 'text-[#4B5563] hover:bg-[#F0FDF4] hover:text-[#166534]'
            }`}>
              <Settings className={`h-5 w-5 ${pathname === "/settings" ? 'text-[#15803D]' : 'text-[#6B7280]'}`} />
              <span className="font-medium text-sm">Settings</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-20 md:pb-0 bg-[#F7F9F7]">
        {/* Subtle Ambient Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#DCFCE7]/40 to-transparent pointer-events-none z-0" />
        <div className="relative z-10 w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
        <AIAssistantWidget />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#DDE8DF] z-50 pb-safe shadow-lg">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="relative p-2 flex flex-col items-center justify-center w-16">
                <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'text-[#15803D]' : 'text-[#6B7280]'}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-[#14532D]' : 'text-[#4B5563]'}`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-2 w-8 h-1 bg-[#15803D] rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
