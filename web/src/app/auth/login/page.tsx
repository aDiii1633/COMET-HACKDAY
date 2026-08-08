"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/useAuthStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const { user } = await authApi.login({
        email: values.email,
        password: values.password,
      });

      setUser({
        id: user.id,
        email: user.email,
        user_metadata: { full_name: user.name },
      } as unknown as import("@supabase/supabase-js").User);

      toast.success("Successfully logged in!");
      router.push("/dashboard");
    } catch (error: unknown) {
      toast.error((error as {message?: string})?.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-[#FFFFFF] border border-[#DDE8DF] shadow-xl rounded-2xl">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#172018]">Welcome back</CardTitle>
          <CardDescription className="text-[#4B5563] text-sm">
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#172018] font-semibold text-xs">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#B91C1C]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-[#172018] font-semibold text-xs">Password</FormLabel>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-xs text-[#15803D] hover:text-[#166534] font-semibold transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[#B91C1C]" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-[#15803D] hover:bg-[#166534] text-[#FFFFFF] font-bold h-11 rounded-xl shadow-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#FFFFFF]" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-[#4B5563]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#15803D] hover:text-[#166534] font-bold transition-colors">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
