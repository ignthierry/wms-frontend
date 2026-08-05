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
    <div className="min-h-screen bg-[#0a0e1a] text-gray-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/20">
              <Warehouse className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">WMS Client</p>
              <p className="text-[11px] leading-tight text-gray-400">
                {user?.name || "Portal Barang"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-rose-500/40 hover:text-rose-400"
            title="Keluar"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-5">{children}</main>

      {/* Bottom Navigation — tampil di semua ukuran layar, mobile-app UX */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d1220]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex flex-1 flex-col items-center gap-1 pt-2.5 pb-2 transition ${
                  active ? "text-brand-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {/* Active indicator bar */}
                <span
                  className={`absolute top-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-b-full transition-all ${
                    active
                      ? "bg-gradient-to-r from-brand-400 to-brand-300 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                      : "bg-transparent"
                  }`}
                />
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                    active
                      ? "bg-brand-500/15 text-brand-400"
                      : "group-hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_rgba(96,165,250,0.6)]" : ""}`}
                  />
                </span>
                <span
                  className={`text-[10px] font-medium ${active ? "text-brand-300" : ""}`}
                >
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