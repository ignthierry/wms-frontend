"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Filter, Image as ImageIcon, XCircle } from "lucide-react";

interface AsnItem {
  id: number;
  asn_id: number;
  item_code: string;
  item_name: string;
  qty_expected: number;
  actual_weight?: number;
  actual_volume?: number;
  status?: string;
  pos_number?: string;
  block_location?: string;
  photo_proof?: string;
  host_bl?: string; 
  
  // Custom fields we inject for convenience
  asn_no_master_bl?: string;
  asn_tanggal_stripping?: string;
  asn_no_container?: string;
}

interface Asn {
  id: number;
  asn_number: string;
  no_master_bl?: string; 
  tanggal_stripping?: string; 
  no_container?: string; 
  items?: AsnItem[];
}

interface StockSummary {
  item_code: string;
  item_name: string;
  total_qty: number;
  total_weight: number;
  total_volume: number;
}

export default function StockSummaryPage() {
  const [receivedItems, setReceivedItems] = useState<AsnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchStockSummary();
  }, []);

  const fetchStockSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const asns: Asn[] = data.data || data;
        
        const itemsList: AsnItem[] = [];
        
        asns.forEach(asn => {
          if (asn.items) {
            asn.items.forEach(item => {
              if (item.status === 'RECEIVED') {
                itemsList.push({
                  ...item,
                  asn_no_master_bl: asn.no_master_bl,
                  asn_tanggal_stripping: asn.tanggal_stripping,
                  asn_no_container: asn.no_container,
                });
              }
            });
          }
        });
        
        setReceivedItems(itemsList);
      }
    } catch (error) {
      console.error("Error fetching stock summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLamaTimbun = (tanggal_stripping?: string) => {
    if (!tanggal_stripping) return "-";
    const start = new Date(tanggal_stripping);
    if (isNaN(start.getTime())) return "-";
    
    const now = new Date();
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 ? `${diffDays} Hari` : "Belum";
  };

  const filteredItems = receivedItems.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pos_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.host_bl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.asn_no_master_bl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.asn_no_container?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-500" />
          Ringkasan Stok (Received)
        </h1>
        <p className="text-sm text-gray-500">Daftar barang-barang per POS yang telah diterima (Status: RECEIVED).</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Cari barang, kode, pos, BL..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4" />
            Filter Lanjutan
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800/50">
            {searchTerm ? 'Barang tidak ditemukan.' : 'Belum ada stok barang yang masuk (Received).'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-semibold">POS / Barang</th>
                  <th className="p-4 font-semibold">BL / Container</th>
                  <th className="p-4 font-semibold">Status Gudang</th>
                  <th className="p-4 font-semibold text-right">Dimensi</th>
                  <th className="p-4 font-semibold text-center">Foto</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-brand-600 dark:text-brand-400">{item.pos_number || "-"}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.item_name}</span>
                        <span className="text-xs font-mono text-gray-500">{item.item_code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <div><span className="text-gray-500 text-xs">HBL:</span> <span className="font-medium">{item.host_bl || "-"}</span></div>
                        <div><span className="text-gray-500 text-xs">MBL:</span> <span className="font-medium">{item.asn_no_master_bl || "-"}</span></div>
                        <div><span className="text-gray-500 text-xs">Cont:</span> <span className="font-medium">{item.asn_no_container || "-"}</span></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className="text-gray-500 text-xs block mb-1">Rak:</span>
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                            {item.block_location || "Belum ditentukan"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Stripping: {item.asn_tanggal_stripping || "-"}</span>
                          <span className="text-orange-600 dark:text-orange-400 text-xs font-medium">Timbun: {calculateLamaTimbun(item.asn_tanggal_stripping)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <div><span className="text-gray-500 text-xs">Qty:</span> <span className="font-bold">{item.qty_expected}</span></div>
                        <div><span className="text-gray-500 text-xs">Kg:</span> {Number(item.actual_weight || 0).toFixed(2)}</div>
                        <div><span className="text-gray-500 text-xs">CBM:</span> {Number(item.actual_volume || 0).toFixed(3)}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center align-middle">
                      {item.photo_proof ? (
                        <button 
                          onClick={() => setSelectedPhoto(
                            item.photo_proof!.startsWith('http') 
                              ? item.photo_proof! 
                              : `${apiUrl}/photos/${item.photo_proof?.replace('photo_proofs/', '')}`
                          )}
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors inline-flex justify-center items-center"
                          title="Lihat Foto"
                        >
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Photo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img src={selectedPhoto} alt="Bukti Foto" className="w-full h-auto rounded-lg object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
