import { supabase } from "@/lib/supabase/client";

export const ORDER_STATUSES = [
  "PLACED",
  "PICKUP_ASSIGNED",
  "OUT_FOR_PICKUP",
  "PICKED_UP",
  "AT_FACILITY",
  "IN_PROCESS",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export async function updateOrderStatus(
  orderId: number | string, 
  newStatus: string, 
  currentStatus: string, 
  userId?: string
) {
  // 1. Update the order status and timestamp
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  // 2. Insert into the status history tracking table
  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: orderId,
      previous_status: currentStatus,
      new_status: newStatus,
      changed_by: userId || null
    });

  if (historyError) throw historyError;
}