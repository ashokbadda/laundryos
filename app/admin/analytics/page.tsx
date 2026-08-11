"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalServices: 0,
    placed: 0,
    pickedUp: 0,
    washing: 0,
    ready: 0,
    delivered: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [
          ordersResult,
          servicesResult,
          customersResult,
          recentResult,
        ] = await Promise.all([
          supabase.from("orders").select("*"),
          supabase.from("services").select("*"),
          supabase.from("addresses").select("user_id"),
          supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const orders = ordersResult.data || [];
        const services = servicesResult.data || [];
        const addresses = customersResult.data || [];

        const uniqueCustomers = new Set(
          addresses.map((a: any) => a.user_id)
        );

        const revenue = orders.reduce(
          (sum: number, order: any) => sum + (order.total || 0),
          0
        );

        setStats({
          totalOrders: orders.length,
          totalCustomers: uniqueCustomers.size,
          totalRevenue: revenue,
          totalServices: services.length,

          placed: orders.filter((o: any) => o.status === "PLACED").length,

          pickedUp: orders.filter(
            (o: any) => o.status === "PICKED UP"
          ).length,

          washing: orders.filter(
            (o: any) => o.status === "WASHING"
          ).length,

          ready: orders.filter(
            (o: any) => o.status === "READY"
          ).length,

          delivered: orders.filter(
            (o: any) => o.status === "DELIVERED"
          ).length,
        });

        setRecentOrders(recentResult.data || []);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          Loading Analytics...
        </h1>
      </main>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: "👥",
    },
    {
      title: "Revenue",
      value: `₹${stats.totalRevenue}`,
      icon: "💰",
    },
    {
      title: "Services",
      value: stats.totalServices,
      icon: "🧺",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-8 text-4xl font-bold">
          📊 Analytics Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl bg-white p-6 shadow"
            >
              <div className="text-5xl">{card.icon}</div>

              <h2 className="mt-4 text-lg text-slate-500">
                {card.title}
              </h2>

              <p className="mt-2 text-4xl font-bold">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-6 shadow">

            <h2 className="mb-5 text-2xl font-bold">
              📊 Order Status
            </h2>

            <div className="space-y-3">

              <p>PLACED : {stats.placed}</p>

              <p>PICKED UP : {stats.pickedUp}</p>

              <p>WASHING : {stats.washing}</p>

              <p>READY : {stats.ready}</p>

              <p>DELIVERED : {stats.delivered}</p>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow">

            <h2 className="mb-5 text-2xl font-bold">
              📈 Recent Orders
            </h2>

            <div className="space-y-4">

              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="rounded-xl border p-4"
                >
                  <h3 className="font-bold">
                    Order #{order.id}
                  </h3>

                  <p>
                    {order.pickup_date}
                  </p>

                  <p>
                    {order.status}
                  </p>
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}