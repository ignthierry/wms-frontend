"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

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

  const formatAngka = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0
    }).format(number);
  };
  
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(number);
  };

  const terbilang = (angka: number): string => {
    const huruf = ["", "SATU", "DUA", "TIGA", "EMPAT", "LIMA", "ENAM", "TUJUH", "DELAPAN", "SEMBILAN", "SEPULUH", "SEBELAS"];
    let hasil = "";
    if (angka < 12) hasil = huruf[angka];
    else if (angka < 20) hasil = terbilang(angka - 10) + " BELAS";
    else if (angka < 100) hasil = terbilang(Math.floor(angka / 10)) + " PULUH " + terbilang(angka % 10);
    else if (angka < 200) hasil = "SERATUS " + terbilang(angka - 100);
    else if (angka < 1000) hasil = terbilang(Math.floor(angka / 100)) + " RATUS " + terbilang(angka % 100);
    else if (angka < 2000) hasil = "SERIBU " + terbilang(angka - 1000);
    else if (angka < 1000000) hasil = terbilang(Math.floor(angka / 1000)) + " RIBU " + terbilang(angka % 1000);
    else if (angka < 1000000000) hasil = terbilang(Math.floor(angka / 1000000)) + " JUTA " + terbilang(angka % 1000000);
    else if (angka < 1000000000000) hasil = terbilang(Math.floor(angka / 1000000000)) + " MILYAR " + terbilang(angka % 1000000000);
    return hasil.trim();
  };

  if (isLoading) {
    return <div className="p-8 text-center font-medium">Memuat data invoice...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-medium">{error || "Data tidak ditemukan"}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8 text-black print:p-0 print:bg-white flex flex-col font-sans">
      <div className="mb-8 print:hidden flex justify-end gap-4 max-w-[210mm] mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors mr-auto font-semibold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-brand-600 text-white font-semibold rounded-lg shadow-md hover:bg-brand-700 transition-colors"
        >
          Cetak Invoice (A4)
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white p-10 shadow-lg print:shadow-none print:m-0 print:p-0 w-full relative">
        
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <Image src="/images/logo/logo-icon.svg" alt="Everwin Logo" width={64} height={64} className="object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-blue-900 tracking-wide mb-1">PT. EVERWIN LOGISTICS</h1>
            <p className="text-[10px] text-gray-600 uppercase font-medium max-w-sm">CONTAINER DEPOT, MAINTENANCE & REPAIR, WAREHOUSE AND TRANS</p>
            <p className="text-[10px] text-gray-500 mt-1">Jl. Kalianak Barat 55A (Belakang) Surabaya 60183</p>
            <p className="text-[10px] text-gray-500">Telp. (031) 7495120(Hunting) Fax. (031) 7481412 Email. cs@everwin.com</p>
          </div>
          <div className="ml-auto text-right">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-wider">INVOICE LCL</h2>
          </div>
        </div>

        {/* Bill To */}
        <div className="flex justify-between border-t border-b border-gray-300 py-4 mb-4 text-xs">
          <div className="w-1/2">
            <p className="text-gray-500 font-bold mb-1 uppercase">Kepada (Bill To)</p>
            <p className="font-bold text-sm uppercase">KARYA LINTAS BAHARI</p>
            <p className="uppercase text-[10px] mt-1 text-gray-600">Perumahan Grand Indra Prasta B2 No.23 003/007</p>
          </div>
          <div className="w-1/2 flex justify-end gap-16">
            <div>
              <p className="text-gray-500 mb-1">No BC11</p>
              <p className="font-bold mb-3">002251</p>
              <p className="text-gray-500 mb-1">TPS Asal</p>
              <p className="font-bold">ICT</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Tanggal BC11</p>
              <p className="font-bold mb-3">24-05-2026</p>
              <p className="text-gray-500 mb-1">Tanggal Invoice</p>
              <p className="font-bold">{data.tanggal_invoice}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 text-[10px] mb-6 border border-gray-200 rounded-sm">
          <div><p className="text-gray-500 mb-0.5">Kapal / Voyage</p><p className="font-bold">EVER BUILD 1194 / 086A</p></div>
          <div><p className="text-gray-500 mb-0.5">Principal</p><p className="font-bold">-</p></div>
          <div className="col-span-2"><p className="text-gray-500 mb-0.5">Container / Size</p><p className="font-bold">EMCU8806350 / 40</p></div>

          <div><p className="text-gray-500 mb-0.5">Tgl Masuk TPS Asal</p><p className="font-bold">24/05/26</p></div>
          <div><p className="text-gray-500 mb-0.5">Tgl Masuk Everwin</p><p className="font-bold">{data.tanggal_masuk}</p></div>
          <div><p className="text-gray-500 mb-0.5">Tgl Keluar Everwin</p><p className="font-bold">{data.tanggal_invoice}</p></div>
          <div><p className="text-gray-500 mb-0.5">Durasi Penumpukan</p><p className="font-bold">{data.days} Hari</p></div>

          <div className="col-span-2"><p className="text-gray-500 mb-0.5">Jenis Barang</p><p className="font-bold uppercase pr-4">{data.item_description}</p></div>
          <div className="col-span-2"><p className="text-gray-500 mb-0.5">Jumlah Kemasan</p><p className="font-bold">{data.qty} PC (Pieces)</p></div>

          <div className="col-span-2"><p className="text-gray-500 mb-0.5">Berat (Weight)</p><p className="font-bold">{formatAngka(data.weight)} Kg</p></div>
          <div className="col-span-2"><p className="text-gray-500 mb-0.5">Volume (Measure)</p><p className="font-bold">{data.volume} M3</p></div>
        </div>

        {/* Table items */}
        <table className="w-full text-[11px] mb-6">
          <thead>
            <tr className="border-t-2 border-b-2 border-gray-800 bg-gray-50">
              <th className="py-2.5 text-left font-extrabold tracking-wider w-1/2">KETERANGAN</th>
              <th className="py-2.5 text-center font-extrabold tracking-wider">QTY</th>
              <th className="py-2.5 text-center font-extrabold tracking-wider">UNIT</th>
              <th className="py-2.5 text-right font-extrabold tracking-wider">TARIF</th>
              <th className="py-2.5 text-center font-extrabold tracking-wider">HARI</th>
              <th className="py-2.5 text-right font-extrabold tracking-wider">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-gray-200">
            <tr>
               <td colSpan={6} className="py-2.5 font-bold underline">BIAYA PT. EVERWIN LOGISTICS</td>
            </tr>
            {data.other_fees && data.other_fees.length > 0 && (
               <tr className="hover:bg-gray-50 transition-colors">
                 <td className="py-2 font-semibold uppercase">{data.other_fees[0].keterangan}</td>
                 <td className="py-2 text-center">{data.other_fees[0].qty}</td>
                 <td className="py-2 text-center">{data.other_fees[0].unit}</td>
                 <td className="py-2 text-right">{formatAngka(data.other_fees[0].tarif)}</td>
                 <td className="py-2 text-center">{data.other_fees[0].hari}</td>
                 <td className="py-2 text-right">{formatAngka(data.other_fees[0].total)}</td>
               </tr>
            )}
            
            {data.storage_details && data.storage_details.map((s: any, i: number) => (
               <tr key={'s'+i} className="hover:bg-gray-50 transition-colors">
                 <td className="py-2 font-semibold uppercase pl-4">{s.keterangan}</td>
                 <td className="py-2 text-center">{s.qty}</td>
                 <td className="py-2 text-center">{s.unit}</td>
                 <td className="py-2 text-right">{formatAngka(s.tarif)}</td>
                 <td className="py-2 text-center">{s.hari}</td>
                 <td className="py-2 text-right">{formatAngka(s.total)}</td>
               </tr>
            ))}

            {data.other_fees && data.other_fees.slice(1).map((f: any, i: number) => (
               <tr key={'f'+i} className="hover:bg-gray-50 transition-colors">
                 <td className="py-2 font-semibold uppercase">{f.keterangan}</td>
                 <td className="py-2 text-center">{f.qty}</td>
                 <td className="py-2 text-center">{f.unit}</td>
                 <td className="py-2 text-right">{formatAngka(f.tarif)}</td>
                 <td className="py-2 text-center">{f.hari}</td>
                 <td className="py-2 text-right">{formatAngka(f.total)}</td>
               </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal & PPN */}
        <div className="flex justify-end text-[11px] mb-4">
           <div className="w-1/3">
              <div className="flex justify-between py-1 border-t border-gray-300">
                 <span className="font-semibold text-gray-600">Subtotal</span>
                 <span className="font-bold">{formatAngka(data.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                 <span className="font-semibold text-gray-600">PPN (11%)</span>
                 <span className="font-bold">{formatAngka(data.ppn)}</span>
              </div>
           </div>
        </div>

        {/* Moving Fee */}
        <div className="text-[11px] mb-6">
           <div className="font-bold underline mb-2">MOVING</div>
           <table className="w-full text-left">
              <tbody>
                 <tr className="border-t border-b border-gray-200">
                    <td className="py-2 w-1/2 font-semibold uppercase">BIAYA MOVING</td>
                    <td className="py-2 text-center">1</td>
                    <td className="py-2 text-center">Ls</td>
                    <td className="py-2 text-right">{formatAngka(data.moving_fee)}</td>
                    <td className="py-2 text-center">1</td>
                    <td className="py-2 text-right font-bold">{formatAngka(data.moving_fee)}</td>
                 </tr>
              </tbody>
           </table>
        </div>

        {/* Grand Total */}
        <div className="flex justify-end items-end gap-4 bg-gray-50 p-4 border border-gray-200 rounded-sm mb-6">
           <span className="font-bold text-gray-600 uppercase text-xs">TOTAL TAGIHAN</span>
           <span className="font-extrabold text-2xl text-black">{formatRupiah(data.total_amount)}</span>
        </div>

        {/* Terbilang & Bank Info */}
        <div className="flex justify-between items-start text-[11px]">
           <div className="w-1/2">
              <div className="mb-2">
                 <span className="font-bold uppercase text-xs">TERBILANG</span>
                 <div className="border border-gray-300 p-2 mt-1 rounded-sm bg-gray-50 italic font-semibold font-serif text-xs">
                    # {terbilang(data.total_amount)} RUPIAH #
                 </div>
              </div>
              <div className="space-y-1 text-gray-600 mt-4">
                 <p>I. Pembayaran pada Bank <span className="font-bold text-black">MANDIRI</span> #a/n. <span className="font-bold text-black">PT. EVERWIN LOGISTICS</span> #No. Rek. <span className="font-bold text-black">140 000 8989 007</span></p>
                 <p>II. Pembayaran dianggap sah jika BG sudah cair (diuangkan)</p>
                 <p className="text-red-500 italic">* Untuk pengajuan complain max. 2 x 24 jam, lewat batas tersebut tidak dilayani.</p>
                 <p className="text-red-500 italic">* Pengeluaran Hari Sabtu FIAT BC pada hari Jumat, Dokumen tanpa ada FIAT BC tidak bisa dilayani.</p>
              </div>
           </div>
           
           <div className="w-1/3 text-center">
              <p className="mb-16">Surabaya, {data.tanggal_invoice}</p>
              <p className="font-bold border-b border-black inline-block px-8 pb-1">(..........................................)</p>
           </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          header, aside, nav, .app-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          @page { size: A4 portrait; margin: 10mm; } 
        }
      `}} />
    </div>
  );
}

export default function PerincianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-8 text-center">Memuat...</div>}>
      <PerincianContent id={id} />
    </Suspense>
  );
}
