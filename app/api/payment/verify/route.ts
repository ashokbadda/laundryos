import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Please login again." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid user session." },
        { status: 401 }
      );
    }

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await request.json();

    if (
      !orderId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { success: false, error: "Payment details are missing." },
        { status: 400 }
      );
    }

    const generatedSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const signatureIsValid =
      generatedSignature.length === razorpay_signature.length &&
      timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signatureIsValid) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "Paid",
        status: "Confirmed",
      })
      .eq("id", Number(orderId))
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Could not verify payment." },
      { status: 500 }
    );
  }
}