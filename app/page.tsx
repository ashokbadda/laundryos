"use client";

import { useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Shirt,
  ArrowRight,
  Zap,
  Calculator,
  Phone,
  Mail,
  ChevronDown,
  Star,
  Droplets,
  CheckCircle2,
} from "lucide-react";

export default function FreshLaundryLandingPage() {
  const [itemsCount, setItemsCount] = useState(5);
  const [serviceType, setServiceType] = useState<"fold" | "iron" | "dry">("fold");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getEstimatedPrice = () => {
    const rate = serviceType === "fold" ? 79 : serviceType === "iron" ? 99 : 149;
    return itemsCount * rate;
  };

  const categories = [
    {
      title: "Wash & Fold",
      subtitle: "Daily Wear & Casuals",
      price: "₹79 / kg",
      tag: "Popular",
      icon: Shirt,
      color: "from-sky-500/20 to-blue-600/20 text-sky-400 border-sky-500/30",
    },
    {
      title: "Wash & Steam Iron",
      subtitle: "Crisp Shirts & Trousers",
      price: "₹99 / kg",
      tag: "Best Value",
      icon: Zap,
      color: "from-cyan-500/20 to-teal-600/20 text-cyan-400 border-cyan-500/30",
    },
    {
      title: "Premium Dry Clean",
      subtitle: "Suits, Sarees & Ethnic",
      price: "From ₹120 / pc",
      tag: "Fabric Care",
      icon: Sparkles,
      color: "from-indigo-500/20 to-blue-600/20 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Shoe & Bag Spa",
      subtitle: "Sneakers & Leather Care",
      price: "From ₹299 / pair",
      tag: "Deep Clean",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30",
    },
  ];

  const faqs = [
    {
      q: "How does the doorstep pickup and delivery work?",
      a: "Our field agent arrives at your doorstep during your selected time slot, tags your laundry bag, and returns your garments fresh and steam-pressed in 24 hours.",
    },
    {
      q: "What detergent do you use for sensitive clothes?",
      a: "We use eco-friendly, non-toxic premium detergents and specialized fabric softeners tailored to delicate materials and sensitive skin.",
    },
    {
      q: "Is there a minimum order requirement?",
      a: "No minimum order requirement! Express doorstep pickup applies to all bookings across the city.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white selection:bg-sky-500 selection:text-white antialiased overflow-x-hidden">
      {/* Immersive Background Glow Orbs */}
      <div className="fixed -left-40 top-10 z-0 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed -right-40 bottom-10 z-0 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* Main Page Layout */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <CustomerHeader />

        {/* Hero Section */}
        <section className="relative py-12 md:py-24 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 md:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-black tracking-wide text-sky-300 shadow-lg backdrop-blur-xl">
                <Droplets className="h-4 w-4 animate-bounce text-cyan-400" />
                FLAT 20% OFF ON FIRST BOOKING
              </span>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                Fresh, Clean Laundry <br />
                <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Delivered to Your Doorstep.
                </span>
              </h1>

              <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                Book express pickup in 30 seconds. Professional fabric care, eco-steam washing, and real-time order tracking.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/customer/services"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition hover:scale-105 active:scale-95"
                >
                  Book Pickup Now <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#estimator"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-4 text-xs font-black text-slate-300 backdrop-blur-xl transition hover:bg-slate-800 hover:text-white"
                >
                  Calculate Cost
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10 text-xs font-extrabold text-slate-400">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-sky-400" /> Free Pickup over ₹499
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" /> 24H Turnaround
                </span>
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 Rating
                </span>
              </div>
            </div>

            {/* Hero Quick Order Widget */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl space-y-6 ring-1 ring-white/5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-lg">
                      <Shirt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Quick Express Order</h3>
                      <p className="text-[10px] font-bold text-slate-400">Pickup within 30 minutes</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Active Service
                  </span>
                </div>

                <div className="space-y-3 text-xs font-bold">
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
                    <span className="text-slate-400">Standard Wash & Iron</span>
                    <span className="text-sky-400 text-sm font-black">₹99 / kg</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
                    <span className="text-slate-400">Estimated Turnaround</span>
                    <span className="text-white">24 Hours</span>
                  </div>
                </div>

                <Link
                  href="/customer/services"
                  className="block w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-4 text-center text-xs font-black text-white shadow-lg shadow-sky-500/25 transition hover:opacity-90 active:scale-95"
                >
                  Explore Services Catalog →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Category Cards Section */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center space-y-2">
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">Our Expertise</span>
            <h2 className="text-2xl font-black text-white sm:text-3xl">Professional Fabric Care Categories</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/50 hover:shadow-sky-500/10"
                >
                  <div>
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`rounded-2xl border bg-gradient-to-tr ${cat.color} p-3 shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-xl border border-white/10 bg-slate-800/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
                        {cat.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white transition group-hover:text-sky-400">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">{cat.subtitle}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm font-black text-white">{cat.price}</span>
                    <Link
                      href="/customer/services"
                      className="flex items-center gap-1 text-xs font-black text-sky-400 hover:text-white transition"
                    >
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rate Estimator Section */}
        <section id="estimator" className="relative z-10 mx-auto max-w-4xl px-4 py-12 md:px-6 w-full">
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-2xl shadow-2xl sm:p-10 ring-1 ring-white/5">
            <div className="mb-8 text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1 text-xs font-black text-sky-300">
                <Calculator className="h-3.5 w-3.5" /> Instant Rate Calculator
              </span>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Calculate Your Wash Total
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-xs font-black uppercase tracking-wider text-slate-400">
                  1. Select Treatment Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setServiceType("fold")}
                    className={`rounded-2xl border p-3.5 text-center text-xs font-black transition ${
                      serviceType === "fold"
                        ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20"
                        : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Wash & Fold (₹79/kg)
                  </button>
                  <button
                    onClick={() => setServiceType("iron")}
                    className={`rounded-2xl border p-3.5 text-center text-xs font-black transition ${
                      serviceType === "iron"
                        ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20"
                        : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Wash & Iron (₹99/kg)
                  </button>
                  <button
                    onClick={() => setServiceType("dry")}
                    className={`rounded-2xl border p-3.5 text-center text-xs font-black transition ${
                      serviceType === "dry"
                        ? "border-sky-400 bg-sky-500/20 text-sky-300 shadow-lg shadow-sky-500/20"
                        : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    Dry Clean (₹149/pc)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                  <span>2. Quantity</span>
                  <span className="text-sky-400 font-black">{itemsCount} {serviceType === "dry" ? "Pieces" : "kg"}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(Number(e.target.value))}
                  className="h-2.5 w-full cursor-pointer rounded-lg bg-slate-950 accent-sky-500"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 sm:flex-row">
                <div>
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Total</span>
                  <span className="text-3xl font-black text-sky-400">₹{getEstimatedPrice()}</span>
                </div>

                <Link
                  href="/customer/services"
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-4 text-center text-xs font-black text-white shadow-lg shadow-sky-500/30 transition hover:opacity-90 active:scale-95"
                >
                  Proceed to Booking →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 mx-auto max-w-4xl px-4 py-12 md:px-6 w-full">
          <div className="mb-8 text-center space-y-2">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Frequently Asked Questions</h2>
            <p className="text-xs font-medium text-slate-400">Got questions about our pickup or washing process?</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs font-black text-white sm:text-sm transition hover:bg-white/5"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 text-sky-400 transition-transform duration-300 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="border-t border-white/10 p-5 pt-3 text-xs font-medium leading-relaxed text-slate-300 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 mt-auto border-t border-white/10 bg-slate-950 text-xs text-slate-400">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-6 md:grid-cols-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-lg font-black text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                LaundryOS
              </div>
              <p className="font-medium leading-relaxed text-slate-400">
                On-demand doorstep laundry and fabric care system built for speed and pristine freshness.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-white">Customer Care</h4>
              <ul className="space-y-2.5 font-bold">
                <li><Link href="/customer/services" className="hover:text-sky-400 transition">Services Catalog</Link></li>
                <li><Link href="/customer/cart" className="hover:text-sky-400 transition">My Basket</Link></li>
                <li><Link href="/customer/orders" className="hover:text-sky-400 transition">Track Orders</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-white">Admin Tools</h4>
              <ul className="space-y-2.5 font-bold">
                <li><Link href="/admin/dashboard" className="hover:text-sky-400 transition">Dashboard Overview</Link></li>
                <li><Link href="/admin/delivery" className="hover:text-sky-400 transition">Driver Dispatch</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-white">Support Hub</h4>
              <p className="flex items-center gap-2 font-bold text-slate-300">
                <Phone className="h-3.5 w-3.5 text-sky-400" /> +91 70361 06339
              </p>
              <p className="mt-2.5 flex items-center gap-2 font-bold text-slate-300">
                <Mail className="h-3.5 w-3.5 text-sky-400" /> support@laundryos.com
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 py-6 text-center font-bold text-slate-500">
            © {new Date().getFullYear()} LaundryOS Inc. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}