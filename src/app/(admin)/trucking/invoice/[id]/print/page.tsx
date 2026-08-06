"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PrintContent({ id }: { id: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/trucking-invoices/${id}`, {
          headers: { "Accept": "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data || json);
        } else {
          setError("Gagal memuat data invoice");
        }
      } catch (err) {
        setError("Terjadi kesalahan sistem");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoice();
  }, [id, apiUrl]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number || 0);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data invoice...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;
  }

  const details = data.details || {};
  const tarif = details.tarif || {};
  const desc = details.description || null;
  const truckingName = data.company?.name || details.trucking_company_name || "-";
  const isCombined = data.invoice_type === "combined";
  const subtotal = Number(details.subtotal ?? data.trucking_fee);
  const ppn = Number(details.ppn ?? subtotal * 0.11);
  const total = Number(data.total_amount ?? subtotal + ppn);
  const tglInvoice = data.tgl_invoice ? new Date(data.tgl_invoice + "T00:00").toLocaleDateString("id-ID", { dateStyle: "long" }) : "-";
  const tglCetak = new Date().toLocaleDateString("id-ID", { dateStyle: "long" });
  const rateDesc = tarif.nama_tarif
    ? `${tarif.nama_tarif}${tarif.origin || tarif.destination ? ` (${tarif.origin || "-"} → ${tarif.destination || "-"})` : ""}${tarif.vehicle_type ? ` · ${tarif.vehicle_type}` : ""}`
    : (desc || "Jasa Trucking");

  return (
    <div className="bg-white min-h-screen p-8 text-black print:p-0">
      <div className="mb-8 print:hidden flex justify-end gap-4">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg shadow hover:bg-brand-700 transition-colors"
        >
          Cetak Invoice
        </button>
        <button
          onClick={() => window.close()}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
        >
          Tutup
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white print:m-0 text-sm">
        {/* Header Invoice */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-1">INVOICE TRUCKING</h1>
            <p className="text-gray-600 font-medium">PT. LUVION LOGISTICS</p>
          </div>
          <div className="text-right">
            <p>
              <span className="text-gray-500 font-medium mr-2">No. Invoice:</span>
              <span className="font-bold">{data.invoice_number}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium mr-2">Tanggal Invoice:</span>
              <span className="font-medium">{tglInvoice}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium mr-2">Tanggal Cetak:</span>
              <span className="font-medium">{tglCetak}</span>
            </p>
          </div>
        </div>
        {/* Info Box */}
        <div className="flex justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Trucking Company</p>
            <p className="text-lg font-bold">{truckingName}</p>
            {data.company?.address && <p className="text-xs text-gray-500 mt-0.5">{data.company.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
              {isCombined ? "Jenis Tagihan" : "Jasa"}
            </p>
            <p className="text-lg font-bold">
              {isCombined ? "Gudang + Trucking" : "Jasa Trucking"}
            </p>
            {data.asn?.asn_number && (
              <p className="text-xs text-gray-500 mt-0.5">ASN: {data.asn.asn_number}</p>
            )}
          </div>
        </div>

        {/* Table Details */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Perincian Biaya Jasa Trucking</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 text-gray-800 font-bold">
                <th className="py-2 pr-4">Keterangan</th>
                <th className="py-2 px-4">Perhitungan</th>
                <th className="py-2 pl-4 text-right">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 pr-4 font-semibold">{rateDesc}</td>
                <td className="py-3 px-4 font-mono text-xs">
                  {formatRupiah(Number(details.rate ?? data.trucking_fee))}
                  {tarif.rate_unit ? ` / ${tarif.rate_unit.replace("_", " ")}` : ""}
                  {details.container_count ? ` × ${details.container_count} container` : ""}
                  {details.minimum_charge ? ` (min. ${formatRupiah(Number(details.minimum_charge))})` : ""}
                </td>
                <td className="py-3 pl-4 text-right font-medium">{formatRupiah(data.trucking_fee)}</td>
              </tr>
              {isCombined && (
                <tr>
                  <td className="py-3 pr-4 font-semibold">Jasa Gudang (Storage & Handling)</td>
                  <td className="py-3 px-4 font-mono text-xs">Tagihan penyimpanan & penanganan</td>
                  <td className="py-3 pl-4 text-right font-medium">{formatRupiah(data.warehouse_fee)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2} className="py-3 pr-4 text-right font-bold text-gray-700">Subtotal</td>
                <td className="py-3 pl-4 text-right font-bold border-t-2 border-gray-400">{formatRupiah(subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={2} className="py-3 pr-4 text-right font-bold text-gray-700">PPN 11%</td>
                <td className="py-3 pl-4 text-right font-medium">{formatRupiah(ppn)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end border-t-4 border-gray-900 pt-4">
          <div className="w-1/2">
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
              <span className="font-bold text-lg uppercase">Total Tagihan</span>
              <span className="font-bold text-xl">{formatRupiah(total)}</span>
            </div>
            {desc && (
              <p className="text-xs text-gray-500 mt-2 italic">{desc}</p>
            )}
          </div>
        </div>
        {/*END_PART1*/}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          header, aside, nav, .app-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          @page { size: A4 portrait; margin: 15mm; }
        }
      ` }} />
    </div>
  );
}

export default function PrintTruckingInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <PrintContent id={id} />
    </Suspense>
  );
}
