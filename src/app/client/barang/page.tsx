"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import { apiBase, authHeaders, statusLabel, statusColor, timeAgo, fmtIDR } from "@/components/client/api";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "RECEIVED", label: "Diterima" },
  { value: "PENDING", label: "Di Gudang" },
  { value: "READY_TO_DISPATCH", label: "Siap Kirim" },
];

interface Item {
  id: number;
  item_name: string;
  item_code: string;
  qty_expected: number;
  status: string;
  block_location: string | null;
  host_bl: string | null;
  updated_at: string;
  consignee?: { name: string };
  invoice?: { total_amount: number | null; status: string } | null;
}

export default function ClientItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async (reset = false) => {
    const nextPage = reset ? 1 : page;
    try {
      setLoading(true);
      const params = new URLSearchParams({ per_page: "15", page: String(nextPage) });
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`${apiBase}/client/items?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Gagal memuat barang");
      const d = await res.json();
      setItems(reset ? d.data : (prev) => [...prev, ...d.data]);
      setTotal(d.total ?? 0);
      setHasMore(d.current_page < d.last_page);
      setPage(nextPage);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const doSearch = () => fetchItems(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Barang</h1>
        <p className="mt-0.5 text-sm text-gray-400">{total} barang tercatat</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Cari nama / kode / BL..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-brand-500/50 focus:bg-white/[0.07]"
          />
        </div>
        <button
          onClick={doSearch}
          className="rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition active:scale-95"
        >
          Cari
        </button>
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              status === f.value
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                : "border border-white/10 bg-white/5 text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && items.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-xs text-gray-500">Memuat...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-300">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
          Tidak ada barang ditemukan.
        </div>
      ) : (
        <div className="space-y-2.5">
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
                    {item.item_code || "—"}
                    {item.block_location ? ` • Lokasi: ${item.block_location}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {item.consignee?.name || "—"} • {timeAgo(item.updated_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {statusLabel(item.status)}
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-gray-400">
                    {item.invoice ? fmtIDR(item.invoice.total_amount) : "—"}
                  </p>
                </div>
              </Link>
            );
          })}

          {hasMore && (
            <button
              onClick={() => fetchItems(false)}
              disabled={loading}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-300 transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Memuat..." : "Muat lebih banyak"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
