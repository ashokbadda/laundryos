"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Clock,
  Droplets,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Account created successfully! 🎉");
      router.push("/customer/services");
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Glow Orbs */}
      <div className="fixed -left-40 top-10 z-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed -right-40 bottom-10 z-0 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none animate-pulse" />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl grid md:grid-cols-12 ring-1 ring-white/5">
        
        {/* Left Brand Panel */}
        <div className="md:col-span-5 relative bg-gradient-to-br from-sky-600/20 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 font-black">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Laundry<span className="text-sky-400">OS</span>
              </span>
            </Link>

            <div className="space-y-3 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-300">
                <Droplets className="h-3 w-3 text-cyan-400" /> Next-Gen Garment Care
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl leading-snug">
                Premium Doorstep Laundry Services.
              </h1>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                Join thousands of happy customers. Experience 30-second doorstep pickup scheduling, live order status, and eco-friendly steam cleaning.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Free doorstep pickup & delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <span>24-Hour express delivery option</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Non-toxic eco-friendly fabric detergent</span>
            </div>
          </div>

          <div className="pt-8 text-[10px] font-bold text-slate-500 border-t border-white/10 mt-6">
            © {new Date().getFullYear()} LaundryOS. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-950/60">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Create Account</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Sign up today and get <span className="text-sky-400 font-bold">FLAT 20% OFF</span> on your first laundry pickup
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Badda Ashok"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="9898898978"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-3.5 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center pt-2 text-xs font-semibold text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-sky-400 font-bold hover:underline">
                Log In Here
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 pt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>100% Safe & Secure Encryption</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}