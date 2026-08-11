"use client";

import { useState } from "react";
import { Settings, Save, Store, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("LaundryOS Nizamabad");
  const [supportPhone, setSupportPhone] = useState("07036106339");
  const [minOrder, setMinOrder] = useState("199");
  const [freeDeliveryMin, setFreeDeliveryMin] = useState("499");
  const [autoAssign, setAutoAssign] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Store configuration updated successfully! ⚙️");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-white/10 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Operational Rules
        </span>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-sky-400" /> Platform Settings
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          Configure operational rules, store thresholds, and system dispatch parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Store className="h-4 w-4" /> Store Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-xs font-bold">
            <div>
              <label className="block text-slate-300 mb-1.5">STORE NAME</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5">SUPPORT PHONE NUMBER</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        {/* Order Thresholds */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <ShieldCheck className="h-4 w-4" /> Order & Delivery Thresholds
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 text-xs font-bold">
            <div>
              <label className="block text-slate-300 mb-1.5">MINIMUM ORDER VALUE (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5">FREE DELIVERY MIN AMOUNT (₹)</label>
              <input
                type="number"
                value={freeDeliveryMin}
                onChange={(e) => setFreeDeliveryMin(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-8 py-4 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95"
        >
          <Save className="h-4 w-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
}