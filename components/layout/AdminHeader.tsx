"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Bell, ShieldCheck } from "lucide-react";
import { playNotificationSound } from "@/lib/utils/sound";

export default function AdminHeader() {
  const [adminNotifications, setAdminNotifications] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    const channelId = `admin_notifications_${Date.now()}`;

    // Listen for new order placements across all users
    activeChannel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Play loud new order chime
          playNotificationSound("order");

          setAdminNotifications((prev) => [
            `🎉 New Order #${payload.new.id} received! Total: ₹${payload.new.total}`,
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-black">
          <ShieldCheck className="h-6 w-6 text-sky-600" />
          <span>
            LaundryOS <span className="text-xs font-bold text-sky-600">ADMIN</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Admin Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (showDropdown) setAdminNotifications([]);
              }}
              className="relative rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
            >
              <Bell className="h-5 w-5" />
              {adminNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
                  {adminNotifications.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-black text-slate-900">Admin Alerts</h4>
                  {adminNotifications.length > 0 && (
                    <button
                      onClick={() => setAdminNotifications([])}
                      className="text-[10px] font-bold text-sky-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {adminNotifications.length === 0 ? (
                  <p className="py-2 text-slate-500">No new incoming orders.</p>
                ) : (
                  <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto">
                    {adminNotifications.map((note, idx) => (
                      <p key={idx} className="py-2 font-bold text-slate-800">
                        {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}