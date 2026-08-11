"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Package, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

const ORDER_STATUSES = [
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, selectedFilter, orders]);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load orders.");
    } else if (data) {
      setOrders(data);
      setFilteredOrders(data);
    }
    setLoading(false);
  }

  function filterOrders() {
    let result = [...orders];

    if (selectedFilter !== "All") {
      result = result.filter((o) => (o.status || "").toUpperCase() === selectedFilter.toUpperCase());
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toString().includes(q) ||
          (o.addresses?.full_name || "").toLowerCase().includes(q) ||
          (o.addresses?.phone || "").toLowerCase().includes(q)
      );
    }

    setFilteredOrders(result);
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status: " + error.message);
    } else {
      toast.success(`Order #${orderId} status set to ${newStatus}! 🚀`);
      fetchOrders();
    }
  }

  return (
    <div className="space-y-6 font-sans text-white antialiased pb-20">
      <div className="border-b border-white/10 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Admin Control
        </span>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Package className="h-6 w-6 text-sky-400" /> Orders Management
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Track, filter, and modify live doorstep laundry bookings & lifecycle states.
        </p>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`rounded-xl px-3 py-2 text-[11px] font-black uppercase transition-all ${
                selectedFilter === status
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-xs font-bold text-slate-400">
          No orders found matching your criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentStatus = (order.status || "PLACED").trim().toUpperCase();

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">Order #{order.id}</span>
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-300 border border-sky-400/20">
                      {currentStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Customer: <strong className="text-white">{order.addresses?.full_name || "N/A"}</strong> ({order.addresses?.phone || "N/A"})
                  </p>
                  <p className="text-[11px] text-slate-500 truncate max-w-md">
                    {order.addresses?.address_line1 || order.pickup_address || "Address not provided"}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">TOTAL</span>
                    <span className="text-base font-black text-sky-400">₹{order.total || 0}</span>
                  </div>

                  <div className="relative">
                    <select
                      value={currentStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="rounded-xl border border-sky-400/30 bg-slate-950 px-4 py-2.5 text-xs font-black text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-lg"
                    >
                      {ORDER_STATUSES.map((step) => (
                        <option key={step} value={step} className="bg-slate-900 text-white font-bold">
                          {step.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}