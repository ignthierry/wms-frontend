"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Search, Package, MapPin, FileText, History, ImageIcon, ScanLine } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { apiBase, authHeaders, statusLabel, statusColor, fullIDR, photoUrl } from "@/components/client/api";

export default function ClientTrackPage() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [scanError, setScanError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "client-qr-scanner";
  const scanLock = useRef(false);

  const runTrack = useCallback(async (q: string) => {
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
  }, []);

  const track = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await runTrack(identifier.trim());
  };

  // Close scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }
    };
  }, []);

  const openScanner = async () => {
    setScanError("");
    setScanOpen(true);
    // Wait for modal to render
    setTimeout(async () => {
      try {
        scannerRef.current = new Html5Qrcode("client-qr-scanner");
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            // Auto-detect: scan → set identifier → track
            if (scanLock.current) return;
            scanLock.current = true;
            setIdentifier(decodedText);
            closeScanner();
            runTrack(decodedText);
            setTimeout(() => { scanLock.current = false; }, 1500);
          },
          () => {}
        );
      } catch (err: any) {
        setScanError(err?.message || "Tidak dapat mengakses kamera");
      }
    }, 150);
  };

  const closeScanner = () => {
    setScanOpen(false);
    if (scannerRef.current) {
      try { scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  };

  const sc = result ? statusColor(result.status) : null;
  const photos = result?.photos || [];
  const shirts = result?.histories || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Lacak Barang</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Scan QR atau masukkan nomor referensi</p>
      </div>

      {/* Input */}
      <form onSubmit={track} className="flex gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="QR / kode barang / Host BL..."
            className="w-full rounded-xl border border-brand-100 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-brand-500/50"
          />
        </div>
        <button
          type="button"
          onClick={openScanner}
          title="Scan QR"
          className="flex items-center justify-center rounded-xl border border-brand-200 bg-white px-3.5 text-brand-600 shadow-sm transition hover:bg-brand-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-brand-300 dark:hover:bg-white/10"
        >
          <Camera className="h-5 w-5" />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 active:scale-95 disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> Lacak
        </button>
      </form>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {scanOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={closeScanner}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#111827]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Scan QR Barang</h3>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Arahkan kamera ke QR code barang</p>
                </div>
                <button
                  onClick={closeScanner}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <div className="px-5 pb-5">
                <div className="overflow-hidden rounded-2xl bg-black">
                  <div id="client-qr-scanner" className="w-full [&_video]:w-full [&_video]:object-cover" style={{ minHeight: 280 }} />
                </div>
                {scanError && (
                  <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2.5 text-center text-xs text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                    {scanError}
                  </p>
                )}
                <p className="mt-3 text-center text-[11px] text-gray-400">
                  Scan otomatis — hasil langsung muncul setelah terdeteksi
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center text-sm text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {error}
        </motion.div>
      )}

      {result && sc && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
          {/* Result Header */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-white p-5 shadow-sm dark:border-white/10 dark:from-brand-500/15 dark:via-transparent dark:to-transparent">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-200/40 blur-2xl dark:bg-brand-500/10" />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-snug text-gray-800 dark:text-gray-100">{result.item_name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {result.block_location || "Lokasi belum ditentukan"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{result.consignee?.name}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {statusLabel(result.status)}
              </span>
            </div>
          </div>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Kode Barang</p>
              <p className="mt-1 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">{result.item_code || "—"}</p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Kuantitas</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{result.qty_expected ? `${result.qty_expected} pos` : "—"}</p>
            </div>
          </div>

          {/* Invoice */}
          {result.invoice && (
            <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <p className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <FileText className="h-3.5 w-3.5" /> Invoice
              </p>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">{result.invoice.invoice_number || "—"}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{fullIDR(result.invoice.total_amount)}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <ImageIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Dokumentasi
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p: any) => {
                  const url = photoUrl(p.photo_proof);
                  return (
                    <div key={p.id} className="overflow-hidden rounded-2xl bg-brand-50 dark:bg-black/30">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={p.jenis_foto || "foto"} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center text-gray-400 dark:text-gray-600">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <p className="px-2 py-1 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        {p.jenis_foto === "in" ? "Inbound" : p.jenis_foto === "out" ? "Outbound" : "Foto"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm dark:border-white/5 dark:bg-white/[0.03]">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <History className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Riwayat Pergerakan
            </h3>
            {shirts.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada riwayat.</p>
            ) : (
              <div className="relative ml-1 space-y-5 border-l border-brand-100 pl-5 dark:border-white/10">
                {shirts.map((h: any) => (
                  <div key={h.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500 dark:border-[#0a0e1a]" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{h.description || h.action}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{h.action}</span>
                      <span className="text-gray-400 dark:text-gray-500">
                        {h.created_at ? new Date(h.created_at.replace(" ", "T")).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {!result && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-brand-200 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-transparent"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Package className="h-10 w-10 text-brand-300 dark:text-gray-600" />
          </motion.div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Masukkan nomor QR / kode barang / Host BL untuk melihat status terbaru barang Anda.
          </p>
        </motion.div>
      )}
    </div>
  );
}