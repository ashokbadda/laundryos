"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Search, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomersDirectory() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    // Fetch all profiles where role is 'customer'
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer");

    if (error) {
      toast.error("Failed to load customers.");
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  }

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-[10px] font-black text-sky-300">
            <Users className="h-3 w-3" /> User Database
          </span>
          <h1 className="text-2xl font-black text-white">Customers Directory 👥</h1>
          <p className="text-xs text-slate-400">
            Registered customer profiles, contact numbers, and delivery addresses
          </p>
        </div>

        {/* Stats Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Registered Customers</p>
          <span className="text-3xl font-black text-white">{customers.length}</span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-11 pr-4 py-4 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="grid gap-3">
            {filteredCustomers.map((c) => (
              <div key={c.id} className="rounded-2xl border border-white/10 bg-slate-900 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{c.full_name || "No Name"}</p>
                  <p className="text-[11px] text-slate-400">{c.email}</p>
                </div>
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-1 rounded-md font-bold">Customer</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center space-y-3">
            <Users className="h-10 w-10 text-slate-700 mx-auto" />
            <p className="text-xs font-bold text-slate-500">No customers found matching your search query.</p>
          </div>
        )}

      </div>
    </div>
  );
}