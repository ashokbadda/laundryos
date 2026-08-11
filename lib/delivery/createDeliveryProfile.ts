import { supabase } from "@/lib/supabase/client";

export async function createDeliveryProfile(user: any) {
  const { data } = await supabase
    .from("delivery_partners")
    .select("id")
    .eq("id", user.id)
    .single();

  if (data) return;

  const { error } = await supabase
    .from("delivery_partners")
    .insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || "Delivery Partner",
      phone: "",
      vehicle_type: "",
      vehicle_number: "",
    });

  if (error) throw error;
}