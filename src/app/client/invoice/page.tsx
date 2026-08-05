"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CircleCheck, CircleAlert } from "lucide-react";
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
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Invoice</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Tagihan penyimpanan & penanganan barang</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm dark:border-white/5 dark:from-emerald-500/10 dark:to-transparent"
          >
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Total Invoice</p>
            <p className="mt-1 text-xl font-extrabold text-gray-800 dark:text-gray-100">{summary.total}</p>
            <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">{summary.paid} lunas</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm dark:border-white/5 dark:from-rose-500/10 dark:to-transparent"
          >
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Belum Dibayar</p>
            <p className="mt-1 text-xl font-extrabold text-gray-800 dark:text-gray-100">{summary.unpaid}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">{fmtIDR(summary.unpaid_amount)}</p>
          </motion.div>
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
                : "border border-brand-100 bg-white text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="text-xs text-gray-500">Memuat...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-200 p-8 text-center text-sm text-gray-500 dark:border-white/10">
          Tidak ada invoice.
        </div>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv, i) => {
            const paid = inv.status === "PAID";
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
                className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {paid ? (
                        <CircleCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <CircleAlert className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      {inv.invoice_number || `Inv #${inv.id}`}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                      {inv.asn_item?.item_name || inv.asn_item?.consignee?.name || "Barang"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                      {inv.tgl_invoice ? new Date(inv.tgl_invoice + "T00:00").toLocaleDateString("id-ID", { dateStyle: "medium" }) : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${paid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-300"}`}>{fullIDR(inv.total_amount)}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      paid ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                    }`}>{statusLabel(inv.status)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="pt-2 text-center text-[11px] text-gray-400 dark:text-gray-600">
        Untuk rincian lengkap invoice, hubungi tim WMS.
      </p>
    </div>
  );
}