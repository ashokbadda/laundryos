import { supabase } from "@/lib/supabase/client";

// The official 9-step lifecycle + side states mapped to allowed transitions
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  "PLACED": ["PICKUP_ASSIGNED", "CANCELLED", "ON_HOLD"],
  "PICKUP_ASSIGNED": ["OUT_FOR_PICKUP", "CANCELLED", "ON_HOLD"],
  "OUT_FOR_PICKUP": ["PICKED_UP", "CANCELLED", "ON_HOLD"],
  "PICKED_UP": ["AT_FACILITY", "CANCELLED", "ON_HOLD"],
  "AT_FACILITY": ["IN_PROCESS", "ON_HOLD"],
  "IN_PROCESS": ["READY", "ON_HOLD"],
  "READY": ["OUT_FOR_DELIVERY", "ON_HOLD"],
  "OUT_FOR_DELIVERY": ["DELIVERED", "RETURNED", "ON_HOLD"],
  "DELIVERED": [],
  "CANCELLED": [],
  "ON_HOLD": ["PLACED", "PICKUP_ASSIGNED", "AT_FACILITY", "READY", "CANCELLED"],
  "RETURNED": []
};

export async function updateOrderStatus(orderId: number | string, newStatus: string, changedBy: string = "system") {
  try {
    // 1. Fetch current status of the order
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (fetchError || !orderData) {
      return { success: false, error: "Order not found: " + (fetchError?.message || "") };
    }

    const currentStatus = (orderData.status || "PLACED").trim().toUpperCase();
    const targetStatus = newStatus.trim().toUpperCase();

    // 2. Validate transition against state machine rules
    const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus] || [];
    
    if (currentStatus !== targetStatus && !allowedNextStates.includes(targetStatus)) {
      return { 
        success: false, 
        error: `Invalid transition from ${currentStatus} to ${targetStatus}.` 
      };
    }

    // 3. Update orders table status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: targetStatus })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: "Failed to update order: " + updateError.message };
    }

    // 4. Write audit log row to order_status_history
    const { error: historyError } = await supabase
      .from("order_status_history")
      .insert({
        order_id: orderId,
        status: targetStatus,
        changed_by: changedBy,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.warn("Warning: Failed to log status history:", historyError.message);
    }

    return { success: true, status: targetStatus };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error occurred in state machine." };
  }
}