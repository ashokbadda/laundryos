"use client";

import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { useCartStore } from "@/lib/store/cartStore";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Droplets,
  Sparkles,
} from "lucide-react";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 40 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white">
      {/* 1. RESPONSIVE LAUNDRY BACKGROUND IMAGE */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2000&auto=format&fit=crop')",
        }}
      />
      
      {/* Ambient Water Glow Blobs */}
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-900/65 to-slate-950/90 backdrop-blur-[3px] pointer-events-none" />

      {/* 2. MAIN PAGE CONTENT */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <CustomerHeader />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 flex-1 w-full">
          {/* Header Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-slate-900/80 px-3.5 py-1 text-xs font-black text-sky-300 backdrop-blur-md shadow-lg mb-3">
                <Droplets className="h-3.5 w-3.5 text-cyan-300 animate-pulse" /> Order Review
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md sm:text-4xl">
                Your Shopping Cart 🧺
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-300">
                Review added garments and proceed to schedule doorstep pickup
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs font-black text-red-300 backdrop-blur-md transition hover:bg-red-500/20 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Basket</span>
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-white/20 bg-slate-900/60 p-12 text-center backdrop-blur-xl shadow-2xl max-w-xl mx-auto my-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-300 mb-4 shadow-lg shadow-sky-500/10">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-white">Your cart is empty</h2>
              <p className="mt-1 text-xs text-slate-300 font-medium">
                Looks like you haven't added any laundry services yet.
              </p>
              <Link
                href="/customer/services"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Explore Services Catalog</span>
              </Link>
            </div>
          ) : (
            /* Active Cart Items & Total Summary */
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column: Garment List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/20 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:bg-slate-900/80"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-sky-400" />
                        <h3 className="text-base font-black text-white">{item.name}</h3>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Rate: <span className="text-sky-300 font-bold">₹{item.price}</span> / {item.unit}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {/* Interactive Quantity Selector */}
                      <div className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/20 p-1.5 backdrop-blur-md">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-sky-300 hover:bg-slate-900 font-black text-xs transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500 text-white hover:bg-sky-600 font-black text-xs transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Line Item Amount */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-lg font-black text-white">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/customer/services"
                    className="inline-flex items-center gap-2 text-xs font-black text-sky-400 hover:text-sky-300 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Add More Services to Basket</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="h-fit rounded-3xl border border-white/20 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
                <h2 className="text-lg font-black text-white border-b border-white/10 pb-4">
                  Cart Breakdown
                </h2>

                <div className="space-y-3 text-xs font-semibold text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pickup & Delivery Fee</span>
                    <span className="text-white font-bold">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-base font-black text-white">
                    <span>Grand Total</span>
                    <span className="text-sky-400">₹{grandTotal}</span>
                  </div>
                </div>

                <Link
                  href="/customer/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition active:scale-95"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-extrabold text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Doorstep pickup guaranteed</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}