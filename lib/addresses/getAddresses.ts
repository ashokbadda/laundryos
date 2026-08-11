import { supabase } from "@/lib/supabase/client";

export async function getAddresses() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user is logged in.");
    return [];
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    throw error;
  }

  console.log("Addresses from Supabase:", data);

  return data ?? [];
}