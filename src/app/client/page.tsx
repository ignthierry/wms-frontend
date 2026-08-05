"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowDownToLine, ArrowUpFromLine, MapPin, FileWarning, ChevronRight, Boxes } from "lucide-react";
import { apiBase, authHeaders, statusLabel, statusColor, timeAgo, fmtIDR } from "@/components/client/api";

interface Item {
  id: number;
  item_name: string;
  item_code: string;
  status: string;
  block_location: string | null;
  updated_at: string;
  consignee?: { name: string };
  invoice?: { total_amount: number | null; status: string } | null;
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
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center">
        <p className="text-sm font-medium text-rose-300">{error}</p>
      </div>
    );
  }

  const m = data?.metrics || {};
  const consignees = data?.consignees || [];
  const items = data?.recent_items || [];

  const kpis = [
    { label: "Total Barang", value: m.total_items ?? 0, icon: Boxes, color: "text-brand-400 bg-brand-500/10 border-brand-500/20" },
    { label: "Inbound", value: m.inbound ?? 0, icon: ArrowDownToLine, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Outbound", value: m.outbound ?? 0, icon: ArrowUpFromLine, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    { label: "Di Gudang", value: m.in_warehouse ?? 0, icon: MapPin, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">Halo, 👋</h1>
        <p className="mt-0.5 text-sm text-gray-400">Pantau pergerakan barang Anda di gudang.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl border ${k.color} p-4 backdrop-blur`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold">{k.value}</span>
              <k.icon className="h-5 w-5 opacity-80" />
            </div>
            <p className="mt-1 text-xs font-medium text-gray-400">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Alert Invoice */}
      {(m.unpaid_invoices ?? 0) > 0 && (
        <Link
          href="/client/invoice"
          className="flex items-center justify-between rounded-2xl border border-rose-500/25 bg-gradient-to-r from-rose-500/15 to-orange-500/10 p-4 transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
              <FileWarning className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-200">{m.unpaid_invoices} invoice belum dibayar</p>
              <p className="text-xs text-rose-300/70">Klik untuk melihat detail tagihan</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-rose-300" />
        </Link>
      )}

      {/* Consignee Chips */}
      {consignees.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-300">Consignee Anda</h2>
          <div className="flex flex-wrap gap-2">
            {consignees.map((c: any) => (
              <span key={c.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Barang Terbaru</h2>
          <Link href="/client/barang" className="flex items-center gap-0.5 text-xs font-medium text-brand-400">
            Lihat semua <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-500">
              Belum ada barang.
            </div>
          )}
          {items.map((item: Item) => {
            const sc = statusColor(item.status);
            return (
              <Link
                key={item.id}
                href={`/client/barang/${item.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5 transition active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10">
                  <Package className="h-5 w-5 text-brand-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.item_name}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {item.consignee?.name || "—"}
                    {item.block_location ? ` • ${item.block_location}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">{timeAgo(item.updated_at)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {statusLabel(item.status)}
                  </span>
                  {item.invoice && (
                    <p className="mt-1 text-[11px] font-semibold text-gray-400">{fmtIDR(item.invoice.total_amount)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
