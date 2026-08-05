"use client";

import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  ArrowDownToLine,
  Package,
  Truck,
  Wallet,
  Clock,
  Boxes,
  Building2,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#38bdf8", "#f59e0b", "#34d399", "#f43f5e", "#a78bfa", "#22c55e"];

export default function LaporanDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [warehouseId, setWarehouseId] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const params = new URLSearchParams();
      if (warehouseId) params.set("warehouse_id", warehouseId);
      const res = await fetch(`${apiUrl}/reports/dashboard?${params.toString()}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        console.error("report dashboard", res.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, warehouseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: KPI Summary
    const kpiSheet = XLSX.utils.json_to_sheet([
      { Keterangan: "Total Barang Masuk (Inbound)", Nilai: data.kpi.total_inbound },
      { Keterangan: "Total Barang Keluar (Outbound)", Nilai: data.kpi.total_outbound },
      { Keterangan: "Total Pendapatan (PAID)", Nilai: data.kpi.total_revenue },
      { Keterangan: "Total Piutang (UNPAID)", Nilai: data.kpi.outstanding },
      { Keterangan: "Total Stok", Nilai: data.kpi.total_stock_qty },
      { Keterangan: "Jumlah Gudang", Nilai: data.kpi.total_warehouse },
    ]);
    XLSX.utils.book_append_sheet(wb, kpiSheet, "Ringkasan");

    // Sheet 2: Inbound vs Outbound
    const io = data.chart_inbound_outbound;
    const ioSheet = XLSX.utils.json_to_sheet(
      io.categories.map((c: string, i: number) => ({
        Bulan: c,
        Inbound: io.inbound[i],
        Outbound: io.outbound[i],
      }))
    );
    XLSX.utils.book_append_sheet(wb, ioSheet, "Inbound vs Outbound");

    // Sheet 3: Revenue
    const rev = data.chart_revenue;
    const revSheet = XLSX.utils.json_to_sheet(
      rev.categories.map((c: string, i: number) => ({ Bulan: c, Pendapatan: rev.revenue[i] }))
    );
    XLSX.utils.book_append_sheet(wb, revSheet, "Pendapatan");

    XLSX.writeFile(wb, `Laporan_Dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const fmtIDR = (n: number) => {
    if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1).replace(".", ",")} M`;
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace(".", ",")} jt`;
    if (n >= 1000) return `Rp ${(n / 1000).toFixed(0).replace(".", ",")} rb`;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
  };

  const kpis = data?.kpi;

  const metricCards = [
    { label: "Barang Masuk (Inbound)", value: kpis?.total_inbound ?? 0, icon: Package, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10" },
    { label: "Barang Keluar (Outbound)", value: kpis?.total_outbound ?? 0, icon: Truck, color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10" },
    { label: "Pendapatan (Terbayar)", value: fmtIDR(kpis?.total_revenue), icon: Wallet, color: "bg-green-50 text-green-600 dark:bg-green-500/10" },
    { label: "Piutang (Belum Bayar)", value: fmtIDR(kpis?.outstanding), icon: Clock, color: "bg-red-50 text-red-600 dark:bg-red-500/10" },
    { label: "Total Stok", value: kpis?.total_stock_qty ?? 0, icon: Boxes, color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10" },
    { label: "Gudang", value: kpis?.total_warehouse ?? 0, icon: Building2, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Laporan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ringkasan kinerja pergudangan & keuangan secara real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none"
            >
              <option value="">Semua Gudang</option>
              {data?.warehouses?.map((w: any) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600 transition"
          >
            <ArrowDownToLine className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {metricCards.map((m) => (
              <div
                key={m.label}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-4 min-w-0"
              >
                <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.color}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base lg:text-lg font-semibold text-gray-800 dark:text-white leading-tight break-words whitespace-normal">{m.value}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{m.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Inbound vs Outbound */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Inbound vs Outbound (6 Bulan)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.chart_inbound_outbound.categories.map((c: string, i: number) => ({
                  bulan: c,
                  Inbound: data.chart_inbound_outbound.inbound[i],
                  Outbound: data.chart_inbound_outbound.outbound[i],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Inbound" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Outbound" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue donut */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-500" /> Ringkasan Keuangan
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Terbayar", value: kpis.total_revenue },
                      { name: "Piutang", value: kpis.outstanding },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#34d399" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip formatter={(v: any) => fmtIDR(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" /> Terbayar {fmtIDR(kpis.total_revenue)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> Piutang {fmtIDR(kpis.outstanding)}
                </span>
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue bar */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-500" /> Pendapatan per Bulan
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.chart_revenue.categories.map((c: string, i: number) => ({
                  bulan: c,
                  Pendapatan: data.chart_revenue.revenue[i],
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bulan" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v: any) => `${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip formatter={(v: any) => fmtIDR(v)} />
                  <Bar dataKey="Pendapatan" fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-gray-400 mt-2">Total Pendapatan: {fmtIDR(kpis.total_revenue)}</p>
            </div>

            {/* Status inbound pie */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/5 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-500" /> Status Barang (Inbound)
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.status_inbound || {}).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                  >
                    {(Object.values(data.status_inbound || {}) as number[]).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend custom - wrap & rapi */}
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
                {Object.entries(data.status_inbound || {}).map(([name, value], i) => (
                  <span key={name} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    {name.replace(/_/g, " ").toLowerCase()} ({value as number})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}