"use client";

import React, { useState } from "react";
import { ScanLine, Search, Package, MapPin, FileText, History, ImageIcon } from "lucide-react";
import { apiBase, authHeaders, statusLabel, statusColor, fullIDR, photoUrl } from "@/components/client/api";

export default function ClientTrackPage() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = identifier.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${apiBase}/client/track/${encodeURIComponent(q)}`, { headers: authHeaders() });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Barang tidak ditemukan");
      }
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const sc = result ? statusColor(result.status) : null;
  const photos = result?.photos || [];
  const shirts = result?.histories || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Lacak Barang</h1>
        <p className="mt-0.5 text-sm text-gray-400">Scan QR atau masukkan nomor referensi</p>
      </div>

      {/* Input */}
      <form onSubmit={track} className="flex gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="QR / kode barang / Host BL..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-brand-500/50 focus:bg-white/[0.07]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> Lacak
        </button>
      </form>

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-sm text-rose-300">{error}</div>
      )}

      {result && sc && (
        <div className="space-y-4">
          {/* Result Header */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/15 via-transparent to-transparent p-5">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-snug">{result.item_name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {result.block_location || "Lokasi belum ditentukan"}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">{result.consignee?.name}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {statusLabel(result.status)}
              </span>
            </div>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-[11px] text-gray-500">Kode Barang</p>
              <p className="mt-1 break-words text-sm font-semibold">{result.item_code || "—"}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-[11px] text-gray-500">Kuantitas</p>
              <p className="mt-1 text-sm font-semibold">{result.qty_expected ? `${result.qty_expected} pos` : "—"}</p>
            </div>
          </div>

          {/* Invoice */}
          {result.invoice && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <FileText className="h-3.5 w-3.5" /> Invoice
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-gray-400">{result.invoice.invoice_number || "—"}</p>
                <p className="text-sm font-bold">{fullIDR(result.invoice.total_amount)}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <ImageIcon className="h-4 w-4 text-brand-400" /> Dokumentasi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p: any) => {
                  const url = photoUrl(p.photo_proof);
                  return (
                    <div key={p.id} className="overflow-hidden rounded-2xl bg-black/30">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={p.jenis_foto || "foto"} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center text-gray-600">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <p className="px-2 py-1 text-center text-[10px] font-medium text-gray-400">
                        {p.jenis_foto === "in" ? "Inbound" : p.jenis_foto === "out" ? "Outbound" : "Foto"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <History className="h-4 w-4 text-brand-400" /> Riwayat Pergerakan
            </h3>
            {shirts.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada riwayat.</p>
            ) : (
              <div className="relative ml-1 space-y-5 border-l border-white/10 pl-5">
                {shirts.map((h: any) => (
                  <div key={h.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-[#0a0e1a] bg-brand-500" />
                    <p className="text-sm font-semibold text-gray-200">{h.description || h.action}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="inline-flex rounded-md bg-brand-500/15 px-2 py-0.5 font-semibold text-brand-300">{h.action}</span>
                      <span className="text-gray-500">
                        {h.created_at ? new Date(h.created_at.replace(" ", "T")).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 p-10 text-center">
          <Package className="h-10 w-10 text-gray-600" />
          <p className="text-sm text-gray-500">
            Masukkan nomor QR / kode barang / Host BL untuk melihat status terbaru barang Anda.
          </p>
        </div>
      )}
    </div>
  );
}