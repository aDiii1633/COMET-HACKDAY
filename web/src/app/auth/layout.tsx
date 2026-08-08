import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9F7] relative overflow-hidden">
      {/* Soft Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-[#DCFCE7]/60 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-[#DCFCE7]/40 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#DCFCE7] border border-[#86EFAC]">
              <ShieldCheck className="h-7 w-7 text-[#15803D]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#172018]">SafeSphere <span className="text-[#15803D]">AI</span></span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
