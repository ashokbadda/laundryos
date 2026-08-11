import { supabase } from "@/lib/supabase/client";

export async function updateOrderStatus(
  orderId: number,
  status: string
) {
  const { error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", orderId);

  if (error) throw error;
}