"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  Search,
  Plus,
  Minus,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [cart, setCart] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    const localCart = JSON.parse(localStorage.getItem("laundry_cart") || "[]");
    const cartMap: { [id: number]: number } = {};
    localCart.forEach((item: any) => {
      cartMap[item.id] = item.quantity;
    });
    setCart(cartMap);
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      toast.error("Failed to load services catalog.");
    } else if (data) {
      setServices(data);
      setFilteredServices(data);
    }
    setLoading(false);
  }

  function filterServices() {
    let result = [...services];

    if (selectedCategory !== "All Services") {
      const queryCat = selectedCategory.toLowerCase();
      result = result.filter((s) => {
        const cat = (s.category || "").toLowerCase();
        const name = (s.name || "").toLowerCase();

        // Smart keyword mapping for database variations
        if (queryCat === "steam iron") {
          return cat.includes("iron") || name.includes("iron");
        }
        if (queryCat === "wash & fold") {
          return cat.includes("wash") || name.includes("wash") || name.includes("fold");
        }
        if (queryCat === "dry clean") {
          return cat.includes("dry") || name.includes("dry") || name.includes("suiting") || name.includes("saree");
        }
        if (queryCat === "formals") {
          return cat.includes("formal") || name.includes("formal") || name.includes("shirt") || name.includes("suit");
        }
        if (queryCat === "bedding") {
          return cat.includes("bed") || name.includes("bed") || name.includes("blanket");
        }
        if (queryCat === "footwear") {
          return cat.includes("shoe") || name.includes("shoe") || name.includes("footwear");
        }

        return cat.includes(queryCat);
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q)
      );
    }

    setFilteredServices(result);
  }

  const updateCart = (service: any, qty: number) => {
    const updated = { ...cart };
    if (qty <= 0) {
      delete updated[service.id];
    } else {
      updated[service.id] = qty;
    }
    setCart(updated);

    const cartArray = Object.keys(updated).map((id) => {
      const srv = services.find((s) => s.id.toString() === id);
      return {
        ...srv,
        quantity: updated[Number(id)],
      };
    });

    localStorage.setItem("laundry_cart", JSON.stringify(cartArray));
    
    // Dispatch custom event to update header instantly
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    toast.success(`Updated ${service.name} in cart! 🛒`);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white pb-20">
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10">
        <CustomerHeader />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-8">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Fresh Fabric Care Catalog
            </span>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Laundry & Dry Cleaning Rates
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Select items to schedule express doorstep pickup and fabric care.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["All Services", "Wash & Fold", "Steam Iron", "Formals", "Dry Clean", "Bedding", "Footwear"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-400">Loading catalog...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center text-xs font-bold text-slate-400 shadow-2xl">
              No services found matching your criteria.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredServices.map((service) => {
                const qty = cart[service.id] || 0;

                return (
                  <div
                    key={service.id}
                    className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl transition hover:border-white/20"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-black">
                          <Star className="h-3.5 w-3.5 fill-amber-400" /> 4.9
                        </span>
                        <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-300 border border-sky-400/20">
                          {service.category || "Fabric Care"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-white">{service.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {service.description || "Professional garment care."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          RATE
                        </span>
                        <span className="text-base font-black text-sky-400">
                          ₹{service.price} <span className="text-xs text-slate-400 font-normal">/{service.unit || "kg"}</span>
                        </span>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => updateCart(service, 1)}
                          className="flex items-center gap-1.5 rounded-2xl bg-sky-500 hover:bg-sky-400 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-sky-500/20 transition active:scale-95"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-3 py-1.5">
                          <button
                            onClick={() => updateCart(service, qty - 1)}
                            className="text-sky-300 hover:text-white transition"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black text-white w-5 text-center">{qty}</span>
                          <button
                            onClick={() => updateCart(service, qty + 1)}
                            className="text-sky-300 hover:text-white transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}