"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginDelivery } from "@/lib/delivery/loginDelivery";
import { createDeliveryProfile } from "@/lib/delivery/createDeliveryProfile";

export default function DeliveryLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const user = await loginDelivery(email, password);

      await createDeliveryProfile(user);

      router.push("/delivery/dashboard");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚚</div>

          <h1 className="text-3xl font-bold">
            Delivery Partner Login
          </h1>

          <p className="mt-2 text-slate-500">
            Login to manage pickups and deliveries
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-semibold">
              Email
            </label>

            <input
              type="email"
              placeholder="partner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Password
            </label>

            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border p-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login 🚚"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Customer?

          <Link
            href="/login"
            className="ml-2 font-semibold text-blue-600 hover:underline"
          >
            Login Here
          </Link>
        </div>
      </div>
    </main>
  );
}