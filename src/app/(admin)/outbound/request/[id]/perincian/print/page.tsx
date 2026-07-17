"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PrintContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const tglInvoiceParam = searchParams.get('tgl_invoice');
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchPerincian();
  }, [id]);

  const fetchPerincian = async () => {
    setIsLoading(true);
    try {
      let fetchUrl = `${apiUrl}/invoices/calculate/${id}`;
      if (tglInvoiceParam) {
        fetchUrl += `?tgl_invoice=${tglInvoiceParam}`;
      }
      const res = await fetch(fetchUrl, {
        headers: {
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Gagal memuat data perincian");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data invoice...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">{error || "Data tidak ditemukan"}</div>;
  }

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
            <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-1">INVOICE DRAFT</h1>
            <p className="text-gray-600 font-medium">PT. LUVION LOGISTICS</p>
          </div>
          <div className="text-right">
            <p><span className="text-gray-500 font-medium mr-2">No. ASN:</span> <span className="font-bold">{data.asn_number}</span></p>
            <p><span className="text-gray-500 font-medium mr-2">Tanggal Stripping:</span> <span className="font-medium">{data.tanggal_stripping}</span></p>
            <p><span className="text-gray-500 font-medium mr-2">Tanggal Cetak:</span> <span className="font-medium">{data.tanggal_invoice}</span></p>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
           <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Hari Penumpukan</p>
              <p className="text-lg font-bold">{data.days} Hari</p>
           </div>
           <div className="text-right">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Kapasitas</p>
              <p className="text-lg font-bold">{data.total_capacity} CBM / Ton</p>
           </div>
        </div>

        {/* Table Details */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Perincian Biaya Storage & Penumpukan</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 text-gray-800 font-bold">
                <th className="py-2 pr-4">Masa Tarif</th>
                <th className="py-2 px-4">Perhitungan</th>
                <th className="py-2 pl-4 text-right">Biaya (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.details && data.details.map((detail: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-semibold">{detail.masa}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {detail.days_count} Hari x {data.total_capacity} m3 x {detail.rate}
                  </td>
                  <td className="py-3 pl-4 text-right font-medium">
                    {formatRupiah(detail.fee)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="py-3 pr-4 text-right font-bold text-gray-700">Total Biaya Storage</td>
                <td className="py-3 pl-4 text-right font-bold border-t-2 border-gray-400">{formatRupiah(data.storage_fee)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Other Fees */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Biaya Lain-lain</h2>
          <table className="w-full text-left border-collapse">
             <tbody className="divide-y divide-gray-200">
               <tr>
                  <td className="py-2 pr-4 w-1/3">Biaya Mekanis / Delivery</td>
                  <td className="py-2 px-4 font-mono text-xs text-gray-600">
                     ({data.total_capacity} m3 x {data.tarif_mekanis})
                  </td>
                  <td className="py-2 pl-4 text-right font-medium">{formatRupiah(data.mekanis_fee)}</td>
               </tr>
               <tr>
                  <td className="py-2 pr-4">Administrasi Dokumen</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 pl-4 text-right font-medium">{formatRupiah(data.tarif_administrasi)}</td>
               </tr>
               <tr>
                  <td className="py-2 pr-4">Service Fee</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 pl-4 text-right font-medium">{formatRupiah(data.tarif_service)}</td>
               </tr>
               <tr>
                  <td className="py-2 pr-4">Surveyor Fee</td>
                  <td className="py-2 px-4"></td>
                  <td className="py-2 pl-4 text-right font-medium">{formatRupiah(data.tarif_surveyor)}</td>
               </tr>
             </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end border-t-4 border-gray-900 pt-4">
           <div className="w-1/2">
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                 <span className="font-bold text-lg uppercase">Total Tagihan</span>
                 <span className="font-bold text-xl">{formatRupiah(data.total_amount)}</span>
              </div>
           </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          header, aside, nav, .app-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          @page { size: A4 portrait; margin: 15mm; } 
        }
      `}} />
    </div>
  );
}

export default function PrintPerincianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <PrintContent id={id} />
    </Suspense>
  );
}
