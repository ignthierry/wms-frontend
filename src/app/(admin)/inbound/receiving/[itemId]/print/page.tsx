"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function PrintItemBarcodePage() {
  const params = useParams();
  const itemId = params?.itemId;
  
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;
      try {
        const res = await fetch(`${apiUrl}/asn-items/${itemId}`, {
            headers: { "Accept": "application/json" }
        });
        if (res.ok) {
          const data = await res.json();
          setItem(data.data || data);
        }
      } catch (error) {
        console.error("Error fetching Item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [apiUrl, itemId]);

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data koli...</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-red-500">Item tidak ditemukan.</div>;
  }

  // Generate a unique value for this specific item/colli.
  // In a real scenario, this might be a generated lot number or barcode ID from DB.
  const qrValue = item.lot_number || `ITEM-${item.id}-${item.item_code}`;

  return (
    <div className="bg-white min-h-screen p-8 text-black print:p-0">
      <div className="mb-8 print:hidden flex justify-end gap-4">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700"
        >
          Cetak Label
        </button>
        <button 
          onClick={() => window.close()}
          className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
        >
          Tutup
        </button>
      </div>

      <div className="max-w-md mx-auto border-2 border-gray-800 p-6 rounded-xl print:border-none print:max-w-full print:p-4 print:m-0 flex flex-col items-center text-center">
        <h1 className="text-xl font-bold uppercase tracking-wider border-b-2 border-gray-800 pb-2 mb-4 w-full">WMS Label Koli</h1>
        
        <QRCodeSVG value={qrValue} size={150} level="H" includeMargin={true} />
        
        <p className="mt-2 font-mono text-lg tracking-widest font-bold">
          {item.item_code}
        </p>

        <div className="w-full mt-4 text-left text-sm space-y-2 border-t-2 border-dashed border-gray-400 pt-4">
          <div>
            <span className="font-bold block text-xs text-gray-500">Nama Barang</span>
            <span className="font-semibold text-base">{item.item_name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <div>
              <span className="font-bold block text-xs text-gray-500">Actual Wgt</span>
              <span className="font-semibold">{item.actual_weight ? `${item.actual_weight} Kg` : '-'}</span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-xs text-gray-500">Actual Vol</span>
              <span className="font-semibold">{item.actual_volume ? `${item.actual_volume} CBM` : '-'}</span>
            </div>
          </div>
          <div className="flex justify-between">
             <div>
              <span className="font-bold block text-xs text-gray-500">Lot / Batch</span>
              <span className="font-semibold">{item.lot_number || '-'}</span>
            </div>
             <div className="text-right">
              <span className="font-bold block text-xs text-gray-500">Exp Date</span>
              <span className="font-semibold">{item.expiry_date || '-'}</span>
            </div>
          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; margin: 0; padding: 0; }
          header, aside, nav, .app-sidebar { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          @page { size: 100mm 150mm; margin: 0; } /* Typical thermal label size */
        }
      `}} />
    </div>
  );
}
