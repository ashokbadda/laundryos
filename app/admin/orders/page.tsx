"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Package,
  Search,
  User,
  Phone,
  MapPin,
  Sparkles,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: number;
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
  pickup_date: string;
  time_slot?: string;
  addresses?: {
    full_name: string;
    phone: string;
    address?: string;
    street?: string;
    city: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  useEffect(() => {
    filterOrdersList();
  }, [searchQuery, statusFilter, orders]);

  async function fetchAdminOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load admin orders log.");
    } else if (data) {
      setOrders(data);
      setFilteredOrders(data);
    }
    setLoading(false);
  }

  function filterOrdersList() {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter(
        (o) => (o.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toString().includes(q) ||
          o.addresses?.full_name?.toLowerCase().includes(q) ||
          o.addresses?.phone?.includes(q) ||
          o.addresses?.city?.toLowerCase().includes(q)
      );
    }

    setFilteredOrders(result);
  }

  // Update Order Status (Auto-updates payment_status to 'Paid' when set to 'delivered')
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const updateData: { status: string; payment_status?: string } = {
      status: newStatus,
    };

    // Auto-mark payment as Paid when order is delivered
    if (newStatus === "delivered") {
      updateData.payment_status = "Paid";
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(
        newStatus === "delivered"
          ? `Order #${orderId} delivered & payment marked as Paid! 🎉`
          : `Order #${orderId} status set to ${newStatus}!`
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                ...(newStatus === "delivered" ? { payment_status: "Paid" } : {}),
              }
            : o
        )
      );
    }
  };

  // Explicit Payment Status Update
  const handlePaymentChange = async (orderId: number, newPaymentStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newPaymentStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update payment status.");
    } else {
      toast.success(`Order #${orderId} payment updated to ${newPaymentStatus}! 💳`);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o
        )
      );
    }
  };

  return (
    <div className="space-y-6 text-white font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Admin Control
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Orders Management 📦
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Track, filter, and modify live doorstep laundry bookings & payment status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-center shadow-xs">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Orders
            </span>
            <span className="text-base font-black text-white">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {["all", "pending", "confirmed", "wash_and_care", "out_for_delivery", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-3.5 py-2 text-xs font-black capitalize transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                  : "bg-slate-950/60 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400">Loading order records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-xs font-bold text-slate-400 shadow-2xl">
          <Package className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          No orders match your search criteria.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl transition hover:border-white/20"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-white">
                    Order #{order.id}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString()
                      : "Recent"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 font-black text-white">
                    <User className="h-3.5 w-3.5 text-sky-400" />
                    {order.addresses?.full_name || "Customer"}
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {order.addresses?.phone || "N/A"}
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-400 max-w-md truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    {order.addresses?.address || order.addresses?.street || "Address set"}, {order.addresses?.city}
                  </span>
                </div>
              </div>

              {/* Total & Controls */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-white/10 pt-3 lg:pt-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Total
                  </span>
                  <span className="text-lg font-black text-sky-400">
                    ₹{order.total}
                  </span>
                </div>

                {/* Order Status Select */}
                <div className="relative">
                  <select
                    value={order.status || "pending"}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="appearance-none rounded-2xl border border-white/20 bg-slate-950 px-3.5 py-2.5 pr-8 text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-xs"
                  >
                    <option value="pending" className="bg-slate-950 text-white">Pending</option>
                    <option value="confirmed" className="bg-slate-950 text-white">Confirmed</option>
                    <option value="wash_and_care" className="bg-slate-950 text-white">In Wash & Care</option>
                    <option value="out_for_delivery" className="bg-slate-950 text-white">Out for Delivery</option>
                    <option value="delivered" className="bg-slate-950 text-white">Delivered</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Payment Status Select */}
                <div className="relative">
                  <select
                    value={order.payment_status || "Pending"}
                    onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                    className={`appearance-none rounded-2xl border px-3.5 py-2.5 pr-8 text-xs font-black focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-xs ${
                      (order.payment_status || "").toLowerCase() === "paid"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <option value="Paid" className="bg-slate-950 text-emerald-400">Paid</option>
                    <option value="Pending" className="bg-slate-950 text-amber-400">Pending</option>
                    <option value="Pending (COD)" className="bg-slate-950 text-amber-400">Pending (COD)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}