"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

const FragileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 mb-1">
    <mask id="crack-mask">
      <rect width="24" height="24" fill="white" />
      <path d="M9 2l2 3-1.5 2 2 3-3-2 1-3-2-3z" fill="black" />
    </mask>
    <g mask="url(#crack-mask)">
      <path d="M6 2h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V2z" />
    </g>
    <rect x="11" y="14" width="2" height="6" />
    <path d="M7 20h10v2H7z" />
  </svg>
);

export default function PrintPosItemPage() {
  const params = useParams();
  const itemId = params?.id;
  
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
        console.error("Error fetching POS Item:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [apiUrl, itemId]);

  if (isLoading) {
    return <div className="p-8 text-center">Memuat data item...</div>;
  }

  if (!item) {
    return <div className="p-8 text-center text-red-500">Item tidak ditemukan.</div>;
  }

  const qrValue = item.qr_id || `ITEM-${item.id}`;
  const asn = item.asn || {};
  const forwardingName = asn.forwarding?.forwarding_name || "-";
  const consigneeName = item.consignee?.name || asn.consignee?.name || "-";

  return (
    <div className="bg-gray-100 min-h-screen p-8 text-black print:p-0 print:bg-white flex flex-col items-center">
      {/* Action buttons (hidden when printing) */}
      <div className="mb-6 print:hidden flex justify-center gap-4 w-full max-w-md">
        <button 
          onClick={() => window.print()}
          className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-lg shadow-lg hover:bg-black transition-colors uppercase tracking-widest"
        >
          Cetak Label
        </button>
        <button 
          onClick={() => window.close()}
          className="flex-1 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg shadow hover:bg-gray-400 transition-colors uppercase tracking-widest"
        >
          Tutup
        </button>
      </div>

      {/* Print Template Container (4x6 ratio) */}
      <div className="print-label bg-white text-black border-4 border-black rounded-2xl flex flex-col font-sans overflow-hidden w-[400px] h-[600px] print:w-full print:h-full print:border-0 print:rounded-none">
        
        {/* Row 1: Logo & From */}
        <div className="flex border-b-4 border-black h-[15%]">
            <div className="w-1/3 border-r-4 border-black flex flex-col items-center justify-center p-2">
                <img 
                  src="https://everwin-company-profile.vercel.app/_next/static/media/header_logo.50ada9d8.png" 
                  alt="Everwin Logo" 
                  className="max-w-[80%] max-h-[80%] object-contain"
                />
            </div>
            <div className="w-2/3 p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase mb-1">Forwarding:</span>
                <span className="font-black leading-tight text-lg uppercase truncate">{forwardingName}</span>
            </div>
        </div>

        {/* Row 2: Icon & To */}
        <div className="flex border-b-4 border-black h-[22%]">
            <div className="w-1/3 border-r-4 border-black bg-black text-white flex flex-col items-center justify-center p-2">
                <FragileIcon />
                <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">HANDLE WITH CARE</span>
            </div>
            <div className="w-2/3 p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase mb-1">Consignee:</span>
                <span className="font-black leading-tight text-xl uppercase line-clamp-2">{consigneeName}</span>
            </div>
        </div>

        {/* Row 3: Order nr & MBL */}
        <div className="flex border-b-4 border-black h-[22%]">
            <div className="w-full p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase mb-1">Order nr.:</span>
                <span className="font-black text-2xl leading-tight truncate">{asn.asn_number || '-'}</span>
                {asn.no_master_bl && (
                  <span className="font-bold text-sm leading-tight text-gray-700 mt-1 truncate">MBL: {asn.no_master_bl}</span>
                )}
            </div>
        </div>

        {/* Row 4: Ref & Lot */}
        <div className="flex border-b-4 border-black h-[10%] text-sm font-bold">
            <div className="w-1/2 border-r-4 border-black p-2 flex flex-col justify-center">
                <span className="text-[10px] font-normal uppercase text-gray-600">Pos number:</span>
                <span className="text-lg">{item.pos_number || '-'}</span>
            </div>
            <div className="w-1/2 p-2 flex flex-col justify-center">
                <span className="text-[10px] font-normal uppercase text-gray-600">Qty & Kemasan:</span>
                <span className="text-lg">{item.qty_expected} {item.packaging || ''}</span>
            </div>
        </div>

        {/* Row 5: Item nr & Main QR */}
        <div className="flex flex-1 h-[35%]">
            <div className="w-1/2 border-r-4 border-black p-4 flex flex-col justify-between">
                <div>
                    <span className="text-[10px] font-bold uppercase block mb-1">Item nr.:</span>
                    <span className="font-black text-2xl tracking-tight block leading-none break-all">{item.item_code}</span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase block mb-1">Item Name:</span>
                    <span className="font-bold text-sm leading-tight line-clamp-3">{item.item_name}</span>
                </div>
            </div>
            <div className="w-1/2 p-2 flex flex-col items-center justify-center overflow-hidden">
                <QRCodeSVG value={qrValue} size={180} level="H" includeMargin={false} />
                <span className="text-xs font-black tracking-widest mt-2 text-center">{qrValue}</span>
            </div>
        </div>
      </div>
      
      {/* CSS to ensure perfect printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: 100mm 150mm; margin: 0; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          
          .print-label, .print-label * { 
             visibility: visible;
             -webkit-print-color-adjust: exact !important;
             print-color-adjust: exact !important;
             color-adjust: exact !important;
          }
          .print-label { 
             position: fixed !important; 
             left: 2mm !important; 
             top: 2mm !important; 
             width: calc(100vw - 4mm) !important; 
             height: calc(100vh - 4mm) !important; 
             margin: 0 !important; 
             padding: 4mm !important; 
             box-sizing: border-box !important; 
             border: 4px solid black !important;
             border-radius: 8px !important;
             background: white !important;
             z-index: 9999 !important;
          }
        }
      `}} />
    </div>
  );
}
