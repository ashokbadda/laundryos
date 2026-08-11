"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Truck, CheckCircle2, UserCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<{ [orderId: number]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  async function fetchDeliveryData() {
    setLoading(true);

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(ordersData);
    }

    const { data: partnersData } = await supabase
      .from("delivery_partners")
      .select("id, full_name, phone, vehicle_type, is_available")
      .order("created_at", { ascending: false });

    if (partnersData) {
      setPartners(partnersData);
    }

    setLoading(false);
  }

  const handleAssignPartner = async (orderId: number) => {
    const partnerId = selectedPartners[orderId];

    if (!partnerId) {
      toast.error("Please select a delivery partner first.");
      return;
    }

    const assigned = partners.find((p) => p.id.toString() === partnerId.toString());

    // Primary attempt using driver_id and setting status to PICKUP_ASSIGNED
    let { error } = await supabase
      .from("orders")
      .update({
        driver_id: partnerId,
        status: "PICKUP_ASSIGNED",
      })
      .eq("id", orderId);

    // Fallback attempt using delivery_partner_id if schema column differs
    if (error && error.message.includes("schema cache")) {
      const fallback = await supabase
        .from("orders")
        .update({
          delivery_partner_id: partnerId,
          status: "PICKUP_ASSIGNED",
        })
        .eq("id", orderId);

      error = fallback.error;
    }

    if (error) {
      toast.error("Failed to assign partner: " + error.message);
    } else {
      toast.success(`Assigned ${assigned?.full_name || "Partner"} to Order #${orderId}! 🚚`);
      fetchDeliveryData();
    }
  };

  return (
    <div className="space-y-6 font-sans text-white antialiased">
      <div className="border-b border-white/10 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Logistics Operations
        </span>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Truck className="h-6 w-6 text-sky-400" /> Delivery Dispatch & Partner Assignment
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Assign partners and track doorstep pickup progress in real time.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400">Loading delivery queue...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-xs font-bold text-slate-400">
          No active orders available for dispatch.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const currentPartnerId = order.driver_id || order.delivery_partner_id || order.delivery_person_id;
            const currentPartner = partners.find(
              (p) => p.id.toString() === (currentPartnerId ? currentPartnerId.toString() : "")
            );

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">
                      DELIVERY ORDER
                    </span>
                    <h2 className="text-xl font-black text-white">Order #{order.id}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Amount
                    </span>
                    <span className="text-lg font-black text-sky-400">₹{order.total}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="w-full sm:w-auto space-y-1">
                    <label className="block text-xs font-black text-slate-300">
                      Assign Delivery Partner
                    </label>
                    <select
                      value={selectedPartners[order.id] || currentPartnerId || ""}
                      onChange={(e) =>
                        setSelectedPartners({ ...selectedPartners, [order.id]: e.target.value })
                      }
                      className="w-full sm:w-72 rounded-xl border border-white/20 bg-slate-900 p-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        -- Select Partner ({partners.length} available) --
                      </option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.full_name} ({p.phone || p.vehicle_type || "Partner"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleAssignPartner(order.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Assign Partner</span>
                  </button>
                </div>

                {currentPartner && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Currently Assigned to: {currentPartner.full_name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}