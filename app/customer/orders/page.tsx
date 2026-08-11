"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  Package,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  total: number;
  status: string;
  payment_status: string;
  pickup_date: string;
  time_slot?: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load your order history.");
      } else if (data) {
        setOrders(data);
      }
    }
    setLoading(false);
  }

  const getStatusBadge = (status: string) => {
    const lower = (status || "").toLowerCase();
    if (lower.includes("delivered") || lower.includes("completed")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Delivered
        </span>
      );
    } else if (lower.includes("confirmed") || lower.includes("processing")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-sky-300 border border-sky-400/20">
          <Sparkles className="h-3 w-3" /> Confirmed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400 border border-amber-500/20">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const lower = (status || "").toLowerCase();
    if (lower.includes("paid")) {
      return (
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400 border border-emerald-500/20">
          Paid
        </span>
      );
    }
    return (
      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-400 border border-white/10">
        Pending
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white pb-16">
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10">
        <CustomerHeader />

        {/* Hero Header */}
        <section className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl py-10">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-black text-sky-300 shadow-sm mb-3">
              <Truck className="h-3.5 w-3.5 text-sky-400" /> Doorstep Pickup Tracker
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your Orders 📦
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Track live pickup status and review past laundry requests
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-400">Loading order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center shadow-2xl max-w-md mx-auto my-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/20 mb-4">
                <Package className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-black text-white">No orders placed yet</h2>
              <p className="mt-1 text-xs text-slate-400 font-medium">
                You haven't scheduled any laundry pickup orders yet.
              </p>
              <Link
                href="/customer/services"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Book Your First Service</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl transition hover:border-white/20"
                >
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-white">
                        Order #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                      {getPaymentBadge(order.payment_status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-sky-400" />
                        Pickup Date: <span className="font-bold text-white">{order.pickup_date}</span>
                      </span>

                      {order.time_slot && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-sky-400" />
                          <span className="font-bold text-white">({order.time_slot})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Total
                      </span>
                      <span className="text-lg font-black text-sky-400">
                        ₹{order.total}
                      </span>
                    </div>

                    <Link
                      href={`/customer/orders/${order.id}`}
                      className="flex items-center gap-1.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 px-4 py-2.5 text-xs font-black text-sky-300 transition active:scale-95"
                    >
                      <span>Track Shipment</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}