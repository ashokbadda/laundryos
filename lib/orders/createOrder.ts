import { supabase } from "@/lib/supabase/client";
import { createOrderItems } from "./createOrderItems";

export async function createOrder(orderData: any) {
  // Get logged in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in");
  }

  // Create Order
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: orderData.address_id,
      pickup_date: orderData.pickup_date,
      pickup_slot: orderData.pickup_slot,
      instructions: orderData.instructions,
      status: "PLACED",
      payment_status: "Pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Read cart from Zustand Persist (localStorage)
  let cartItems: any[] = [];

  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("laundry-cart");

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);

      console.log("Persisted Cart:", parsedCart);

      cartItems = parsedCart.state?.items || [];
    }
  }

  console.log("Cart Items:", cartItems);

  // Save order items
  if (cartItems.length > 0) {
    await createOrderItems(order.id, cartItems);
  }

  return order;
}