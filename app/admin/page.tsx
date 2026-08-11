"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { BarChart3, Package, Truck, Users, Sparkles, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ordersCount: 0,
    customersCount: 0,
    revenue: 0,
    pendingPickups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true });
        const { count: customersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer");
        const { data: ordersData } = await supabase.from("orders").select("total, status");

        let totalRev = 0;
        let pending = 0;
        ordersData?.forEach((o) => {
          totalRev += Number(o.total || 0);
          if (o.status === "PLACED" || o.status === "PICKUP_ASSIGNED") {
            pending++;
          }
        });

        setStats({
          ordersCount: ordersCount || 0,
          customersCount: customersCount || 0,
          revenue: totalRev,
          pendingPickups: pending,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 font-sans text-white antialiased pb-20">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Admin Control Hub
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Real-time revenue, order volume, and dispatch analytics for LaundryOS.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">₹{stats.revenue}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">+12.7% <ArrowUpRight className="h-3 w-3" /></span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Orders</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{stats.ordersCount}</span>
            <span className="text-xs font-bold text-sky-400 flex items-center">+8.4% <ArrowUpRight className="h-3 w-3" /></span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Pickups</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-amber-400">{stats.pendingPickups}</span>
            <span className="text-xs font-bold text-amber-400/80">Awaiting Dispatch</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registered Users</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyan-400">{stats.customersCount}</span>
            <span className="text-xs font-bold text-slate-400">Active Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}