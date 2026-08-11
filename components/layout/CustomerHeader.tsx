"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Sparkles,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Package,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function CustomerHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Dynamic Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    checkUserSession();

    const updateCartBadge = () => {
      const localCart = JSON.parse(localStorage.getItem("laundry_cart") || "[]");
      const totalCount = localCart.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      );
      setCartCount(totalCount);
    };

    updateCartBadge();
    window.addEventListener("cartUpdated", updateCartBadge);
    window.addEventListener("storage", updateCartBadge);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchNotifications(session.user.id);
        }
      }
    );

    return () => {
      window.removeEventListener("cartUpdated", updateCartBadge);
      window.removeEventListener("storage", updateCartBadge);
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUserSession() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    setUser(currentUser || null);
    if (currentUser) {
      fetchNotifications(currentUser.id);
    }
  }

  async function fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  }

  const markAsRead = async (notifId: number) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowDropdown(false);
    localStorage.removeItem("laundry_cart");
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    toast.success("Signed out successfully!");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl font-sans text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 text-white transition group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight leading-none text-white block">
              Laundry<span className="text-sky-400">OS</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
              Fresh Fabric Care
            </span>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* My Orders Button */}
              <Link
                href="/customer/orders"
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-black text-slate-300 hover:text-white transition"
              >
                <Package className="h-3.5 w-3.5 text-sky-400" />
                <span>My Orders</span>
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowDropdown(false);
                  }}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white transition"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-black text-white ring-2 ring-slate-950 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900 p-3 shadow-2xl backdrop-blur-xl z-50 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Admin Notifications
                      </span>
                      <span className="text-[10px] font-bold text-sky-400">
                        {unreadCount} Unread
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs font-medium text-slate-400">
                          No notifications from admin yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition ${
                              n.is_read
                                ? "bg-slate-950/40 border-white/5 text-slate-400"
                                : "bg-sky-500/10 border-sky-400/30 text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black">{n.title}</p>
                              {!n.is_read && (
                                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] font-medium mt-1 leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-slate-500 mt-2 block">
                              {new Date(n.created_at).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <Link
                href="/customer/checkout"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-md shadow-sky-500/20 transition active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Cart ({cartCount})</span>
              </Link>

              {/* Logged In User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-black text-slate-200 hover:text-white transition"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Logged in as
                      </p>
                      <p className="text-xs font-black text-white truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/customer/orders"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <Package className="h-3.5 w-3.5 text-sky-400" />
                      <span>Order History</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-black text-slate-200 hover:text-white transition"
              >
                <LogIn className="h-3.5 w-3.5 text-sky-400" />
                <span>Login</span>
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-sky-500/20 transition active:scale-95"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}