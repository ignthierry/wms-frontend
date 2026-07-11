"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Printer, Save, CheckCircle2 } from "lucide-react";

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

export default function ReceivingTallyingPage() {
  const [asns, setAsns] = useState<Asn[]>([]);
  const [selectedAsnId, setSelectedAsnId] = useState<string>("");
  const [items, setItems] = useState<AsnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchAsns();
  }, []);

  const fetchAsns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setAsns(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching ASNs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsnId) {
      const asn = asns.find((a) => a.id.toString() === selectedAsnId);
      if (asn && asn.items) {
        setItems(asn.items);
      } else {
        // fetch single ASN to get items if not nested
        fetch(`${apiUrl}/asns/${selectedAsnId}`, { headers: { "Accept": "application/json" } })
          .then(res => res.json())
          .then(data => {
            const singleAsn = data.data || data;
            setItems(singleAsn.items || []);
          });
      }
    } else {
      setItems([]);
    }
  }, [selectedAsnId, asns, apiUrl]);

  const handleInputChange = (id: number, field: "actual_weight" | "actual_volume", value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value === "" ? undefined : parseFloat(value) } : item
      )
    );
  };

  const handleSaveItem = async (item: AsnItem) => {
    setSavingId(item.id);
    try {
      const res = await fetch(`${apiUrl}/asn-items/${item.id}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          actual_weight: item.actual_weight,
          actual_volume: item.actual_volume
        })
      });
      if (res.ok) {
        alert("Data pengukuran berhasil disimpan!");
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Receiving & Tallying (LCL)</h1>
        <p className="text-sm text-gray-500">Pilih ASN dan catat hasil ukur ulang (Weight/CBM) serta cetak label per koli.</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih ASN / Manifest</label>
        <select 
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-500"
          value={selectedAsnId}
          onChange={(e) => setSelectedAsnId(e.target.value)}
        >
          <option value="">-- Pilih ASN --</option>
          {asns.map(asn => (
            <option key={asn.id} value={asn.id}>{asn.asn_number} - {asn.status}</option>
          ))}
        </select>
      </div>

      {selectedAsnId && items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Daftar Barang (Tally Sheet)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col gap-4">
                
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 dark:border-gray-700">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{item.item_name}</h3>
                    <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">{item.item_code}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-gray-500">Qty (Colli)</span>
                    <span className="font-bold text-xl text-brand-500">{item.qty_expected}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Actual Weight (Kg)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      value={item.actual_weight || ""}
                      onChange={(e) => handleInputChange(item.id, "actual_weight", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Actual Volume (CBM)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      placeholder="0.000"
                      value={item.actual_volume || ""}
                      onChange={(e) => handleInputChange(item.id, "actual_volume", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleSaveItem(item)}
                    disabled={savingId === item.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white p-2 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {savingId === item.id ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan</>}
                  </button>
                  <Link 
                    href={`/inbound/receiving/${item.id}/print`} 
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white p-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Label Koli
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAsnId && items.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
          Tidak ada barang pada ASN ini.
        </div>
      )}
    </div>
  );
}
