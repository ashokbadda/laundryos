"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { supabase } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Truck,
  Sparkles,
  ArrowLeft,
  MapPin,
  Shirt,
  Phone,
  Navigation,
  ShieldCheck,
  UserX,
  RefreshCw,
  Building2,
  Home,
  Check,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderTrackingDetails();

      const pollInterval = setInterval(() => {
        fetchOrderTrackingDetails(true);
      }, 3000);

      const channel = supabase
        .channel(`order-realtime-${orderId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          () => {
            fetchOrderTrackingDetails(true);
          }
        )
        .subscribe();

      return () => {
        clearInterval(pollInterval);
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  async function fetchOrderTrackingDetails(isBackground = false) {
    if (!isBackground) setLoading(true);

    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*, addresses(*)")
      .eq("id", orderId)
      .single();

    if (error) {
      if (!isBackground) toast.error("Failed to load tracking status.");
      setLoading(false);
      return;
    }

    setOrder(orderData);

    const driverId =
      orderData.driver_id ||
      orderData.delivery_partner_id ||
      orderData.delivery_person_id;

    if (driverId) {
      let { data: partnerData } = await supabase
        .from("delivery_partners")
        .select("*")
        .eq("id", driverId)
        .maybeSingle();

      if (!partnerData) {
        const { data: personData } = await supabase
          .from("delivery_persons")
          .select("*")
          .eq("id", driverId)
          .maybeSingle();
        partnerData = personData;
      }

      setDriver(partnerData || null);
    } else {
      setDriver(null);
    }

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("*, services(name, unit)")
      .eq("order_id", orderData.id);

    if (itemsData) {
      setOrderItems(itemsData);
    }

    setLoading(false);
    setRefreshing(false);
  }

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOrderTrackingDetails(false);
    toast.success("Tracking status updated! 🔄");
  };

  const driverName = driver?.full_name || driver?.name;
  const driverPhone = driver?.phone;
  const currentStatus = (order?.status || "").toLowerCase();

  // Dynamic Map Visual State Configurator
  const getMapState = () => {
    if (currentStatus.includes("delivered")) {
      return {
        progressWidth: "w-full",
        truckPosition: "right-8",
        statusText: "Delivered to Doorstep",
        subText: "Garments delivered successfully 🎉",
        icon: PackageCheck,
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        isDelivered: true,
      };
    }
    if (currentStatus.includes("out")) {
      return {
        progressWidth: "w-3/4",
        truckPosition: "right-24",
        statusText: `${driverName || "Rider"} En Route (0.8 km)`,
        subText: "Returning clean clothes back to you",
        icon: Truck,
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        isDelivered: false,
      };
    }
    if (
      currentStatus.includes("wash") ||
      currentStatus.includes("care") ||
      currentStatus.includes("cleaning")
    ) {
      return {
        progressWidth: "w-1/2",
        truckPosition: "left-1/2 -translate-x-1/2",
        statusText: "At Laundry Facility",
        subText: "Steam washing, pressing & quality check",
        icon: Shirt,
        badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/30",
        isDelivered: false,
      };
    }
    if (driverName || currentStatus.includes("confirmed")) {
      return {
        progressWidth: "w-1/4",
        truckPosition: "left-28",
        statusText: `${driverName || "Rider"} Assigned`,
        subText: "On the way to pick up your laundry",
        icon: Truck,
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        isDelivered: false,
      };
    }
    return {
      progressWidth: "w-12",
      truckPosition: "left-12",
      statusText: "Awaiting Rider Assignment",
      subText: "Order received, assigning nearest partner",
      icon: UserX,
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
      isDelivered: false,
    };
  };

  const mapState = getMapState();
  const TruckIcon = mapState.icon;

  const getStepStatus = (stepIndex: number) => {
    if (currentStatus.includes("delivered")) return "completed";
    if (stepIndex === 1) return "completed";

    if (stepIndex === 2) {
      if (
        driverName ||
        currentStatus.includes("confirmed") ||
        currentStatus.includes("wash") ||
        currentStatus.includes("out")
      ) {
        return "completed";
      }
      return "active";
    }

    if (stepIndex === 3) {
      if (currentStatus.includes("out")) return "completed";
      if (
        currentStatus.includes("wash") ||
        currentStatus.includes("care") ||
        currentStatus.includes("cleaning")
      ) {
        return "active";
      }
      return "pending";
    }

    if (stepIndex === 4) {
      if (currentStatus.includes("out")) return "active";
      return "pending";
    }

    return "pending";
  };

  const steps = [
    {
      title: "Order Confirmed",
      desc: "Pickup request placed & verified",
      time: "Confirmed",
    },
    {
      title: "Rider Assigned",
      desc: driverName
        ? `Assigned to ${driverName}`
        : "Awaiting driver assignment",
      time: driverName ? "Assigned" : "Pending",
    },
    {
      title: "In Wash & Care",
      desc: "Eco-steam cleaning & fabric pressing",
      time: currentStatus.includes("wash")
        ? "In Progress"
        : currentStatus.includes("out") || currentStatus.includes("delivered")
        ? "Completed"
        : "Pending",
    },
    {
      title: "Out for Delivery",
      desc: "Fresh clothes returning to your address",
      time: currentStatus.includes("delivered")
        ? "Delivered"
        : currentStatus.includes("out")
        ? "On the Way"
        : "Pending",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white pb-16">
      <div className="fixed -left-20 top-20 z-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -right-20 bottom-10 z-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10">
        <CustomerHeader />

        <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/customer/orders"
              className="inline-flex items-center gap-1.5 text-xs font-black text-sky-400 hover:text-sky-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Order History</span>
            </Link>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition active:scale-95"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-sky-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span>Refresh Status</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-sky-400 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-400">
                Loading live tracking updates...
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-6">
                {/* Dynamic Live Map Visualizer */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                  <div className="relative h-64 w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 flex items-center justify-center px-12">
                    {/* Background Progress Line */}
                    <div className="absolute left-12 right-12 h-1 bg-slate-800 rounded-full" />
                    <div
                      className={`absolute left-12 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 ${mapState.progressWidth}`}
                    />

                    {/* Doorstep Marker */}
                    <div className="absolute left-8 flex flex-col items-center gap-1 z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="rounded-md bg-slate-900/90 px-2 py-0.5 text-[9px] font-black text-sky-300 border border-white/10 backdrop-blur-md shrink-0">
                        Doorstep
                      </span>
                    </div>

                    {/* Facility Marker */}
                    <div className="absolute right-8 flex flex-col items-center gap-1 z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 border border-white/10 shadow-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="rounded-md bg-slate-900/90 px-2 py-0.5 text-[9px] font-black text-slate-400 border border-white/10 backdrop-blur-md shrink-0">
                        Laundry Hub
                      </span>
                    </div>

                    {/* Dynamic Moving Rider / Delivery Complete Marker */}
                    <div
                      className={`absolute flex flex-col items-center gap-1 transition-all duration-700 z-20 ${mapState.truckPosition}`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          mapState.isDelivered
                            ? "bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/30"
                            : "bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 animate-bounce"
                        } shadow-xl shadow-emerald-500/40`}
                      >
                        <TruckIcon className="h-6 w-6 stroke-[2.5]" />
                      </div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9px] font-black border backdrop-blur-md whitespace-nowrap ${mapState.badgeBg}`}
                      >
                        {mapState.statusText}
                      </span>
                    </div>
                  </div>

                  {/* Driver Details Bar */}
                  <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md">
                    {driverName ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                            <Navigation className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">
                              {driverName}
                            </p>
                            <p className="text-[10px] font-semibold text-emerald-400">
                              {mapState.subText}
                            </p>
                          </div>
                        </div>

                        {driverPhone && (
                          <a
                            href={`tel:${driverPhone}`}
                            className="flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-sky-500/20 transition active:scale-95"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call Rider</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-3 w-full justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                            <UserX className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">
                              Driver Not Assigned Yet
                            </p>
                            <p className="text-[10px] font-semibold text-amber-400">
                              Admin will assign a pickup agent shortly
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-sky-400" /> Live Status
                      Timeline
                    </h2>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {mapState.isDelivered ? "COMPLETED" : "ON SCHEDULE"}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {steps.map((step, idx) => {
                      const status = getStepStatus(idx + 1);

                      return (
                        <div
                          key={idx}
                          className="relative flex items-start justify-between gap-4"
                        >
                          <div
                            className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition-all ${
                              status === "completed"
                                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                                : status === "active"
                                ? "bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            {status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <p
                              className={`text-xs font-black ${
                                status === "pending"
                                  ? "text-slate-500"
                                  : "text-white"
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">
                              {step.desc}
                            </p>
                          </div>

                          <span className="text-[10px] font-extrabold text-slate-500 shrink-0">
                            {step.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Info Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block mb-1">
                      Tracking Order
                    </span>
                    <h2 className="text-xl font-black text-white">
                      Order #{order?.id}
                    </h2>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      Scheduled Date:{" "}
                      <span className="text-white font-bold">
                        {order?.pickup_date}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2 text-xs font-semibold text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Window</span>
                      <span className="text-white font-bold">
                        {order?.time_slot || "10:00 AM - 12:00 PM"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status</span>
                      <span className="text-emerald-400 font-bold">
                        {order?.payment_status || "Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black text-white">
                      <span>Total Amount</span>
                      <span className="text-sky-400">₹{order?.total}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sky-400" /> Pickup Location
                  </h3>
                  <p className="text-sm font-black text-white">
                    {order?.addresses?.full_name || "Customer Name"}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    {order?.addresses?.phone || "Phone Number"}
                  </p>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">
                    {order?.addresses?.address || order?.addresses?.street},{" "}
                    {order?.addresses?.city} - {order?.addresses?.pincode}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shirt className="h-4 w-4 text-sky-400" /> Garments Breakdown
                  </h3>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                    {orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between font-semibold"
                      >
                        <span className="text-white">
                          {item.services?.name || "Laundry Service"}
                        </span>
                        <span className="text-slate-400">
                          {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-extrabold text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Doorstep Pickup Protection Active</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}