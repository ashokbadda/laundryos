"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { Sparkles, Check, Truck, Phone } from "lucide-react";

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

function getStepIndex(status: string) {
  if (!status) return 0;
  const clean = status.trim().toUpperCase().replace(/[\s-]/g, "_");

  const exactIndex = STEPS.indexOf(clean);
  if (exactIndex !== -1) return exactIndex;

  if (clean.includes("PLACED") || clean.includes("PENDING") || clean.includes("WASH_AND_CARE")) return 0;
  if (clean.includes("ASSIGN") || clean.includes("CONFIRMED")) return 1;
  if (clean.includes("OUT_FOR_PICKUP") || clean.includes("PICKUP_SCHEDULED")) return 2;
  if (clean.includes("PICKED")) return 3;
  if (clean.includes("AT_FACILITY") || clean.includes("FACILITY") || clean.includes("RECEIVED")) return 4;
  if (clean.includes("IN_PROCESS") || clean.includes("PROCESS") || clean.includes("WASHING") || clean.includes("IRONING")) return 5;
  if (clean.includes("READY") || clean.includes("PACKED")) return 6;
  if (clean.includes("OUT_FOR_DELIVERY") || clean.includes("DISPATCH")) return 7;
  if (clean.includes("DELIVERED") || clean.includes("COMPLETE") || clean.includes("COMPLETED")) return 8;

  return 0;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;
  const [order, setOrder] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrderAndPartner(currentOrderId: any) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", currentOrderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        const driverId = orderData.driver_id || orderData.delivery_partner_id || orderData.delivery_person_id;
        
        if (driverId) {
          const { data: partnerData } = await supabase
            .from("delivery_partners")
            .select("*")
            .eq("id", driverId)
            .single();
          if (partnerData) setPartner(partnerData);
        } else {
          setPartner(null);
        }
      }
      setLoading(false);
    }

    fetchOrderAndPartner(orderId);

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
        async (payload) => {
          const updatedOrder = payload.new;
          setOrder(updatedOrder);
          const driverId = updatedOrder.driver_id || updatedOrder.delivery_partner_id || updatedOrder.delivery_person_id;
          
          if (driverId) {
            const { data: partnerData } = await supabase
              .from("delivery_partners")
              .select("*")
              .eq("id", driverId)
              .single();
            if (partnerData) setPartner(partnerData);
          } else {
            setPartner(null);
          }
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

  const currentStatus = (order.status || "PLACED").trim().toUpperCase();
  const currentStepIndex = getStepIndex(currentStatus);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased pb-20">
      <CustomerHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="border border-white/10 bg-slate-900/80 p-6 rounded-3xl backdrop-blur-xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Live Tracking
              </span>
              <h1 className="text-2xl font-black">Order Status Tracker</h1>
              <p className="text-xs text-slate-400 font-semibold">Order ID: #{order.id}</p>
            </div>
            <div>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black uppercase tracking-wider border border-sky-400/30 shadow-lg">
                Current State: {currentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Assigned Delivery Partner Box */}
          {partner && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sky-500/5 p-4 rounded-2xl border border-sky-400/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Assigned Delivery Partner</span>
                  <h3 className="text-sm font-black text-white">{partner.full_name}</h3>
                </div>
              </div>
              {partner.phone && (
                <a
                  href={`tel:${partner.phone}`}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 px-4 py-2 text-xs font-black text-sky-300 border border-sky-400/30 transition"
                >
                  <Phone className="h-3.5 w-3.5" /> {partner.phone}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Horizontal Progress Timeline */}
        <div className="border border-white/10 bg-slate-900/80 p-8 rounded-3xl backdrop-blur-xl overflow-x-auto">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-8">Lifecycle Progress</h2>
          
          <div className="flex items-center justify-between min-w-[850px] relative pb-4">
            {/* Background connecting bar */}
            <div className="absolute left-6 right-6 top-5 h-1 bg-slate-800 z-0" />
            
            {/* Active connecting bar */}
            <div 
              className="absolute left-6 top-5 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 z-0 transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 90}%` }}
            />

            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step} className="relative z-10 flex flex-col items-center text-center group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/30 shadow-xl shadow-sky-500/40 scale-125' 
                      : isCompleted 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                      : 'bg-slate-800 text-slate-500 border border-white/10'
                  }`}>
                    {isCompleted && !isCurrent ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`mt-3 text-[11px] font-black tracking-tight max-w-[90px] ${
                    isCurrent ? 'text-sky-400 font-extrabold scale-105' : isCompleted ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}