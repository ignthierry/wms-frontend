"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, ChevronRight, Hourglass, Warehouse, Send, FileText, Grid3x3 } from "lucide-react";
import { apiBase, authHeaders, statusLabel, statusColor, timeAgo, fmtIDR } from "@/components/client/api";
import WarehouseBanner from "@/components/client/WarehouseBanner";

interface Item {
  id: number;
  item_name: string;
  item_code: string;
  pos_number: string | null;
  status: string;
  block_location: string | null;
  updated_at: string;
  consignee?: { name: string };
  invoice?: { total_amount: number | null; status: string } | null;
  asn?: { asn_number: string; no_container: string | null; no_master_bl: string | null } | null;
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/client/dashboard`, { headers: authHeaders() });
        if (!res.ok) throw new Error("Gagal memuat data");
        setData(await res.json());
      } catch (e: any) {
        setError(e.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-50 p-5 text-center dark:bg-rose-500/10">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>
      </div>
    );
  }

  const m = data?.metrics || {};
  const consignees = data?.consignees || [];
  const items = data?.recent_items || [];
  // Nama EMKL/forwarding dari data user login (localStorage "user"); fallback nama konsignee pertama
  let userName = "";
  try {
    const u = localStorage.getItem("user");
    if (u) userName = JSON.parse(u)?.name || "";
  } catch {}
  if (!userName) userName = data?.consignees?.[0]?.name || "";

  // KPI urut sesuai alur logistik: Pending > In Gudang > Siap Kirim
    const kpis = [
      { label: "Pending", value: m.pending ?? 0, icon: Hourglass, color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20" },
      { label: "In Gudang", value: m.in_warehouse ?? 0, icon: Warehouse, color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20" },
      { label: "Siap Kirim", value: m.ready ?? 0, icon: Send, color: "text-violet-600 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/20" },
    ];

  return (
    <div className="space-y-6">
      {/* Banner Hero */}
      <WarehouseBanner name={userName} totalItems={m.total_items ?? 0} unpaidInvoices={m.unpaid_invoices ?? 0} />

      {/* KPI Grid — Pending > In Gudang > Siap Kirim */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
            className={`rounded-2xl border ${k.color} p-4 backdrop-blur`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold">{k.value}</span>
              <k.icon className="h-5 w-5 opacity-80" />
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Consignee Chips */}
      {consignees.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Consignee Anda</h2>
          <div className="flex flex-wrap gap-2">
            {consignees.map((c: any) => (
              <span key={c.id} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Barang Terbaru</h2>
          <Link href="/client/barang" className="flex items-center gap-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-brand-200 p-6 text-center text-sm text-gray-500 dark:border-white/10">
              Belum ada barang.
            </div>
          )}
          {items.map((item: Item, i: number) => {
            const sc = statusColor(item.status);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={`/client/barang/${item.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-3.5 shadow-sm transition hover:shadow-md active:scale-[0.98] dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-500/20 dark:to-brand-700/10">
                    <Package className="h-5 w-5 text-brand-600 dark:text-brand-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{item.item_name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      {item.consignee?.name || "—"}
                      {item.block_location ? ` • Lokasi: ${item.block_location}` : ""}
                    </p>
                    {/* Manifest + Pos */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.asn?.asn_number && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                          <FileText className="h-3 w-3" /> {item.asn.asn_number}
                        </span>
                      )}
                      {item.pos_number && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          <Grid3x3 className="h-3 w-3" /> POS {item.pos_number}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(item.updated_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                      {statusLabel(item.status)}
                    </span>
                    {item.invoice && (
                      <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">{fmtIDR(item.invoice.total_amount)}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}