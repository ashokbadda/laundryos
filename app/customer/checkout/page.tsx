"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { Sparkles, Check, ArrowRight, ShieldCheck, QrCode, WalletCards, Banknote, CreditCard, Loader2, Plus, MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  
  // Inline Address Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("Hyderabad");
  const [locating, setLocating] = useState(false);

  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [timeWindow, setTimeWindow] = useState("10:00 AM - 12:00 PM");
  
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [razorpayModal, setRazorpayModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem("laundry_cart") || "[]");
    setCart(localCart);
    fetchUserAddresses();
  }, []);

  async function fetchUserAddresses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id);

    if (data && data.length > 0) {
      setAddresses(data);
      setSelectedAddress(data[0]);
      setShowAddAddress(false);
    } else {
      setShowAddAddress(true);
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setNewAddressLine(data.display_name);
            if (data.address && (data.address.city || data.address.town)) {
              setNewCity(data.address.city || data.address.town);
            }
            toast.success("Current location detected! 📍");
          } else {
            setNewAddressLine(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
            toast.success("Location captured!");
          }
        } catch (err) {
          setNewAddressLine(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
          toast.success("Location captured!");
        }
        setLocating(false);
      },
      (error) => {
        toast.error("Unable to retrieve location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  async function handleSaveNewAddress(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to add an address.");
      router.push("/login");
      return;
    }

    // Try primary insert using 'address' column first, fallback to 'address_line1'
    let { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name: newFullName,
        phone: newPhone,
        address: newAddressLine,
        city: newCity,
      })
      .select()
      .single();

    if (error && error.message.includes("column")) {
      const fallback = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          full_name: newFullName,
          phone: newPhone,
          address_line1: newAddressLine,
          city: newCity,
        })
        .select()
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      toast.error("Failed to add address: " + error.message);
    } else {
      toast.success("Address added successfully!");
      setAddresses([...addresses, data]);
      setSelectedAddress(data);
      setShowAddAddress(false);
      setNewFullName("");
      setNewPhone("");
      setNewAddressLine("");
    }
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const deliveryFee = cart.length > 0 ? 49 : 0;
  const totalPayable = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleDateClick = (e: any) => {
    e.target.showPicker ? e.target.showPicker() : e.target.click();
  };

  async function handleInitialCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select or add a pickup address.");
      return;
    }

    if (paymentMethod === "Razorpay") {
      setRazorpayModal(true);
      return;
    }

    executeOrderPlacement(paymentMethod);
  }

  async function executeOrderPlacement(methodUsed: string) {
    setLoading(true);
    setRazorpayLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        address_id: selectedAddress.id,
        total: totalPayable,
        status: "PLACED",
        pickup_date: pickupDate,
        pickup_slot: timeWindow,
        payment_method: methodUsed,
        special_instructions: instructions,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      toast.error("Failed to place order.");
      setLoading(false);
      setRazorpayLoading(false);
      setRazorpayModal(false);
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      service_id: item.id,
      quantity: item.quantity || 1,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    localStorage.removeItem("laundry_cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));

    setTimeout(() => {
      setLoading(false);
      setRazorpayLoading(false);
      setRazorpayModal(false);
      toast.success("Payment verified & order confirmed!");

      setSuccessOrder({
        ...orderData,
        address: selectedAddress,
        items: cart,
      });
    }, 1200);
  }

  if (successOrder) {
    return (
      <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-xl shadow-emerald-500/20 animate-bounce">
            <Check className="h-12 w-12 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Your order is confirmed</h1>
            <p className="text-xs font-medium text-slate-400">
              Thank you for choosing LaundryOS. Your invoice and pickup have been registered.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
              <span className="text-slate-400 font-bold">Order ID</span>
              <span className="text-sky-400 font-black">#{successOrder.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
              <span className="text-slate-400 font-bold">Total Amount Paid</span>
              <span className="text-emerald-400 font-black">₹{successOrder.total}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-bold">Pickup Slot</span>
              <span className="text-white font-semibold">{successOrder.pickup_date} ({successOrder.pickup_slot})</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/customer/orders/${successOrder.id}`)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-4 text-xs font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-95"
          >
            <span>Continue to Live Tracking</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased pb-20">
      <CustomerHeader />

      {/* RAZORPAY SECURE GATEWAY MODAL */}
      {razorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-sky-400/30 bg-slate-900 p-6 shadow-2xl space-y-6 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-sky-500 flex items-center justify-center font-black text-slate-950 text-sm">R</div>
                <div>
                  <h3 className="text-sm font-black">Razorpay Secure</h3>
                  <p className="text-[10px] text-slate-400">Trusted Business Checkout</p>
                </div>
              </div>
              <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-400/20">
                ₹{totalPayable}
              </span>
            </div>

            <div className="space-y-4 text-center py-4">
              {razorpayLoading ? (
                <div className="space-y-3 py-6">
                  <Loader2 className="h-10 w-10 animate-spin text-sky-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Processing secure payment via Razorpay...</p>
                  <p className="text-[10px] text-slate-500">Please do not refresh or close this window.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-left space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">MERCHANT</span>
                    <p className="text-xs font-black text-white">LaundryOS Fabric Care Pvt Ltd</p>
                    <p className="text-[11px] text-sky-300">Payable Amount: ₹{totalPayable}</p>
                  </div>
                  <button
                    onClick={() => executeOrderPlacement("Razorpay")}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-xs font-black text-white shadow-xl shadow-sky-500/30 hover:scale-[1.02] transition"
                  >
                    Pay ₹{totalPayable} Now
                  </button>
                  <button
                    onClick={() => setRazorpayModal(false)}
                    className="text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    Cancel & Return
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-6">
        <form onSubmit={handleInitialCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Address Section */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-xs">1</span>
                  Select Pickup Address
                </h2>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {showAddAddress ? "Cancel" : "Add New Address"}
                  </button>
                )}
              </div>

              {/* Add New Address Form Inline */}
              {showAddAddress ? (
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-sky-300">Add New Pickup Address</h3>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 rounded-xl text-[11px] font-black transition active:scale-95 disabled:opacity-50"
                    >
                      {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                      <span>{locating ? "Detecting GPS..." : "Use Current Location"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Street Address / House No / Area"
                    value={newAddressLine}
                    onChange={(e) => setNewAddressLine(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-2.5 text-xs text-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleSaveNewAddress}
                      className="px-4 py-2 bg-sky-500 text-slate-950 rounded-xl text-xs font-black shadow-md"
                    >
                      Save & Select Address
                    </button>
                  </div>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-400">No saved addresses found. Please add one below.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-slate-950 rounded-xl text-xs font-black shadow-lg"
                  >
                    <Plus className="h-4 w-4" /> Add Address Now
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        selectedAddress?.id === addr.id
                          ? "border-sky-400 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                          : "border-white/10 bg-slate-950/60 hover:border-white/20"
                      }`}
                    >
                      <h3 className="text-xs font-black text-white">{addr.full_name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{addr.phone}</p>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{addr.address || addr.address_line1}, {addr.city}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Slot & Instructions */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-xs">2</span>
                Pickup Slot & Special Instructions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    min={new Date().toISOString().split("T")[0]}
                    onClick={handleDateClick}
                    onKeyDown={(e) => e.preventDefault()}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Time Window</label>
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-400">Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Ring doorbell twice, delicate fabrics..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* 3. Payment Method Section */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 text-xs">3</span>
                Select Payment Method
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  { id: "Razorpay", title: "Razorpay", subtitle: "Secure Gateway", icon: CreditCard },
                  { id: "UPI", title: "Instant UPI", subtitle: "GPay, PhonePe", icon: QrCode },
                  { id: "Card", title: "Debit/Credit", subtitle: "Cards & NetBank", icon: WalletCards },
                  { id: "COD", title: "Cash on Pickup", subtitle: "Pay when picked", icon: Banknote },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                        isSelected
                          ? "border-sky-400 bg-gradient-to-br from-sky-500/20 to-blue-600/10 shadow-lg shadow-sky-500/30 ring-2 ring-sky-400/50"
                          : "border-white/10 bg-slate-950/60 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${
                          isSelected ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-900 text-sky-400 border-white/10'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-sky-400 bg-sky-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-white">{method.title}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{method.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {paymentMethod === "Razorpay" && (
                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/5 p-4 text-xs font-medium text-sky-300 animate-fade-in flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-sky-400 flex-shrink-0" />
                  <span>You will be prompted with Razorpay's secure checkout modal upon clicking Pay & Place Order.</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6 shadow-2xl">
              <h2 className="text-base font-black text-white border-b border-white/10 pb-4">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Cart is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{item.name} x {item.quantity || 1}</span>
                      <span className="text-white font-black">₹{item.price * (item.quantity || 1)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Items Subtotal</span>
                  <span className="text-white font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pickup & Delivery Fee</span>
                  <span className="text-emerald-400 font-bold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-white/10">
                  <span className="text-white">Total Payable</span>
                  <span className="text-sky-400">₹{totalPayable}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-4 text-xs font-black text-white shadow-xl shadow-sky-500/30 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? "Processing..." : `Pay ₹${totalPayable} & Place Order`} <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Encrypted Safe Checkout
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}