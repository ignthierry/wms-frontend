"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Package, ChevronLeft, MapPin, FileText, ImageIcon, History, Boxes, QrCode } from "lucide-react";
import { apiBase, authHeaders, statusLabel, statusColor, fullIDR, photoUrl } from "@/components/client/api";

export default function ClientItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/client/items/${params.id}`, { headers: authHeaders() });
        if (!res.ok) throw new Error("Barang tidak ditemukan");
        setItem(await res.json());
      } catch (e: any) {
        setError(e.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        <p className="text-xs text-gray-500">Memuat detail...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15">
          <Package className="h-7 w-7 text-rose-400" />
        </div>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => router.push("/client/barang")} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
          Kembali
        </button>
      </div>
    );
  }

  const sc = statusColor(item.status);
  const photos = item.photos || [];
  const shirts = item.histories || [];

  const detailRows = [
    { label: "Kode Barang", value: item.item_code || "—" },
    { label: "Consignee", value: item.consignee?.name || "—" },
    { label: "Kuantitas", value: item.qty_expected ? `${item.qty_expected} pos` : "—" },
    { label: "Host BL", value: item.host_bl || "—" },
    { label: "Packaging", value: item.packaging || "—" },
    { label: "Kondisi", value: item.item_condition || "—" },
    { label: "QR", value: item.qr_id || "—" },
    { label: "Keterangan", value: item.remarks || "—" },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => router.push("/client/barang")} className="flex items-center gap-1 text-sm font-medium text-gray-400 transition hover:text-gray-200">
        <ChevronLeft className="h-4 w-4" /> Kembali ke Barang
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/15 via-transparent to-transparent p-5">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-500/10 blur-2xl" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-snug">{item.item_name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin className="h-3.5 w-3.5" />
              {item.block_location || "Lokasi belum ditentukan"}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${sc.bg} ${sc.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
            {statusLabel(item.status)}
          </span>
        </div>
      </div>

      {/* Detail Info */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Boxes className="h-4 w-4 text-brand-400" /> Informasi Barang
        </h2>
        <div className="space-y-2.5">
          {detailRows.filter((r) => r.value && r.value !== "—").map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <span className="text-xs text-gray-500">{r.label}</span>
              <span className="max-w-[60%] break-words text-right text-xs font-medium text-gray-200">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice */}
      {item.invoice && (
        <Link href={`/client/invoice`} className="block rounded-3xl border border-white/5 bg-white/[0.03] p-5 transition active:scale-[0.99]">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <FileText className="h-4 w-4 text-brand-400" /> Invoice
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{item.invoice.invoice_number || "No. Invoice"}</p>
              <p className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                item.invoice.status === "PAID" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
              }`}>{statusLabel(item.invoice.status)}</p>
            </div>
            <p className="text-lg font-bold">{fullIDR(item.invoice.total_amount)}</p>
          </div>
        </Link>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
            <ImageIcon className="h-4 w-4 text-brand-400" /> Dokumentasi
          </h2>
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
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
          <History className="h-4 w-4 text-brand-400" /> Riwayat Pergerakan
        </h2>
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
  );
}