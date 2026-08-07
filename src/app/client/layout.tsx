"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Package,
  FileText,
  ScanLine,
  LogOut,
  Warehouse,
  Sun,
  Moon,
} from "lucide-react";
import LiquidNav from "@/components/client/LiquidNav";
import "@/components/client/liquidnav.css";

const NAV = [
  { href: "/client", label: "Beranda", icon: LayoutDashboard, acc: "#1e40af" },
  { href: "/client/barang", label: "Barang", icon: Package, acc: "#0891b2" },
  { href: "/client/invoice", label: "Invoice", icon: FileText, acc: "#16a34a" },
  { href: "/client/track", label: "Lacak", icon: ScanLine, acc: "#ea580c" },
];

/** Menentukan apakah menu aktif berdasarkan pathname (termasuk sub-halaman) */
function isActive(pathname: string, href: string): boolean {
  if (href === "/client") return pathname === "/client";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync theme with main WMS (localStorage "theme")
    const saved = localStorage.getItem("theme");
    setDark(saved === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark, mounted]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_role");
    localStorage.removeItem("user");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-brand-25/60 pb-24 text-gray-800 transition-colors dark:bg-[#0a0e1a] dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/85 backdrop-blur-xl transition-colors dark:border-white/5 dark:bg-[#0a0e1a]/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-600/25">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-800 dark:text-gray-100">WMS Client</p>
              <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                {user?.name || "Portal Barang"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600 transition hover:bg-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-amber-300 dark:hover:bg-white/10"
              title={dark ? "Mode terang" : "Mode gelap"}
            >
              {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-gray-500 transition hover:border-rose-400/40 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-rose-500/40 dark:hover:text-rose-400"
              title="Keluar"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>

      {/* Bottom Navigation — liquid nav (meniscus) */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-lg px-3">
          <LiquidNav items={NAV} root="/client" dark={dark} />
        </div>
      </div>
    </div>
  );
}