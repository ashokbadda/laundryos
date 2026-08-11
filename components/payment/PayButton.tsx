"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cartStore";

type Props = {
  orderId: number;
};

export default function PayButton({ orderId }: Props) {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    if (!(window as any).Razorpay) {
      alert("Payment system is still loading. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please login again.");
        setLoading(false);
        return;
      }

      const createResponse = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      const createData = await createResponse.json();

      if (!createData.success) {
        alert(createData.error || "Could not start payment.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: createData.razorpayOrder.amount,
        currency: "INR",
        name: "LaundryOS",
        description: "Laundry Service Payment",
        order_id: createData.razorpayOrder.id,

        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const verifyResponse = await fetch(
            "/api/payment/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                orderId,
                ...response,
              }),
            }
          );

          const verifyData = await verifyResponse.json();

          if (!verifyData.success) {
            alert(
              verifyData.error || "Payment verification failed."
            );
            setLoading(false);
            return;
          }

          clearCart();

          router.replace(
            `/customer/order-success?id=${orderId}`
          );
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function () {
        alert("Payment failed. Please try again.");
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      alert("Something went wrong while starting payment.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="w-full rounded-xl bg-blue-600 px-8 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {loading ? "Opening Payment..." : "Pay Now"}
    </button>
  );
}