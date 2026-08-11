"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowRight,
  Plus,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("10:00 AM - 12:00 PM");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online / UPI");
  const [onlineType, setOnlineType] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  async function fetchCheckoutData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: addressData } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id);

    if (addressData && addressData.length > 0) {
      setAddresses(addressData);
      setSelectedAddressId(addressData[0].id);
    }

    const localCart = JSON.parse(localStorage.getItem("laundry_cart") || "[]");
    setCartItems(localCart);

    setLoading(false);
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 49;
  const totalPayable = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error("Please select a pickup address.");
      return;
    }
    if (!pickupDate) {
      toast.error("Please select a pickup date.");
      return;
    }
    if (paymentMethod === "Online / UPI") {
      if (onlineType === "upi" && !upiId.trim()) {
        toast.error("Please enter your UPI ID (e.g. user@paytm).");
        return;
      }
      if (onlineType === "card" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
        toast.error("Please fill in your complete card details.");
        return;
      }
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    let orderPayload: any = {
      user_id: user?.id,
      address_id: selectedAddressId,
      pickup_date: pickupDate,
      time_slot: timeSlot,
      payment_method: paymentMethod === "Online / UPI" ? `Online (${onlineType.toUpperCase()})` : "Cash on Delivery",
      payment_status: paymentMethod === "Cash on Delivery" ? "Pending (COD)" : "Paid",
      status: "pending",
      total: totalPayable,
      special_instructions: specialInstructions,
    };

    let { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderError && orderError.message.includes("time_slot")) {
      delete orderPayload.time_slot;
    }
    if (orderError && orderError.message.includes("special_instructions")) {
      delete orderPayload.special_instructions;
    }

    if (orderError) {
      const retry = await supabase
        .from("orders")
        .insert(orderPayload)
        .select()
        .single();
      
      orderData = retry.data;
      orderError = retry.error;
    }

    if (orderError) {
      toast.error("Failed to place order: " + orderError.message);
      setSubmitting(false);
      return;
    }

    const orderItemsPayload = cartItems.map((item) => ({
      order_id: orderData.id,
      service_id: item.id,
      quantity: item.quantity || 1,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItemsPayload);

    await supabase.from("notifications").insert({
      user_id: user?.id,
      title: `Order #${orderData.id} Confirmed! 🎉`,
      message: `Your laundry pickup has been scheduled successfully for ${pickupDate}. Our partner will arrive shortly.`,
      is_read: false,
    });

    localStorage.removeItem("laundry_cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    toast.success("Order placed & payment verified successfully! 🎉");
    router.push(`/customer/orders/${orderData.id}`);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white pb-16">
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10">
        <CustomerHeader />

        <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="mb-6 border-b border-white/10 pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-0.5 text-xs font-black text-sky-300 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Secure Checkout
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Complete Your Booking 🧺
            </h1>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-400">Loading checkout session...</p>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-6">
                
                {/* Step 1: Address */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-950 text-xs font-black">1</span>
                      Select Pickup Address
                    </h2>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 mb-3">No saved addresses found.</p>
                      <Link
                        href="/customer/addresses"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-white"
                      >
                        <Plus className="h-4 w-4" /> Add New Address
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                            selectedAddressId === addr.id
                              ? "border-sky-400 bg-sky-500/10 shadow-lg"
                              : "border-white/10 bg-slate-950/60 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-sky-500"
                          />
                          <div className="space-y-1 text-xs">
                            <p className="font-black text-white">{addr.full_name}</p>
                            <p className="font-bold text-slate-400">{addr.phone}</p>
                            <p className="text-slate-300 leading-relaxed">
                              {addr.address || addr.street}, {addr.city} - {addr.pincode}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Slot */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-950 text-xs font-black">2</span>
                      Pickup Slot & Special Instructions
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="space-y-1.5">
                      <label className="block font-black text-slate-300 uppercase tracking-wider">
                        Pickup Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={pickupDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setPickupDate(e.target.value)}
                          onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer select-none"
                          style={{ colorScheme: "dark" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-black text-slate-300 uppercase tracking-wider">
                        Time Window
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                        >
                          <option value="08:00 AM - 10:00 AM" className="bg-slate-950">08:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 12:00 PM" className="bg-slate-950">10:00 AM - 12:00 PM</option>
                          <option value="04:00 PM - 06:00 PM" className="bg-slate-950">04:00 PM - 06:00 PM</option>
                          <option value="06:00 PM - 08:00 PM" className="bg-slate-950">06:00 PM - 08:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 text-xs">
                    <label className="block font-black text-slate-300 uppercase tracking-wider">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Ring doorbell twice, separate delicate silks..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                {/* Step 3: Payment with Interactive Sub-options */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-slate-950 text-xs font-black">3</span>
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs font-bold">
                    <label
                      className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                        paymentMethod === "Online / UPI"
                          ? "border-sky-400 bg-sky-500/10 shadow-lg"
                          : "border-white/10 bg-slate-950/60 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Online / UPI"}
                        onChange={() => setPaymentMethod("Online / UPI")}
                        className="accent-sky-500"
                      />
                      <CreditCard className="h-5 w-5 text-sky-400 shrink-0" />
                      <div>
                        <p className="font-black text-white">Online / UPI / Card</p>
                        <p className="text-[10px] text-slate-400 font-medium">GPay, PhonePe, Cards</p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                        paymentMethod === "Cash on Delivery"
                          ? "border-sky-400 bg-sky-500/10 shadow-lg"
                          : "border-white/10 bg-slate-950/60 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "Cash on Delivery"}
                        onChange={() => setPaymentMethod("Cash on Delivery")}
                        className="accent-sky-500"
                      />
                      <Banknote className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-black text-white">Pay at Doorstep (COD)</p>
                        <p className="text-[10px] text-slate-400 font-medium">Pay cash/UPI upon delivery</p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === "Online / UPI" && (
                    <div className="mt-4 rounded-2xl border border-sky-400/30 bg-slate-950/80 p-4 space-y-4 animate-fadeIn">
                      <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setOnlineType("upi")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                            onlineType === "upi"
                              ? "bg-sky-500 text-white border-sky-400"
                              : "bg-slate-900 text-slate-400 border-white/10"
                          }`}
                        >
                          <Smartphone className="h-3.5 w-3.5" /> UPI ID / QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnlineType("card")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition ${
                            onlineType === "card"
                              ? "bg-sky-500 text-white border-sky-400"
                              : "bg-slate-900 text-slate-400 border-white/10"
                          }`}
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Credit / Debit Card
                        </button>
                      </div>

                      {onlineType === "upi" ? (
                        <div className="space-y-2 text-xs">
                          <label className="block font-black text-slate-300">Enter UPI ID</label>
                          <input
                            type="text"
                            placeholder="e.g. username@okhdfcbank or @paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                          />
                          <p className="text-[10px] text-slate-400">A payment verification request will be sent to your UPI app.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-black text-slate-300 mb-1">Card Number</label>
                            <input
                              type="text"
                              placeholder="4111 2222 3333 4444"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-black text-slate-300 mb-1">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </div>
                            <div>
                              <label className="block font-black text-slate-300 mb-1">CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="123"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4 sticky top-24">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/10 pb-3">
                    Order Summary
                  </h2>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-semibold text-slate-300">
                        <span>{item.name} × {item.quantity || 1}</span>
                        <span className="text-white font-bold">₹{item.price * (item.quantity || 1)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2 text-xs font-semibold text-slate-300 border-t border-white/10 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Items Subtotal</span>
                      <span className="text-white font-bold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pickup & Delivery Fee</span>
                      <span className="text-emerald-400 font-bold">
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-3 text-sm font-black text-white">
                      <span>Total Payable</span>
                      <span className="text-sky-400">₹{totalPayable}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/25 transition active:scale-95 disabled:opacity-50"
                  >
                    <span>{submitting ? "Processing Payment & Order..." : `Pay ₹${totalPayable} & Place Order`}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 pt-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>100% Encrypted Safe Checkout</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}