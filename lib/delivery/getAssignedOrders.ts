import { supabase } from "@/lib/supabase/client";

export async function getAssignedOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      pickup_date,
      pickup_slot,
      total,
      addresses (
        full_name,
        address_line,
        city,
        state
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}