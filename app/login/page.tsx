"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function ModernLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/customer/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white selection:bg-sky-500 selection:text-white flex items-center justify-center px-4 overflow-x-hidden">
      {/* Immersive Background Glow Orbs */}
      <div className="fixed -left-40 top-10 z-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed -right-40 bottom-10 z-0 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-lg shadow-sky-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Welcome Back to <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">LaundryOS</span>
          </h1>
          <p className="text-xs font-medium text-slate-400">
            Sign in to manage your orders and track deliveries.
          </p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-xs font-bold text-white placeholder-slate-600 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-xs font-bold text-white placeholder-slate-600 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In to Portal <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Register Link */}
        <div className="text-center border-t border-white/10 pt-6">
          <p className="text-xs font-bold text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-sky-400 hover:text-sky-300 transition font-black">
              Create Account →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}