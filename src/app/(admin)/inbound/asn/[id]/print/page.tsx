"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface AsnItem {
  id: number;
  item_code: string;
  item_name: string;
  qty_expected: number;
}

export default function PrintAsnPage() {
  const params = useParams();
  const asnId = params?.id;
  
  const [asn, setAsn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchAsn = async () => {
      if (!asnId) return;
      try {
        const res = await fetch(`${apiUrl}/asns/${asnId}`, {
            headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          const data = await res.json();
          setAsn(data.data || data);
        }
      } catch (error) {
        console.error("Error fetching ASN:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsn();
  }, [apiUrl, asnId]);

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data manifest...</div>;
  }

  if (!asn) {
    return <div className="p-8 text-center text-red-500">Manifest tidak ditemukan.</div>;
  }

  // Use qr_id if available, fallback to asn_number, or generate a simple string for now.
  const qrValue = asn.qr_id || asn.asn_number || `ASN-${asn.id}`;

  return (
    <div className="bg-white min-h-screen p-8 text-black print:p-0">
      {/* Action buttons (hidden when printing) */}
      <div className="mb-8 print:hidden flex justify-end gap-4">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
        >
          Cetak QR Code
        </button>
        <button 
          onClick={() => window.close()}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
        >
          Tutup
        </button>
      </div>

      {/* Print Template Container */}
      <div className="max-w-3xl mx-auto border-2 border-gray-800 p-8 rounded-xl print:border-none print:max-w-full print:p-4">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wider">WMS Manifest Label</h1>
          <p className="text-gray-600 text-lg mt-2 font-medium">{asn.asn_number}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl print:border-solid print:border-gray-800 shrink-0">
            <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
            <p className="mt-4 font-mono text-sm tracking-widest bg-gray-200 px-3 py-1 rounded">
              {qrValue.substring(0, 18)}{qrValue.length > 18 ? '...' : ''}
            </p>
          </div>

          {/* Details Section */}
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold bg-gray-800 text-white px-4 py-2 mb-4 rounded">Informasi Manifest</h2>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">No Master BL</p>
                <p className="font-semibold text-base">{asn.no_master_bl || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">Consignee</p>
                <p className="font-semibold text-base">{asn.client?.client_name || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">No Container / Size</p>
                <p className="font-semibold text-base">{asn.no_container || '-'} / {asn.size || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">No Segel</p>
                <p className="font-semibold text-base">{asn.no_segel || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">Voyage</p>
                <p className="font-semibold text-base">{asn.voyage || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs font-bold">ETA / Tiba</p>
                <p className="font-semibold text-base">
                  {asn.eta ? new Date(asn.eta).toLocaleDateString() : '-'} / {asn.tanggal_tiba || '-'}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold bg-gray-800 text-white px-4 py-2 mb-4 rounded">Daftar Barang ({asn.items?.length || 0})</h2>
            
            {asn.items && asn.items.length > 0 ? (
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Item Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Nama Barang</th>
                    <th className="border border-gray-300 px-3 py-2 text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {asn.items.map((item: AsnItem, idx: number) => (
                    <tr key={idx}>
                      <td className="border border-gray-300 px-3 py-2 font-mono">{item.item_code}</td>
                      <td className="border border-gray-300 px-3 py-2">{item.item_name}</td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-bold">{item.qty_expected}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">Tidak ada rincian barang.</p>
            )}
          </div>
        </div>
        
        {/* Footer for print layout */}
        <div className="mt-12 text-center text-xs text-gray-400 print:block">
           Dicetak pada: {new Date().toLocaleString()} - WMS LUVION
        </div>
      </div>
      
      {/* CSS to ensure perfect printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          /* Ensure header/sidebar from layout doesn't show up if wrapped in layout */
          header, aside, nav, .app-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
        }
      `}} />
    </div>
  );
}
