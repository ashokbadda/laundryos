"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Shirt, Plus, Trash2, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*");
    if (data) setServices(data);
    setLoading(false);
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("services").insert({
      name,
      description,
      price: parseFloat(price),
      unit,
    });

    if (error) {
      toast.error("Failed to create service: " + error.message);
    } else {
      toast.success("New laundry service added! ✨");
      setName("");
      setDescription("");
      setPrice("");
      fetchServices();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Service removed.");
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Pricing Matrix
        </span>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Shirt className="h-6 w-6 text-sky-400" /> Service Catalog Management
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          Add new services, modify pricing tiers, and manage customer offerings
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4 h-fit">
          <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <Plus className="h-4 w-4 text-sky-400" /> Add New Service
          </h2>

          <form onSubmit={handleAddService} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Steam Pressing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Brief service description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="kg" className="bg-slate-950">per kg</option>
                  <option value="piece" className="bg-slate-950">per piece</option>
                  <option value="pair" className="bg-slate-950">per pair</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-3.5 text-xs font-black text-white shadow-lg shadow-sky-500/25 transition active:scale-95 disabled:bg-slate-800"
            >
              {submitting ? "Saving..." : "Add Service"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
          {loading ? (
            <p className="text-xs font-bold text-slate-500">Loading catalog...</p>
          ) : (
            services.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">{item.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3 text-sky-400" /> Rate
                  </span>
                  <span className="text-sm font-black text-sky-400">
                    ₹{item.price} / {item.unit}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}