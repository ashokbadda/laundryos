import { supabase } from "@/lib/supabase/client";

export async function createOrderItems(
  orderId: number,
  items: any[]
) {
  const orderItems = items.map((item) => ({
    order_id: orderId,
    service_id: item.id,
    quantity: item.quantity,
    // Store total price for this item
    price: item.price * item.quantity,
  }));

  const { data, error } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (error) {
    console.error("Create Order Items Error:", error);
    throw error;
  }

  return data;
}