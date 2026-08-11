"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  BellRing,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 41821,
    totalOrders: 39,
    pendingPickups: 15,
    deliveredOrders: 8,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notification Broadcast Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Listen for new orders in real-time from customers
    const orderChannel = supabase
      .channel("admin-live-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          toast.success(`🔔 New Order #${payload.new.id} Received! (₹${payload.new.total})`);
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
    };
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && ordersData) {
      setRecentOrders(ordersData);
    }
    setLoading(false);
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !notifTitle || !notifMessage) {
      toast.error("Please fill in all notification fields.");
      return;
    }

    setSending(true);

    // Flexible lookup across addresses (phone or name)
    let targetUserId = null;
    const { data: addressMatch } = await supabase
      .from("addresses")
      .select("user_id")
      .or(`phone.ilike.%${customerEmail}%,full_name.ilike.%${customerEmail}%`)
      .maybeSingle();

    if (addressMatch) {
      targetUserId = addressMatch.user_id;
    } else {
      // Check if input is an Order ID
      const { data: orderMatch } = await supabase
        .from("orders")
        .select("user_id")
        .eq("id", isNaN(Number(customerEmail)) ? 0 : Number(customerEmail))
        .maybeSingle();

      if (orderMatch) {
        targetUserId = orderMatch.user_id;
      }
    }

    // Insert notification (safely allowing null user_id for global broadcast or direct insert)
    const { error: insertError } = await supabase.from("notifications").insert({
      user_id: targetUserId || null,
      title: notifTitle,
      message: notifMessage,
      is_read: false,
    });

    setSending(false);

    if (insertError) {
      toast.error("Failed to send notification: " + insertError.message);
    } else {
      toast.success("Notification sent to customer successfully! 🔔");
      setShowNotifModal(false);
      setCustomerEmail("");
      setNotifTitle("");
      setNotifMessage("");
    }
  };

  return (
    <div className="space-y-6 text-white font-sans antialiased relative">
      {/* Top Header Bar with Exact Original Styling + Notification Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Admin Control Hub
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Real time revenue, order volume, and dispatch analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 px-4 py-2.5 text-xs font-black text-sky-300 shadow-lg transition active:scale-95"
          >
            <BellRing className="h-4 w-4 text-sky-400" />
            <span>Send Notification</span>
          </button>

          <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/20 transition active:scale-95">
            <span>+ New Order</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            TOTAL REVENUE
          </span>
          <h3 className="text-2xl font-black text-white">₹{stats.revenue}</h3>
          <p className="text-[11px] font-bold text-emerald-400">+12.7% growth</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            TOTAL ORDERS
          </span>
          <h3 className="text-2xl font-black text-white">{stats.totalOrders}</h3>
          <p className="text-[11px] font-bold text-sky-400">+8.4% this week</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            PENDING PICKUPS
          </span>
          <h3 className="text-2xl font-black text-white">{stats.pendingPickups}</h3>
          <p className="text-[11px] font-bold text-amber-400">Awaiting Dispatch</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
            DELIVERED ORDERS
          </span>
          <h3 className="text-2xl font-black text-white">{stats.deliveredOrders}</h3>
          <p className="text-[11px] font-bold text-emerald-400">98.2% accuracy rate</p>
        </div>
      </div>

      {/* Revenue & Analytics / Recent Orders Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-400" /> Revenue & Volume Analytics
            </h3>
            <span className="text-xs text-slate-400">Monthly store performance overview</span>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {[40, 65, 30, 85, 55, 70, 90, 100, 60, 80].map((h, i) => (
              <div key={i} className="w-full bg-slate-950 rounded-t-xl h-full flex items-end p-1">
                <div
                  className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Highest Value Orders
          </h3>
          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading feed...</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">No orders recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs"
                >
                  <div>
                    <p className="font-black text-white">Order #{order.id}</p>
                    <p className="text-[10px] text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-black text-sky-400">₹{order.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notification Broadcast Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BellRing className="h-4 w-4 text-sky-400" /> Broadcast Notification to Customer
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="block text-slate-300">Customer Name / Phone / Order ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter Customer Name, Phone, or Order ID..."
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300">Notification Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pickup Update"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300">Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type message for customer bell notification..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{sending ? "Sending..." : "Send Notification"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}