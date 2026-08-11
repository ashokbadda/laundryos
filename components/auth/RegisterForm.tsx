"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email,
        role: "customer",
      });

      alert("Account created successfully!");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full Name"
        className="w-full rounded-xl border p-3"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-xl border p-3"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-xl border p-3"
      />

      <button
        className="w-full rounded-xl bg-blue-600 py-3 text-white"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  );
}