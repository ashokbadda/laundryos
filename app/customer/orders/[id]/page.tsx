"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { Sparkles, CheckCircle2, Clock, Truck, Building2, PackageCheck } from "lucide-react";

const STEPS = [
  "PLACED",
  "PICKUP_ASSIGNED",
  "OUT_FOR_PICKUP",
  "PICKED_UP",
  "AT_FACILITY",
  "IN_PROCESS",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      if (data) setOrder(data);
      setLoading(false);
    }
    fetchOrder();

    // Realtime subscription to live updates
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-10 text-center font-bold">
        Order not found.
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased pb-20">
      <CustomerHeader />
      
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="border border-white/10 bg-slate-900/80 p-6 rounded-3xl backdrop-blur-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Live Tracking
          </span>
          <h1 className="text-2xl font-black">Order Status Tracker</h1>
          <p className="text-xs text-slate-400 font-semibold">Order ID: #{order.id}</p>
          <div className="pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-400/30">
              Current State: {order.status}
            </span>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="border border-white/10 bg-slate-900/80 p-6 rounded-3xl backdrop-blur-xl space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">Lifecycle Progress</h2>
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-white/10">
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = step === order.status;

              return (
                <div key={step} className="flex items-center gap-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-lg shadow-sky-500/30 scale-110' :
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-black ${isCurrent ? 'text-sky-400 text-sm' : isCompleted ? 'text-white' : 'text-slate-500'}`}>
                      {step.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}