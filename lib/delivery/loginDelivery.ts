import { supabase } from "@/lib/supabase/client";

export async function loginDelivery(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) throw error;

  return data.user;
}