"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Filter, Image as ImageIcon, XCircle, Download, Calendar, Maximize2, X } from "lucide-react";

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
  
  photos?: { id: number; photo_proof: string; jenis_foto: string }[];
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
  const [selectedItemForPhoto, setSelectedItemForPhoto] = useState<AsnItem | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  });

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
    
    // Parse tanggal_stripping carefully to avoid timezone issues
    let start = new Date(tanggal_stripping);
    const ymdMatch = tanggal_stripping.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
    const dmyMatch = tanggal_stripping.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
    
    if (ymdMatch) {
      start = new Date(Number(ymdMatch[1]), Number(ymdMatch[2]) - 1, Number(ymdMatch[3]));
    } else if (dmyMatch) {
      start = new Date(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1]));
    } else if (isNaN(start.getTime())) {
      return "-";
    }
    start.setHours(0, 0, 0, 0);
    
    // Parse reportPeriod avoiding timezone shift
    let endDate = new Date();
    if (reportPeriod) {
      if (reportPeriod.includes('T')) {
        endDate = new Date(reportPeriod);
      } else {
        const [year, month, day] = reportPeriod.split('-');
        endDate = new Date(Number(year), Number(month) - 1, Number(day));
      }
    }
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Belum";
    if (diffDays === 0) return "1 Hari";
    
    return `${diffDays} Hari`;
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
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Periode Laporan:</span>
              <input 
                type="datetime-local"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" />
              Filter Lanjutan
            </button>
          </div>
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
                      {item.photos && item.photos.length > 0 ? (
                        <button 
                          onClick={() => setSelectedItemForPhoto(item)}
                          className="p-2 bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors inline-flex justify-center items-center relative"
                          title="Lihat Galeri Foto"
                        >
                          <ImageIcon className="w-5 h-5" />
                          <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">{item.photos.length}</span>
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

      {selectedItemForPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedItemForPhoto(null)}>
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {selectedItemForPhoto.item_name}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {selectedItemForPhoto.item_code} | POS: {selectedItemForPhoto.pos_number || "-"}
                </p>
              </div>
              <button 
                onClick={() => setSelectedItemForPhoto(null)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Gallery Content */}
            <div className="bg-gray-100 dark:bg-black p-4 min-h-[300px] max-h-[70vh] overflow-y-auto">
              {selectedItemForPhoto.photos && selectedItemForPhoto.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedItemForPhoto.photos.map((photo: any, idx: number) => {
                    const url = photo.photo_proof.startsWith('http') 
                      ? photo.photo_proof 
                      : `${apiUrl}/photos/${photo.photo_proof.replace('photo_proofs/', '')}`;
                    return (
                      <div key={idx} className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:shadow-xl transition-all [&:hover>img]:scale-110 [&:hover>div]:opacity-100" onClick={() => setFullscreenPhoto(url)}>
                        <img 
                          src={url} 
                          alt={`Foto ${photo.jenis_foto}`} 
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                           <Maximize2 className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12 flex justify-between items-end opacity-0 transition-opacity duration-300">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-brand-600/90 px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">{photo.jenis_foto}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const response = await fetch(url);
                                const blob = await response.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = `Photo_${selectedItemForPhoto.item_code}_${photo.jenis_foto}_${idx}.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(blobUrl);
                              } catch (err) {
                                console.error("Download failed:", err);
                                alert("Gagal mengunduh foto.");
                              }
                            }}
                            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg transition-colors backdrop-blur-sm"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                  <ImageIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" />
                  <p>Belum ada galeri foto.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setFullscreenPhoto(null)}>
          <button 
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={fullscreenPhoto} 
            alt="Fullscreen View" 
            className="max-w-[95vw] max-h-[95vh] object-contain select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
