"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Truck,
  Users,
  Shirt,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard Overview", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Orders Management", href: "/admin/orders", icon: Package },
  { name: "Driver Dispatch", href: "/admin/delivery", icon: Truck },
  { name: "Customers Directory", href: "/admin/customers", icon: Users },
  { name: "Service Catalog", href: "/admin/services", icon: Shirt },
  { name: "Store Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-white antialiased selection:bg-sky-500 selection:text-white">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 rounded-xl border border-white/10 text-sky-400 shadow-lg"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Shared Dark Sidebar / Drawer */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static z-40 w-64 h-screen bg-slate-950 border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out`}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-3 py-2 mt-12 md:mt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/30 text-white font-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight leading-none text-white">
                Laundry<span className="text-sky-400">OS</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                Admin Control
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 px-2">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden p-6 md:p-8 mt-16 md:mt-0 bg-slate-950">
        {children}
      </div>
    </div>
  );
}