"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ChevronRight, CircleCheck, CircleAlert } from "lucide-react";
import { apiBase, authHeaders, statusLabel, fullIDR, fmtIDR } from "@/components/client/api";

interface Inv {
  id: number;
  invoice_number: string;
  total_amount: number;
  status: string;
  tgl_invoice: string | null;
  asn_item?: {
    item_name?: string;
    consignee?: { name?: string };
  } | null;
}

export default function ClientInvoicePage() {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/client/invoices${filter ? `?status=${filter}` : ""}`, { headers: authHeaders() });
        if (!res.ok) throw new Error("Gagal memuat invoice");
        setData(await res.json());
      } catch (e: any) {
        setError(e.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    })();
  }, [filter]);

  const summary = data?.summary;
  const invoices: Inv[] = data?.data || [];

  const FILTERS = [
    { value: "", label: "Semua" },
    { value: "PAID", label: "Lunas" },
    { value: "UNPAID", label: "Belum Bayar" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Invoice</h1>
        <p className="mt-0.5 text-sm text-gray-400">Tagihan penyimpanan & penanganan barang</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
            <p className="text-[11px] font-medium text-gray-400">Total Invoice</p>
            <p className="mt-1 text-xl font-extrabold">{summary.total}</p>
            <p className="mt-0.5 text-[11px] text-emerald-400">{summary.paid} lunas</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent p-4">
            <p className="text-[11px] font-medium text-gray-400">Belum Dibayar</p>
            <p className="mt-1 text-xl font-extrabold">{summary.unpaid}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-rose-400">{fmtIDR(summary.unpaid_amount)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                : "border border-white/10 bg-white/5 text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-xs text-gray-500">Memuat...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-300">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
          Tidak ada invoice.
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => {
            const paid = inv.status === "PAID";
            return (
              <div key={inv.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                      {paid ? (
                        <CircleCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <CircleAlert className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                      {inv.invoice_number || `Inv #${inv.id}`}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-400">
                      {inv.asn_item?.item_name || inv.asn_item?.consignee?.name || "Barang"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {inv.tgl_invoice ? new Date(inv.tgl_invoice + "T00:00").toLocaleDateString("id-ID", { dateStyle: "medium" }) : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${paid ? "text-emerald-400" : "text-rose-300"}`}>{fullIDR(inv.total_amount)}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      paid ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                    }`}>{statusLabel(inv.status)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="pt-2 text-center text-[11px] text-gray-600">
        Untuk rincian lengkap invoice, hubungi tim WMS.
      </p>
    </div>
  );
}