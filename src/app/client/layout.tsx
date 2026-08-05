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

const NAV = [
  { href: "/client", label: "Beranda", icon: LayoutDashboard },
  { href: "/client/barang", label: "Barang", icon: Package },
  { href: "/client/invoice", label: "Invoice", icon: FileText },
  { href: "/client/track", label: "Lacak", icon: ScanLine },
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

      {/* Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-100 bg-white/95 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#0d1220]/95">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 transition ${
                  active ? "text-brand-600 dark:text-brand-400" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                }`}
              >
                {/* Active indicator bar */}
                <span
                  className={`absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-b-full transition-all ${
                    active
                      ? "bg-gradient-to-r from-brand-500 to-orange-500 shadow-[0_0_8px_rgba(30,58,138,0.5)]"
                      : "bg-transparent"
                  }`}
                />
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                      : "group-hover:bg-brand-50 dark:group-hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_rgba(30,58,138,0.35)]" : ""}`}
                  />
                </span>
                <span className={`text-[10px] font-medium ${active ? "text-brand-600 dark:text-brand-300" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}