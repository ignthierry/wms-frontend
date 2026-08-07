"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  Package,
  FileText,
  ScanLine,
  LogOut,
  UserRound,
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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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

  const handleLogout = () => {
    Cookies.remove("auth_token");
    Cookies.remove("user_role");
    localStorage.removeItem("user");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-brand-25/60 pb-24 text-gray-800 transition-colors dark:bg-[#0a0e1a] dark:text-gray-100">
      {/* Account panel — satu lingkaran akun; klik → dua tombol (dark & logout) menetas dengan animasi */}
      <div className="fixed right-3 top-3 z-50 flex flex-col items-end gap-2 lg:hidden">
        {/* Tombol aksi yang muncul hanya saat accountOpen */}
        <div className="flex flex-col items-end gap-1.5">
          <div
            className={`flex flex-col items-end gap-1.5 transition-all duration-300 ease-out origin-top ${
              accountOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 -translate-y-2 pointer-events-none"
            }`}
          >
            <button
              onClick={() => setDark(!dark)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white/90 text-brand-600 shadow-lg shadow-brand-600/10 backdrop-blur-xl transition hover:bg-brand-50 dark:border-white/10 dark:bg-white/15 dark:text-amber-300 dark:hover:bg-white/20"
              title={dark ? "Mode terang" : "Mode gelap"}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-100 bg-white/90 text-gray-500 shadow-lg shadow-brand-600/10 backdrop-blur-xl transition-all hover:border-rose-400/40 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:bg-white/15 dark:text-gray-300 dark:hover:border-rose-500/40 dark:hover:text-rose-400"
              title="Keluar"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Avatar akun — selalu tampil, berputar saat buka/tutup */}
        <button
          onClick={() => setAccountOpen(!accountOpen)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-lg shadow-brand-600/20 backdrop-blur-xl transition-transform duration-300 dark:border-white/15 dark:bg-white/10 dark:text-amber-100 ${
            accountOpen ? "rotate-90 scale-105" : "rotate-0"
          }`}
          title="Akun"
        >
          <UserRound className="h-5.5 w-5.5" />
        </button>
      </div>

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