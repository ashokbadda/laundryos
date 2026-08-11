"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function login() {
    if (
      email === "admin@laundryos.com" &&
      password === "admin123"
    ) {
      localStorage.setItem("admin", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid admin credentials");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="mb-8 text-center text-3xl font-bold">
          👨‍💼 Admin Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border p-3"
        />

        <button
          onClick={login}
          className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>

      </div>

    </main>
  );
}