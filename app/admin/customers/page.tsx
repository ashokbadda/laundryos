"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Users, Search, Phone, MapPin, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.full_name?.toLowerCase().includes(q) ||
            c.phone?.includes(q) ||
            c.city?.toLowerCase().includes(q) ||
            c.address?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, customers]);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load customer directory.");
    } else if (data) {
      setCustomers(data);
      setFilteredCustomers(data);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> User Database
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Customers Directory 👥
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Registered customer profiles, contact numbers, and delivery addresses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-center shadow-xs">
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Total Saved Locations
            </span>
            <span className="text-base font-black text-white">{customers.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400">Loading directory...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-xs font-bold text-slate-400">
          <Users className="mx-auto h-8 w-8 text-slate-600 mb-2" />
          No customer records found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-5 shadow-2xl transition hover:border-white/20 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/30 font-black text-sm text-sky-400 uppercase">
                  {cust.full_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">
                    {cust.full_name || "Customer Name"}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="h-3 w-3" /> Registered Customer
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span className="font-bold text-white">{cust.phone || "No Phone"}</span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span className="text-slate-400 leading-relaxed">
                    {cust.address || cust.street}, {cust.city} - {cust.pincode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}