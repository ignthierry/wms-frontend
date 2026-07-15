"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Printer, QrCode, Save, CheckCircle2, XCircle } from "lucide-react";
import Swal from "sweetalert2";

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
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");

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
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data pengukuran berhasil disimpan!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Gagal', 'Gagal menyimpan data.', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleCompleteReceiving = async () => {
    const currentAsn = asns.find(a => a.id.toString() === selectedAsnId);
    if (currentAsn?.status === 'RECEIVED') {
      Swal.fire('Info', 'ASN ini sudah berstatus Received.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Pastikan semua barang sudah sesuai sebelum mengubah status ke Received.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Tandai Received!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/asns/${selectedAsnId}`, {
          method: "PUT",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ status: "RECEIVED" })
        });
        
        if (res.ok) {
          setAsns(prev => prev.map(a => a.id.toString() === selectedAsnId ? { ...a, status: "RECEIVED" } : a));
          Swal.fire('Berhasil!', 'Status ASN telah diubah ke Received.', 'success');
        } else {
          Swal.fire('Gagal', 'Gagal mengubah status.', 'error');
        }
      } catch (e) {
        console.error("Failed to update ASN status:", e);
        Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
      }
    }
  };

  const handleCancelAsn = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "ASN ini akan dibatalkan (CANCEL).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Batalkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/asns/${selectedAsnId}`, {
          method: "PUT",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ status: "CANCEL" })
        });
        
        if (res.ok) {
          setAsns(prev => prev.map(a => a.id.toString() === selectedAsnId ? { ...a, status: "CANCEL" } : a));
          Swal.fire('Berhasil!', 'Status ASN telah diubah ke CANCEL.', 'success');
        } else {
          Swal.fire('Gagal', 'Gagal mengubah status.', 'error');
        }
      } catch (e) {
        console.error("Failed to update ASN status:", e);
        Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Receiving & Tallying (LCL)</h1>
        <p className="text-sm text-gray-500">Pilih ASN dan catat hasil ukur ulang (Weight/CBM) serta cetak label per koli.</p>
      </div>

      {!selectedAsnId ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Pilih ASN / Manifest</h2>
            <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg dark:bg-gray-800">
              <button onClick={() => setStatusFilter("ALL")} className={`px-4 py-2 text-sm font-semibold rounded-md ${statusFilter === "ALL" ? "bg-white shadow-sm dark:bg-gray-700" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>Semua</button>
              <button onClick={() => setStatusFilter("PENDING")} className={`px-4 py-2 text-sm font-semibold rounded-md ${statusFilter === "PENDING" ? "bg-white shadow-sm dark:bg-gray-700 text-yellow-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>Pending</button>
              <button onClick={() => setStatusFilter("RECEIVED")} className={`px-4 py-2 text-sm font-semibold rounded-md ${statusFilter === "RECEIVED" ? "bg-white shadow-sm dark:bg-gray-700 text-green-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>Received</button>
              <button onClick={() => setStatusFilter("CANCEL")} className={`px-4 py-2 text-sm font-semibold rounded-md ${statusFilter === "CANCEL" ? "bg-white shadow-sm dark:bg-gray-700 text-red-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>Cancel</button>
            </div>
          </div>
          {asns.filter(a => statusFilter === "ALL" || a.status === statusFilter).length === 0 ? (
            <p className="text-sm text-gray-500 bg-white p-6 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 text-center">
              Tidak ada data ASN dengan status {statusFilter}.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {asns.filter(a => statusFilter === "ALL" || a.status === statusFilter).map(asn => (
                <div 
                  key={asn.id} 
                  onClick={() => setSelectedAsnId(asn.id.toString())}
                  className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm cursor-pointer hover:border-brand-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{asn.asn_number}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      asn.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      asn.status === 'CANCEL' ? 'bg-red-100 text-red-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {asn.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Klik untuk memproses penerimaan</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ASN Terpilih</p>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">
                {asns.find(a => a.id.toString() === selectedAsnId)?.asn_number}
              </h2>
              {asns.find(a => a.id.toString() === selectedAsnId)?.status === 'RECEIVED' && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  RECEIVED
                </span>
              )}
              {asns.find(a => a.id.toString() === selectedAsnId)?.status === 'CANCEL' && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  CANCEL
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {asns.find(a => a.id.toString() === selectedAsnId)?.status !== 'RECEIVED' && asns.find(a => a.id.toString() === selectedAsnId)?.status !== 'CANCEL' && (
              <>
                <button 
                  onClick={handleCompleteReceiving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tandai Received
                </button>
                <button 
                  onClick={handleCancelAsn}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
            <button 
              onClick={() => setSelectedAsnId("")}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Ganti ASN
            </button>
          </div>
        </div>
      )}

      {selectedAsnId && items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Daftar Barang (Tally Sheet)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col gap-4">
                
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 dark:border-gray-700">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{item.item_name}</h3>
                    <p className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded inline-block mt-1">{item.item_code}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-gray-500 dark:text-gray-400">Qty (Colli)</span>
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
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                      className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                    href={`/inbound/asn/pos/${item.id}/print`} 
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white p-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                  >
                    <QrCode className="w-4 h-4" /> Print Label QR
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
