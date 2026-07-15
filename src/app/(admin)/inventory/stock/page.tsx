"use client";

import React, { useState, useEffect } from "react";
import { Package, Search, Filter } from "lucide-react";

interface AsnItem {
  id: number;
  asn_id: number;
  item_code: string;
  item_name: string;
  qty_expected: number;
  actual_weight?: number;
  actual_volume?: number;
}

interface Asn {
  id: number;
  asn_number: string;
  status: string;
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
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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
        
        // Filter ONLY received ASNs
        const receivedAsns = asns.filter(a => a.status === 'RECEIVED');
        
        // Aggregate items
        const stockMap = new Map<string, StockSummary>();
        
        receivedAsns.forEach(asn => {
          if (asn.items) {
            asn.items.forEach(item => {
              if (stockMap.has(item.item_code)) {
                const existing = stockMap.get(item.item_code)!;
                existing.total_qty += Number(item.qty_expected) || 0;
                existing.total_weight += Number(item.actual_weight) || 0;
                existing.total_volume += Number(item.actual_volume) || 0;
              } else {
                stockMap.set(item.item_code, {
                  item_code: item.item_code,
                  item_name: item.item_name,
                  total_qty: Number(item.qty_expected) || 0,
                  total_weight: Number(item.actual_weight) || 0,
                  total_volume: Number(item.actual_volume) || 0,
                });
              }
            });
          }
        });
        
        setSummary(Array.from(stockMap.values()));
      }
    } catch (error) {
      console.error("Error fetching stock summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSummary = summary.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-brand-500" />
          Ringkasan Stok (Received)
        </h1>
        <p className="text-sm text-gray-500">Agregasi stok dari barang-barang yang telah diterima (Status ASN: RECEIVED).</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Cari barang atau kode..." 
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
        ) : filteredSummary.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800/50">
            {searchTerm ? 'Barang tidak ditemukan.' : 'Belum ada stok barang yang masuk (Received).'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-semibold">Kode Barang</th>
                  <th className="p-4 font-semibold">Nama Barang</th>
                  <th className="p-4 font-semibold text-right">Total Qty (Colli)</th>
                  <th className="p-4 font-semibold text-right">Total Berat (Kg)</th>
                  <th className="p-4 font-semibold text-right">Total Volume (CBM)</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono font-medium text-gray-600 dark:text-gray-300">
                        {item.item_code}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{item.item_name}</td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-lg text-brand-600 dark:text-brand-400">
                        {item.total_qty}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                      {item.total_weight.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                      {item.total_volume.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
