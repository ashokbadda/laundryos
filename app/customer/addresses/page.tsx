"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import CustomerHeader from "@/components/layout/CustomerHeader";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  LogIn,
  UserPlus,
  ShieldAlert,
  MapPin,
  LocateFixed,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address?: string;
  street?: string;
  city: string;
  pincode: string;
  is_default: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Nizamabad");
  const [pincode, setPincode] = useState("503704");
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    checkAuthAndFetchAddresses();
  }, []);

  async function checkAuthAndFetchAddresses() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("is_default", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
    setLoading(false);
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            const autoStreet = [
              addr.road || addr.suburb || addr.neighbourhood,
              addr.village || addr.town || addr.city_district || addr.county,
            ]
              .filter(Boolean)
              .join(", ");

            setAddress(autoStreet || data.display_name);

            if (addr.city || addr.town || addr.state_district) {
              setCity(addr.city || addr.town || addr.state_district);
            }
            if (addr.postcode) {
              setPincode(addr.postcode);
            }

            toast.success("GPS Location detected! 📍");
          }
        } catch {
          toast.error("Failed to retrieve address from GPS.");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        toast.error("Unable to access GPS location. Please allow permission.");
        setDetecting(false);
      }
    );
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address || !pincode) {
      toast.error("Please fill in all address fields.");
      return;
    }

    setSubmitting(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsAuthenticated(false);
      setSubmitting(false);
      return;
    }

    let { error } = await supabase.from("addresses").insert({
      user_id: session.user.id,
      full_name: fullName,
      phone,
      address: address,
      city,
      pincode,
      is_default: isDefault,
    });

    if (error && error.message.includes("column")) {
      const fallbackResult = await supabase.from("addresses").insert({
        user_id: session.user.id,
        full_name: fullName,
        phone,
        street: address,
        city,
        pincode,
        is_default: isDefault,
      });
      error = fallbackResult.error;
    }

    if (error) {
      toast.error("Failed to add address: " + error.message);
    } else {
      toast.success("New pickup address saved! 🎉");
      setFullName("");
      setPhone("");
      setAddress("");
      setIsDefault(false);
      checkAuthAndFetchAddresses();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) {
      toast.success("Address removed.");
      checkAuthAndFetchAddresses();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white pb-16">
      <CustomerHeader />

      {/* Hero Section Header */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-sky-100/70 via-sky-50 to-slate-50 py-10">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-black text-sky-700 shadow-sm mb-3">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" /> Doorstep Delivery Hub
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Manage Addresses 📍
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Save pickup and delivery locations for fast 1-click checkout
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Guest Guard Screen */}
        {isAuthenticated === false ? (
          <div className="mx-auto my-8 max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-950">
              Sign in to Save Addresses
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">
              To manage your doorstep pickup locations, please log in to your account or create a new one.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 rounded-2xl bg-sky-600 py-3.5 text-xs font-black text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-500 active:scale-95"
              >
                <LogIn className="h-4 w-4" /> Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-black text-slate-800 transition hover:bg-slate-50 active:scale-95"
              >
                <UserPlus className="h-4 w-4 text-sky-600" /> Register
              </Link>
            </div>
          </div>
        ) : (
          /* Logged-In Layout */
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Add Address Form */}
            <div className="h-fit rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <h2 className="flex items-center gap-2 text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                <Plus className="h-4 w-4 text-sky-600" /> Add New Address
              </h2>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={detecting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50/80 py-3 text-xs font-black text-sky-700 transition hover:bg-sky-100 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <LocateFixed className={`h-4 w-4 ${detecting ? "animate-spin" : ""}`} />
                <span>{detecting ? "Detecting GPS Location..." : "Use Current GPS Location"}</span>
              </button>

              <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                <div>
                  <label className="mb-1 block font-extrabold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Badda Ashok"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-extrabold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-extrabold text-slate-700">Street / House Address</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Flat No., Street, Village, Mandal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-extrabold text-slate-700">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-extrabold text-slate-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-bold text-slate-700">Set as default location</span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-3 w-full rounded-2xl bg-sky-600 py-3.5 text-xs font-black text-white shadow-md shadow-sky-600/20 transition hover:bg-sky-500 active:scale-95 disabled:bg-slate-300"
                >
                  {submitting ? "Saving Location..." : "Save Location"}
                </button>
              </form>
            </div>

            {/* Saved Address Cards */}
            <div className="space-y-4 lg:col-span-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Saved Locations
              </h2>

              {loading ? (
                <p className="text-xs font-semibold text-slate-400">Loading saved locations...</p>
              ) : addresses.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center text-xs font-semibold text-slate-500 shadow-sm">
                  <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No saved locations yet. Fill in the form to add a doorstep pickup address.
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex items-start justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300"
                  >
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-950">
                          {addr.full_name}
                        </span>
                        {addr.is_default && (
                          <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-black text-sky-700 border border-sky-200">
                            <CheckCircle2 className="h-3 w-3" /> DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-600">{addr.phone}</p>
                      <p className="font-medium text-slate-500 leading-relaxed max-w-md">
                        {addr.address || addr.street}, {addr.city} - {addr.pincode}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}