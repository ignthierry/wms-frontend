"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import {
  ArrowDownToLine,
  Package,
  Truck,
  Calendar,
  Filter,
  Boxes,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";

export default function LaporanOperasionalPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState("");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const params = new URLSearchParams();
      if (warehouseId) params.set("warehouse_id", warehouseId);
      if (type !== "all") params.set("type", type);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`${apiUrl}/reports/operational?${params.toString()}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, warehouseId, type, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const token = Cookies.get("auth_token");
        const res = await fetch(`${apiUrl}/warehouses`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const j = await res.json();
          setWarehouses(Array.isArray(j) ? j : j.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadWarehouses();
  }, [apiUrl]);

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    if (data.inbound?.length) {
      const rows = data.inbound.map((a: any) => ({
        "No. ASN": a.asn_number,
        Kontainer: a.no_container,
        "Master BL": a.no_master_bl,
        Voyage: a.voyage,
        Gudang: a.warehouse,
        Forwarding: a.forwarding,
        "Jml Item": a.items_count,
        Tanggal: a.date,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Inbound (ASN)");
    }
    if (data.outbound?.length) {
      const rows = data.outbound.map((d: any) => ({
        "No. DR": d.dr_number,
        Penerima: d.recipient,
        Gudang: d.warehouse,
        Forwarding: d.forwarding,
        "No. ASN": d.asn_number,
        Status: d.status,
        Tanggal: d.date,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Outbound (DR)");
    }
    const summaryRows = data.status_items.map((s: any) => ({
      "Status Barang": s.status,
      Jumlah: s.c,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Status Barang");
    XLSX.writeFile(wb, `Laporan_Operasional_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      RECEIVED: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      PENDING: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
      READY_TO_DISPATCH: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      DISPATCHED: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    };
    return map[s] || "bg-gray-50 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Laporan Operasional</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Inbound & outbound per periode, lengkap dengan status barang
          </p>
        </div>
        <button
          onClick={exportExcel}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition"
        >
          <ArrowDownToLine className="w-4 h-4" /> Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="all">Semua (Inbound + Outbound)</option>
            <option value="inbound">Inbound saja</option>
            <option value="outbound">Outbound saja</option>
          </select>
        </div>
        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
        >
          <option value="">Semua Gudang</option>
          {warehouses.map((w: any) => (
            <option key={w.id} value={w.id}>
              {w.warehouse_name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          />
          <span className="text-gray-400 text-xs">s/d</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">{data?.summary?.total_inbound ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Inbound (ASN)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">{data?.summary?.total_outbound ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Outbound (DR)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 dark:text-white">{data?.summary?.total_items_received ?? 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Item Diterima (RECEIVED)</p>
              </div>
            </div>
          </div>

          {/* Status distribution */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-500" /> Distribusi Status Barang
            </h3>
            <div className="flex flex-wrap gap-3">
              {data?.status_items?.map((s: any) => (
                <div key={s.status} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(s.status)}`}>
                    {s.status === "RECEIVED" ? <CheckCircle2 className="w-3 h-3" /> : s.status === "PENDING" ? <Clock className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                    {s.status}
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">{s.c}</span>
                  <span className="text-xs text-gray-400">
                    item
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inbound table */}
          {(type === "all" || type === "inbound") && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Barang Masuk (ASN / Manifest)</h3>
                <span className="ml-auto text-xs text-gray-400">{data?.inbound?.length ?? 0} dokumen</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3">No. ASN</th>
                      <th className="px-4 py-3">Kontainer</th>
                      <th className="px-4 py-3">Master BL</th>
                      <th className="px-4 py-3">Voyage</th>
                      <th className="px-4 py-3">Gudang</th>
                      <th className="px-4 py-3">Forwarding</th>
                      <th className="px-4 py-3 text-center">Jml Item</th>
                      <th className="px-4 py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.inbound?.map((a: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{a.asn_number}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.no_container}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.no_master_bl}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.voyage}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.warehouse}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{a.forwarding}</td>
                        <td className="px-4 py-3 text-center font-medium text-gray-800 dark:text-white">{a.items_count}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.date}</td>
                      </tr>
                    ))}
                    {!data?.inbound?.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-gray-400">Tidak ada data inbound</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outbound table */}
          {(type === "all" || type === "outbound") && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Barang Keluar (Delivery Request)</h3>
                <span className="ml-auto text-xs text-gray-400">{data?.outbound?.length ?? 0} dokumen</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3">No. DR</th>
                      <th className="px-4 py-3">Penerima</th>
                      <th className="px-4 py-3">Gudang</th>
                      <th className="px-4 py-3">Forwarding</th>
                      <th className="px-4 py-3">No. ASN</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.outbound?.map((d: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{d.dr_number}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.recipient}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.warehouse}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.forwarding}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{d.asn_number}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${statusBadge(d.status)}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.date}</td>
                      </tr>
                    ))}
                    {!data?.outbound?.length && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-gray-400">Tidak ada data outbound</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}