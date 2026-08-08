import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { FloatingAssistant } from "@/components/chat/FloatingAssistant";
import { FloatingVoiceAgent } from "@/components/chat/FloatingVoiceAgent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SafeSphere AI",
  description: "Predict Danger Before It Happens - AI-powered Women Safety Platform",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <FloatingAssistant />
            <FloatingVoiceAgent />
            <Toaster position="top-center" toastOptions={{ className: "neo-card text-foreground font-medium border border-border", style: { background: "#FFFFFF", color: "#1F2937" } }} />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
