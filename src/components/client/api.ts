"use client";
import Cookies from "js-cookie";

export const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export function authHeaders(): HeadersInit {
  const token = Cookies.get("auth_token");
  return {
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export function getToken(): string | undefined {
  return Cookies.get("auth_token");
}

export function photoUrl(filename?: string | null): string | undefined {
  if (!filename) return undefined;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return `${base}/api/photos/${encodeURIComponent(filename.split("/").pop() || filename)}`;
}

/** Format angka sebagai format Rupiah ringkas untuk card: Rp 38,2 jt / Rp 500 rb */
export function fmtIDR(v: number | string | null | undefined): string {
  const n = Number(v || 0);
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1).replace(/\.?0+$/, "")} rb`;
  return `Rp ${n}`;
}

export function fullIDR(v: number | string | null | undefined): string {
  const n = Number(v || 0);
  return "Rp " + n.toLocaleString("id-ID");
}

export function statusLabel(status?: string): string {
  switch (status) {
    case "RECEIVED": return "Diterima";
    case "PENDING": return "Di Gudang";
    case "READY_TO_DISPATCH": return "Siap Kirim";
    case "DISPATCHED": return "Dikirim";
    case "PAID": return "Lunas";
    case "UNPAID": return "Belum Bayar";
    case "ACTIVE": return "Aktif";
    default: return (status || "").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}

export function statusColor(status?: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case "RECEIVED": return { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" };
    case "PENDING": return { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" };
    case "READY_TO_DISPATCH": return { bg: "bg-sky-500/15", text: "text-sky-400", dot: "bg-sky-400" };
    case "DISPATCHED": return { bg: "bg-violet-500/15", text: "text-violet-400", dot: "bg-violet-400" };
    case "PAID": return { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" };
    case "UNPAID": return { bg: "bg-rose-500/15", text: "text-rose-400", dot: "bg-rose-400" };
    default: return { bg: "bg-gray-500/15", text: "text-gray-300", dot: "bg-gray-400" };
  }
}

export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso + (iso.endsWith("Z") ? "" : "Z"));
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari lalu`;
}