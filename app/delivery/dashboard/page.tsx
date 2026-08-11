"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Bike, CheckCircle, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function DeliveryDashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from("delivery_tasks")
      .select("*, orders(*, addresses(*))")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  }

  async function updateTaskStatus(taskId: number, orderId: number, newStatus: string) {
    const { error } = await supabase
      .from("delivery_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to update task: " + error.message);
      return;
    }

    // Also update order status state machine
    const orderStatus = newStatus === "accepted" ? "OUT_FOR_PICKUP" : "PICKED_UP";
    await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", orderId);

    toast.success(`Task marked as ${newStatus}! 🚴‍♂️`);
    fetchTasks();
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white p-4 max-w-md mx-auto pb-20">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Partner Portal
          </span>
          <h1 className="text-xl font-black">Assigned Deliveries</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
          <Bike className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading delivery tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-xs text-slate-400">
          No delivery tasks assigned right now.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const order = task.orders;
            const address = order?.addresses;

            return (
              <div
                key={task.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
                  <span className="font-black text-sky-400 uppercase tracking-wider">
                    {task.task_type.toUpperCase()} Task #{task.order_id}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-400 border border-amber-400/20">
                    {task.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-black text-white text-sm">{address?.full_name}</p>
                  <p className="text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                    <span>{address?.address || address?.street}, {address?.city} - {address?.pincode}</span>
                  </p>
                  <p className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{address?.phone}</span>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3 flex gap-2">
                  {task.status === "pending" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, order.id, "accepted")}
                      className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-3 text-xs font-black text-white transition active:scale-95"
                    >
                      Accept Task
                    </button>
                  )}
                  {task.status === "accepted" && (
                    <button
                      onClick={() => updateTaskStatus(task.id, order.id, "completed")}
                      className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-black text-slate-950 transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="h-4 w-4" /> Verify & Complete Pickup
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}