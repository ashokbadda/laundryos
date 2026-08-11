import { supabase } from "@/lib/supabase/client";

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      total,
      status,
      created_at,
      addresses (
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}