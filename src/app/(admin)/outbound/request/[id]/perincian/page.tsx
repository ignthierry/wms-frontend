"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { ArrowLeft, Calculator, CalendarDays, DollarSign, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

function PerincianContent({ id }: { id: string }) {
  const router = useRouter();
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
      const token = Cookies.get("auth_token");
      let fetchUrl = `${apiUrl}/invoices/calculate/${id}`;
      if (tglInvoiceParam) {
        fetchUrl += `?tgl_invoice=${tglInvoiceParam}`;
      }
      const res = await fetch(fetchUrl, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-error-500 bg-error-50 rounded-xl mt-10 max-w-md mx-auto">
        {error || "Data tidak ditemukan"}
        <button onClick={() => router.back()} className="block mt-4 text-brand-600 hover:underline mx-auto">Kembali</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 pt-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-brand-500" />
            Perincian Biaya
          </h1>
          <p className="text-sm text-gray-500">ASN: {data.asn_number}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg dark:bg-blue-500/15">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Hari</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.days} Hari</p>
            <p className="text-xs text-gray-400 mt-1">{data.tanggal_stripping} s/d {data.tanggal_invoice}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-lg dark:bg-orange-500/15">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Kapasitas</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{data.total_capacity} CBM/Ton</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-success-50 text-success-500 rounded-lg dark:bg-success-500/15">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tagihan</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatRupiah(data.total_amount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Perhitungan Storage Masa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                <th className="p-4 font-semibold">Hari Ke</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Masa Tarif</th>
                <th className="p-4 font-semibold text-right">Tarif Dasar</th>
                <th className="p-4 font-semibold text-right">Biaya (Tarif x Kapasitas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.details && data.details.map((detail: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 text-gray-800 dark:text-gray-300">{detail.day}</td>
                  <td className="p-4 text-gray-800 dark:text-gray-300">{detail.date}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-medium dark:bg-brand-500/15 dark:text-brand-500">
                      {detail.masa}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-600 dark:text-gray-400">{formatRupiah(detail.rate)}</td>
                  <td className="p-4 text-right font-medium text-gray-800 dark:text-gray-200">{formatRupiah(detail.fee)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-800/30">
                <td colSpan={4} className="p-4 text-right font-semibold text-gray-700 dark:text-gray-300">Total Biaya Storage</td>
                <td className="p-4 text-right font-semibold text-gray-800 dark:text-gray-200">{formatRupiah(data.storage_fee)}</td>
              </tr>
              <tr className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <td colSpan={4} className="p-4 text-right text-gray-600 dark:text-gray-400">Biaya Mekanis / Delivery ({data.total_capacity} x Tarif)</td>
                <td className="p-4 text-right text-gray-800 dark:text-gray-300">{formatRupiah(data.mekanis_fee)}</td>
              </tr>
              <tr className="bg-white dark:bg-gray-900">
                <td colSpan={4} className="p-4 text-right text-gray-600 dark:text-gray-400">Administrasi Dokumen</td>
                <td className="p-4 text-right text-gray-800 dark:text-gray-300">{formatRupiah(data.tarif_administrasi)}</td>
              </tr>
              <tr className="bg-white dark:bg-gray-900">
                <td colSpan={4} className="p-4 text-right text-gray-600 dark:text-gray-400">Service Fee</td>
                <td className="p-4 text-right text-gray-800 dark:text-gray-300">{formatRupiah(data.tarif_service)}</td>
              </tr>
              <tr className="bg-white dark:bg-gray-900">
                <td colSpan={4} className="p-4 text-right text-gray-600 dark:text-gray-400">Surveyor Fee</td>
                <td className="p-4 text-right text-gray-800 dark:text-gray-300">{formatRupiah(data.tarif_surveyor)}</td>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700">
                <td colSpan={4} className="p-4 text-right font-bold text-gray-900 dark:text-white">Total Keseluruhan</td>
                <td className="p-4 text-right font-bold text-brand-600 dark:text-brand-400 text-lg">{formatRupiah(data.total_amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function PerincianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>}>
      <PerincianContent id={id} />
    </Suspense>
  );
}
