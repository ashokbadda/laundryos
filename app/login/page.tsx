"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Shirt,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Invalid credentials: " + error.message);
    } else {
      toast.success("Welcome back! 👋");
      router.push("/customer/services");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Branding Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 p-12 text-white relative overflow-hidden">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            Laundry<span className="text-sky-200">OS</span>
          </Link>
        </div>

        <div className="max-w-md my-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md mb-4">
            <Truck className="h-3.5 w-3.5 text-amber-300" /> Doorstep Express Delivery
          </span>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Welcome Back to Fresh Laundry.
          </h1>
          <p className="mt-4 text-sm text-sky-100 leading-relaxed">
            Log in to schedule new pickups, track active wash orders, and manage saved delivery locations.
          </p>
        </div>

        <div className="text-xs text-sky-200">
          © {new Date().getFullYear()} LaundryOS. All rights reserved.
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2 font-black text-xl text-slate-900 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              Laundry<span className="text-sky-600">OS</span>
            </Link>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your account & orders
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Email Address */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 py-3.5 text-xs font-extrabold text-white shadow-md transition active:scale-95 disabled:bg-slate-300"
            >
              {loading ? "Signing In..." : "Log In to Account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-sky-600 hover:underline">
              Create Free Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 pt-4 border-t border-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}