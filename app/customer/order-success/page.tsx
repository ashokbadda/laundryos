"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  Check,
  Calendar,
  Clock,
  ArrowRight,
  Download,
  Shirt,
  Sparkles,
  Printer,
  FileText,
  MapPin,
  Phone,
  User,
} from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  async function fetchOrderDetails() {
    setLoading(true);

    // Fetch order record
    const { data: orderData } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderData) {
      setOrder(orderData);

      // Fetch order items with service names
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*, services(name, unit)")
        .eq("order_id", orderData.id);

      if (itemsData) {
        setOrderItems(itemsData);
      }

      // Fetch pickup address
      if (orderData.address_id) {
        const { data: addressData } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", orderData.address_id)
          .single();

        if (addressData) {
          setAddress(addressData);
        }
      }
    }
    setLoading(false);
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-emerald-400 border-t-transparent" />
        <p className="mt-3 text-xs font-bold text-slate-400">Fetching order details...</p>
      </div>
    );
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = order?.total ? Math.max(0, order.total - subtotal) : 40;

  return (
    <>
      {/* 1. SCREEN VIEW (MODERN MOBILE MOCKUP) */}
      <div className="print:hidden">
        <CustomerHeader />

        <main className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center px-4 py-8">
          <div className="relative w-full overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Check className="h-8 w-8 stroke-[3]" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight">
                Order Confirmed!
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Transaction #TXN-{order?.id || orderId || "35"} completed
              </p>
            </div>

            <div className="relative z-10 my-6 flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3 text-sky-400">
                <Shirt className="h-7 w-7 animate-pulse" />
                <div className="text-left">
                  <p className="text-xs font-black text-white">Laundry & Fabric Care</p>
                  <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Pickup Express Active
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-semibold text-slate-300 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pickup Date</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {order?.pickup_date || "2026-08-29"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Time Window</span>
                <span className="font-extrabold text-white flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {order?.time_slot || "10:00 AM - 12:00 PM"}
                </span>
              </div>

              <div className="border-t border-dashed border-slate-800 my-2" />

              <div className="flex justify-between items-center text-sm font-black text-white">
                <span>Total Paid</span>
                <span className="text-emerald-400 text-lg">₹{order?.total || 239}</span>
              </div>
            </div>

            <div className="relative z-10 mt-6 space-y-3">
              <Link
                href="/customer/orders"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-4 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <span>Track My Order</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={handlePrint}
                className="flex w-full items-center justify-center gap-1.5 py-2 text-[11px] font-bold text-slate-400 hover:text-white transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Detailed Invoice PDF</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* 2. PRINT-ONLY PROFESSIONAL TAX INVOICE TEMPLATE */}
      <div className="hidden print:block font-sans text-slate-900 bg-white p-8 max-w-3xl mx-auto">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Laundry<span className="text-sky-600">OS</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              Fresh Fabric Care & Express Doorstep Pickup
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-md bg-slate-900 px-3 py-1 text-xs font-black text-white uppercase tracking-wider mb-1">
              Tax Invoice
            </span>
            <p className="text-xs font-extrabold text-slate-700">Invoice No: #INV-{order?.id || orderId || "35"}</p>
            <p className="text-xs font-semibold text-slate-500">
              Date: {order?.created_at ? new Date(order.created_at).toLocaleDateString() : "2026-08-11"}
            </p>
          </div>
        </div>

        {/* Customer & Booking Details */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
          <div className="rounded-xl border border-slate-300 p-4 space-y-1">
            <p className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-sky-600" /> Customer Information
            </p>
            <p className="font-bold text-slate-900 text-sm">{address?.full_name || "Vinay Kumar"}</p>
            <p className="font-semibold text-slate-600">Phone: {address?.phone || "+91 9876543210"}</p>
            <p className="font-medium text-slate-500 leading-relaxed">
              {address ? `${address.address || address.street}, ${address.city} - ${address.pincode}` : "Doorstep Address Selected"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 p-4 space-y-1">
            <p className="font-black text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-sky-600" /> Service Schedule
            </p>
            <p className="font-semibold text-slate-700">
              Pickup Date: <span className="font-black text-slate-900">{order?.pickup_date || "2026-08-29"}</span>
            </p>
            <p className="font-semibold text-slate-700">
              Time Slot: <span className="font-black text-slate-900">{order?.time_slot || "10:00 AM - 12:00 PM"}</span>
            </p>
            <p className="font-semibold text-slate-700">
              Payment Status: <span className="font-black text-emerald-700">{order?.payment_status || "Paid"}</span>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-900">
                <th className="py-3 px-3 font-black uppercase">Service Name</th>
                <th className="py-3 px-3 font-black uppercase text-center">Unit Price</th>
                <th className="py-3 px-3 font-black uppercase text-center">Qty</th>
                <th className="py-3 px-3 font-black uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orderItems.length > 0 ? (
                orderItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {item.services?.name || `Service #${item.service_id}`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600 text-center">
                      ₹{item.price} / {item.services?.unit || "piece"}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900 text-right">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td className="py-3 px-3 font-extrabold text-slate-900">Wash & Fold</td>
                    <td className="py-3 px-3 font-semibold text-slate-600 text-center">₹79 / kg</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 text-center">1</td>
                    <td className="py-3 px-3 font-black text-slate-900 text-right">₹79</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-extrabold text-slate-900">Dry Clean Shirt</td>
                    <td className="py-3 px-3 font-semibold text-slate-600 text-center">₹120 / piece</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 text-center">1</td>
                    <td className="py-3 px-3 font-black text-slate-900 text-right">₹120</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Calculations */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Subtotal</span>
              <span className="font-extrabold text-slate-900">₹{subtotal || 199}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-semibold">
              <span>Express Delivery Fee</span>
              <span className="font-extrabold text-slate-900">₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-black text-slate-900">
              <span>Grand Total Paid</span>
              <span className="text-sky-600">₹{order?.total || 239}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="border-t border-slate-300 pt-6 text-center text-[10px] font-semibold text-slate-500 space-y-1">
          <p>Thank you for choosing LaundryOS!</p>
          <p>This is a computer-generated tax invoice. No signature required.</p>
        </div>
      </div>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-400">Loading order receipt...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}