"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Sparkles, PackageCheck, ArrowRight, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function VendorDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilityOrders();
  }, []);

  async function fetchFacilityOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }

  async function updateOrderStatus(orderId: number, nextStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    toast.success(`Order #${orderId} moved to ${nextStatus}! 🧺`);
    fetchFacilityOrders();
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white p-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Facility Vendor Hub
          </span>
          <h1 className="text-2xl font-black">Processing Pipeline Queue</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
          <PackageCheck className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading facility queue...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-xs text-slate-400">
          No orders in processing queue.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">Order #{order.id}</span>
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 font-bold text-sky-300 border border-sky-400/20">
                    {order.status}
                  </span>
                </div>
                <p className="text-slate-300 font-semibold">Customer: {order.addresses?.full_name}</p>
                <p className="text-slate-400">Pickup Date: {order.pickup_date} ({order.time_slot})</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updateOrderStatus(order.id, "AT_FACILITY")}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-[11px] font-black text-white border border-white/10 transition"
                >
                  Mark Received
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, "IN_PROCESS")}
                  className="rounded-xl bg-sky-500/20 hover:bg-sky-500/30 px-3 py-2 text-[11px] font-black text-sky-300 border border-sky-400/30 transition"
                >
                  In Process
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, "READY")}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-2 text-[11px] font-black text-slate-950 transition flex items-center gap-1"
                >
                  Ready for Delivery <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}