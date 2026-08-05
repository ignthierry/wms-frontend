"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  ArrowDownToLine,
  Receipt,
  Wallet,
  FileText,
  Search,
  Banknote,
  CheckCircle2,
  Clock,
} from "lucide-react";

const fmtIDR = (n: number) => {
  if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1).replace(".", ",")} M`;
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace(".", ",")} jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0).replace(".", ",")} rb`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
};

export default function LaporanKeuanganPage() {
  const [tab, setTab] = useState<"invoice" | "revenue">("invoice");
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [groupBy, setGroupBy] = useState("consignee");
  const [revenueStatus, setRevenueStatus] = useState("PAID");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${apiUrl}/reports/invoices?${params.toString()}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInvoiceData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, statusFilter]);

  const fetchRevenue = useCallback(async () => {
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(
        `${apiUrl}/reports/revenue?group=${groupBy}&status=${revenueStatus}`,
        { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setRevenueData(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [apiUrl, groupBy, revenueStatus]);

  useEffect(() => {
    if (tab === "invoice") fetchInvoices();
    else fetchRevenue();
  }, [tab, fetchInvoices, fetchRevenue]);

  const exportInvoiceExcel = () => {
    if (!invoiceData?.data) return;
    const rows = invoiceData.data.map((i: any) => ({
      "No. Invoice": i.invoice_number,
      Tanggal: i.tgl_invoice,
      "No. ASN": i.asn_number,
      Kontainer: i.no_container,
      "Kode Item": i.item_code,
      "Nama Item": i.item_name,
      Consignee: i.consignee,
      "Storage Fee": i.storage_fee,
      "Handling Fee": i.handling_fee,
      Total: i.total_amount,
      Status: i.status,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Invoice");
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        { Keterangan: "Total Invoice", Nilai: invoiceData.summary.total_invoice },
        { Keterangan: "Terbayar", Nilai: invoiceData.summary.paid },
        { Keterangan: "Belum Bayar", Nilai: invoiceData.summary.unpaid },
        { Keterangan: "Total Pendapatan", Nilai: invoiceData.summary.total_revenue },
        { Keterangan: "Total Piutang", Nilai: invoiceData.summary.total_outstanding },
      ]),
      "Ringkasan"
    );
    XLSX.writeFile(wb, `Laporan_Invoice_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportRevenueExcel = () => {
    if (!revenueData?.data) return;
    const rows = revenueData.data.map((r: any) => ({
      [revenueData.group === "consignee" ? "Consignee" : revenueData.group === "warehouse" ? "Gudang" : "Bulan"]: r.label,
      Total: r.total,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Rekap Pendapatan");
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Keterangan: "Total Pendapatan", Nilai: revenueData.grand_total }]),
      "Ringkasan"
    );
    XLSX.writeFile(wb, `Rekap_Pendapatan_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Invoice & rekap pendapatan pergudangan
          </p>
        </div>
        <button
          onClick={tab === "invoice" ? exportInvoiceExcel : exportRevenueExcel}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition"
        >
          <ArrowDownToLine className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab("invoice")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "invoice"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Receipt className="w-4 h-4" /> Laporan Invoice
        </button>
        <button
          onClick={() => setTab("revenue")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            tab === "revenue"
              ? "border-brand-500 text-brand-600 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Wallet className="w-4 h-4" /> Rekap Pendapatan
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : tab === "invoice" ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Invoice", value: invoiceData?.summary?.total_invoice ?? 0, icon: FileText, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10" },
              { label: "Terbayar (PAID)", value: invoiceData?.summary?.paid ?? 0, icon: CheckCircle2, color: "bg-green-50 text-green-600 dark:bg-green-500/10" },
              { label: "Belum Bayar", value: invoiceData?.summary?.unpaid ?? 0, icon: Clock, color: "bg-red-50 text-red-600 dark:bg-red-500/10" },
              { label: "Pendapatan", value: fmtIDR(invoiceData?.summary?.total_revenue), icon: Banknote, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" },
              { label: "Piutang", value: fmtIDR(invoiceData?.summary?.total_outstanding), icon: Wallet, color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4 min-w-0">
                <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base lg:text-lg font-semibold text-gray-800 dark:text-white leading-tight break-words whitespace-normal">{m.value}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                statusFilter === ""
                  ? "bg-brand-500 text-white border-brand-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter("PAID")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                statusFilter === "PAID"
                  ? "bg-green-500 text-white border-green-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              PAID
            </button>
            <button
              onClick={() => setStatusFilter("UNPAID")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                statusFilter === "UNPAID"
                  ? "bg-red-500 text-white border-red-500"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              UNPAID
            </button>
          </div>

          {/* Invoice table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3">No. Invoice</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">ASN / Kontainer</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Consignee</th>
                    <th className="px-4 py-3 text-right">Storage</th>
                    <th className="px-4 py-3 text-right">Handling</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData?.data?.map((i: any) => (
                    <tr key={i.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{i.invoice_number}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{i.tgl_invoice}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800 dark:text-white text-xs font-medium">{i.asn_number}</div>
                        <div className="text-gray-400 text-xs">{i.no_container}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-200 text-xs">{i.item_code}</div>
                        <div className="text-gray-400 text-xs max-w-[180px] truncate">{i.item_name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">{i.consignee}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fmtIDR(i.storage_fee)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">{fmtIDR(i.handling_fee)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">{fmtIDR(i.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                          i.status === "PAID"
                            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        }`}>
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!invoiceData?.data?.length && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-gray-400">Tidak ada data invoice</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Revenue recap controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-500">Kelompokkan:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none"
              >
                <option value="consignee">Per Consignee</option>
                <option value="warehouse">Per Gudang</option>
                <option value="month">Per Bulan</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-500">Status:</span>
              <select
                value={revenueStatus}
                onChange={(e) => setRevenueStatus(e.target.value)}
                className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none"
              >
                <option value="PAID">Terbayar</option>
                <option value="UNPAID">Belum Bayar</option>
                <option value="ALL">Semua</option>
              </select>
            </div>
          </div>

          {/* Revenue table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Rekap Pendapatan {revenueData?.group === "consignee" ? "per Consignee" : revenueData?.group === "warehouse" ? "per Gudang" : "per Bulan"}
              </h3>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Total: {fmtIDR(revenueData?.grand_total)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">{revenueData?.group === "consignee" ? "Consignee" : revenueData?.group === "warehouse" ? "Gudang" : "Bulan"}</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData?.data?.map((r: any, idx: number) => (
                    <tr key={r.label} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{r.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-white">{fmtIDR(r.total)}</td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                        {revenueData?.grand_total ? ((r.total / revenueData.grand_total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                  {!revenueData?.data?.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-gray-400">Tidak ada data pendapatan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}