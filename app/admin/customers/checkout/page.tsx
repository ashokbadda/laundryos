"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cartStore";

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setLoadingAddresses(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingAddresses(false);
      return;
    }

    const { data, error } = await supabase
      .from("addresses")
      .select(
        `
          id,
          full_name,
          phone,
          address,
          city,
          pincode,
          is_default
        `
      )
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("ADDRESS ERROR:", error);
      alert("Could not load your saved addresses.");
      setLoadingAddresses(false);
      return;
    }

    const savedAddresses = data || [];

    setAddresses(savedAddresses);

    const defaultAddress = savedAddresses.find(
      (item) => item.is_default
    );

    if (defaultAddress) {
      setSelectedAddressId(String(defaultAddress.id));
    } else if (savedAddresses.length > 0) {
      setSelectedAddressId(String(savedAddresses[0].id));
    }

    setLoadingAddresses(false);
  }

  function placeOrder() {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select a pickup address.");
      return;
    }

    if (!pickupDate) {
      alert("Please select a pickup date.");
      return;
    }

    if (!pickupSlot) {
      alert("Please select a pickup time slot.");
      return;
    }

    alert(
      "Pickup details are ready. Next we will save the complete order in Supabase."
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-semibold text-blue-600">LaundryOS</p>

          <h1 className="mt-1 text-4xl font-bold text-slate-900">
            Book a Pickup
          </h1>

          <p className="mt-2 text-slate-500">
            Confirm your service, pickup address, and preferred time.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <p className="text-xl font-bold">Your cart is empty.</p>

            <p className="mt-2 text-slate-500">
              Add a laundry service before booking a pickup.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            <section className="space-y-8 lg:col-span-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Pickup Address</h2>

                  <a
                    href="/customers/addresses"
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Manage Addresses
                  </a>
                </div>

                {loadingAddresses ? (
                  <p className="mt-5 text-slate-500">
                    Loading saved addresses...
                  </p>
                ) : addresses.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5">
                    <p className="font-semibold">No saved address found.</p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add an address before booking a pickup.
                    </p>

                    <a
                      href="/customers/addresses"
                      className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      Add New Address
                    </a>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {addresses.map((item) => (
                      <label
                        key={item.id}
                        className={`block cursor-pointer rounded-2xl border p-5 transition ${
                          selectedAddressId === String(item.id)
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="pickup-address"
                            value={item.id}
                            checked={
                              selectedAddressId === String(item.id)
                            }
                            onChange={(event) =>
                              setSelectedAddressId(event.target.value)
                            }
                            className="mt-1 h-4 w-4"
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold">{item.full_name}</p>

                              {item.is_default && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-slate-600">
                              {item.phone}
                            </p>

                            <p className="mt-2 text-slate-700">
                              {item.address}
                            </p>

                            <p className="text-slate-700">
                              {item.city} - {item.pincode}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold">Pickup Details</h2>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold">
                      Pickup Date
                    </label>

                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={pickupDate}
                      onChange={(event) =>
                        setPickupDate(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Pickup Time
                    </label>

                    <select
                      value={pickupSlot}
                      onChange={(event) =>
                        setPickupSlot(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-600"
                    >
                      <option value="">Select a time slot</option>
                      <option value="8:00 AM - 10:00 AM">
                        8:00 AM - 10:00 AM
                      </option>
                      <option value="10:00 AM - 12:00 PM">
                        10:00 AM - 12:00 PM
                      </option>
                      <option value="12:00 PM - 2:00 PM">
                        12:00 PM - 2:00 PM
                      </option>
                      <option value="2:00 PM - 4:00 PM">
                        2:00 PM - 4:00 PM
                      </option>
                      <option value="4:00 PM - 6:00 PM">
                        4:00 PM - 6:00 PM
                      </option>
                    </select>
                  </div>
                </div>

                <label className="mb-2 mt-5 block font-semibold">
                  Pickup Instructions{" "}
                  <span className="text-slate-400">(optional)</span>
                </label>

                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(event) =>
                    setInstructions(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-600"
                  placeholder="Example: Ring the bell, call before arriving, or leave at reception."
                />
              </div>
            </section>

            <aside className="h-fit rounded-3xl bg-slate-900 p-6 text-white lg:col-span-2">
              <h2 className="text-2xl font-bold">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 border-b border-slate-700 pb-4"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.quantity} {item.unit}
                      </p>
                    </div>

                    <p className="font-bold">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button
                onClick={placeOrder}
                className="mt-7 w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-500"
              >
                Continue to Place Order
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}