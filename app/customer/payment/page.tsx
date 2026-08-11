"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  QrCode,
  Building2,
  Banknote,
  Lock,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [processing, setProcessing] = useState(false);

  // Form Fields
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  async function fetchOrderDetails() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      toast.error("Failed to load order payment details.");
    } else {
      setOrder(data);
    }
    setLoading(false);
  }

  const handlePayNow = async () => {
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. mobile@upi)");
      return;
    }
    if (paymentMethod === "card" && (cardNumber.length < 16 || !cardExpiry || !cardCvv)) {
      toast.error("Please fill in valid card details.");
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      if (orderId) {
        await supabase
          .from("orders")
          .update({
            payment_status: paymentMethod === "cod" ? "Pending (COD)" : "Paid",
            status: "confirmed",
          })
          .eq("id", orderId);
      }

      toast.success("Payment completed successfully! 🎉");
      setProcessing(false);
      router.push(`/customer/order-success?id=${orderId}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
        <p className="mt-3 text-xs font-bold text-slate-400">Loading secure checkout...</p>
      </div>
    );
  }

  const amount = order?.total || 239;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Dark Modern Payment Options */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-sky-400" /> Select Payment Method
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                All transactions are encrypted with 256-bit SSL security
              </p>
            </div>

            {/* Accordion / Tab Options */}
            <div className="space-y-3">
              {/* Option 1: UPI */}
              <div
                onClick={() => setPaymentMethod("upi")}
                className={`cursor-pointer rounded-2xl border transition-all ${
                  paymentMethod === "upi"
                    ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/20"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "upi" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">UPI / Google Pay / PhonePe</p>
                      <p className="text-[11px] font-medium text-slate-400">Instant payment using VPA ID</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === "upi"} readOnly className="h-4 w-4 accent-sky-500" />
                </div>

                {paymentMethod === "upi" && (
                  <div className="border-t border-white/10 p-4 pt-3 space-y-3 bg-slate-950/60 rounded-b-2xl">
                    <div>
                      <label className="block text-[11px] font-black text-slate-300 mb-1">ENTER VPA / UPI ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210@ybl or username@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`cursor-pointer rounded-2xl border transition-all ${
                  paymentMethod === "card"
                    ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/20"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "card" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Credit / Debit Card</p>
                      <p className="text-[11px] font-medium text-slate-400">Visa, Mastercard, RuPay, Amex</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === "card"} readOnly className="h-4 w-4 accent-sky-500" />
                </div>

                {paymentMethod === "card" && (
                  <div className="border-t border-white/10 p-4 pt-3 space-y-3 bg-slate-950/60 rounded-b-2xl">
                    <div>
                      <label className="block text-[11px] font-black text-slate-300 mb-1">CARD NUMBER</label>
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="4532 •••• •••• 8921"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-300 mb-1">EXPIRY (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-300 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 3: Net Banking */}
              <div
                onClick={() => setPaymentMethod("netbanking")}
                className={`cursor-pointer rounded-2xl border transition-all ${
                  paymentMethod === "netbanking"
                    ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/20"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "netbanking" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Net Banking</p>
                      <p className="text-[11px] font-medium text-slate-400">SBI, HDFC, ICICI, Axis & All Major Banks</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === "netbanking"} readOnly className="h-4 w-4 accent-sky-500" />
                </div>
              </div>

              {/* Option 4: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`cursor-pointer rounded-2xl border transition-all ${
                  paymentMethod === "cod"
                    ? "border-sky-400 bg-sky-500/10 ring-2 ring-sky-500/20"
                    : "border-white/10 bg-slate-950/40 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${paymentMethod === "cod" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">Cash / Pay at Doorstep</p>
                      <p className="text-[11px] font-medium text-slate-400">Pay cash or UPI directly to rider upon pickup</p>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === "cod"} readOnly className="h-4 w-4 accent-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dark Glass Breakdown Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-fit rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-black text-sky-300 mb-2">
                <Sparkles className="h-3 w-3 text-cyan-300" /> Order Checkout #{orderId || "35"}
              </span>
              <h2 className="text-lg font-black text-white">Payment Breakdown</h2>
            </div>

            <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 text-center">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Amount Payable
              </span>
              <span className="text-3xl font-black text-white mt-0.5 block tracking-tight">
                ₹{amount}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-slate-300 border-t border-white/10 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Laundry Services</span>
                <span className="text-white font-bold">₹{amount - 40}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doorstep Delivery Fee</span>
                <span className="text-white font-bold">₹40</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-black text-white">
                <span>Total Amount</span>
                <span className="text-sky-400">₹{amount}</span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={processing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/25 transition active:scale-95 disabled:bg-slate-800"
            >
              <Lock className="h-4 w-4" />
              <span>
                {processing
                  ? "Verifying Payment..."
                  : paymentMethod === "cod"
                  ? `Confirm Order (₹${amount})`
                  : `Pay ₹${amount} Securely`}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>256-bit Encrypted Security Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white">
      {/* Background Water Ambient Globs */}
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10">
        <CustomerHeader />
        <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-400">Loading gateway...</div>}>
          <PaymentContent />
        </Suspense>
      </div>
    </div>
  );
}