import { supabase } from "@/lib/supabase/client";

export async function getDashboardStats() {

  const [
    ordersResult,
    addressesResult,
    deliveryResult,
  ] = await Promise.all([

    supabase
      .from("orders")
      .select("total"),

    supabase
      .from("addresses")
      .select("id"),

    supabase
      .from("delivery_partners")
      .select("id"),

  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (addressesResult.error) throw addressesResult.error;
  if (deliveryResult.error) throw deliveryResult.error;

  const revenue =
    ordersResult.data?.reduce(
      (sum, order) => sum + Number(order.total),
      0
    ) || 0;

  return {

    totalOrders:
      ordersResult.data?.length || 0,

    totalRevenue:
      revenue,

    totalCustomers:
      addressesResult.data?.length || 0,

    totalDeliveryPartners:
      deliveryResult.data?.length || 0,

  };

}