"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("[SafeSphere UI Error Boundary Caught Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-risk-danger/20 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10">
        <Card className="glass-card max-w-lg w-full border-risk-danger/30">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-risk-danger/10 flex items-center justify-center border border-risk-danger/30">
              <AlertTriangle className="h-8 w-8 text-risk-danger" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">
                SafeSphere encountered an unexpected UI error. Your safety monitoring remains active in the background if Demo Mode is enabled.
              </p>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-lg p-3 text-left overflow-x-auto">
              <code className="text-xs text-risk-medium font-mono">
                {error.message || "Unknown rendering error"}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={() => reset()} className="flex-1 bg-white hover:bg-white/90 text-black font-bold h-12 rounded-xl">
                <RefreshCcw className="mr-2 h-4 w-4" /> Try again
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'} variant="outline" className="flex-1 h-12 rounded-xl border-white/20 text-white hover:bg-white/10">
                <Home className="mr-2 h-4 w-4" /> Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
