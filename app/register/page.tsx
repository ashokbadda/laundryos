"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, Lock, Mail, User, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    // 1. Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // 2. Insert into profiles table
    if (authData.user) {
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        phone: phone,
        role: "customer",
      });
    }

    setLoading(false);
    toast.success("Account created successfully! 🎉");
    router.push("/customer/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-8 relative overflow-hidden">
        
        {/* Glowing backdrop ambient light */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Icon & Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/30 shadow-lg shadow-sky-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Create Account to <span className="text-sky-400">LaundryOS</span>
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Sign up today and get <strong className="text-sky-300 font-bold">FLAT 20% OFF</strong> on your first pickup.
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Badda Ashok"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">Mobile Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543122"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Link & Security */}
        <div className="text-center space-y-4 pt-2 border-t border-white/10 relative z-10">
          <p className="text-xs text-slate-400">
            Already have an account? <Link href="/login" className="text-sky-400 font-bold hover:underline">Log In Here</Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% Safe & Secure Encryption
          </div>
        </div>

      </div>
    </div>
  );
}