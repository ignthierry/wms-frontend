"use client";

import React, { useState, useEffect } from "react";
import { Truck, FileText, Search, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function DeliveryRequestPage() {
  const [asns, setAsns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsn, setSelectedAsn] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    no_sppb: "",
    tgl_sppb: "",
    jenis_sppb: "",
    no_referensi: "",
    tgl_invoice: "",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchEligibleAsns();
  }, []);

  const fetchEligibleAsns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const allAsns = data.data || data;
        
        // Filter ASNs that are received in stock
        const eligible = allAsns.filter((a: any) => a.status === 'RECEIVED' || a.status === 'COMPLETED');
        setAsns(eligible);
      }
    } catch (error) {
      console.error("Error fetching ASNs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (asn: any) => {
    setSelectedAsn(asn);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsn(null);
    setFormData({
      no_sppb: "",
      tgl_sppb: "",
      jenis_sppb: "",
      no_referensi: "",
      tgl_invoice: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsn) return;

    try {
      const res = await fetch(`${apiUrl}/delivery-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          asn_id: selectedAsn.id,
          ...formData
        })
      });

      if (res.ok) {
        Swal.fire('Berhasil', 'Berhasil membuat Permintaan Pengeluaran dan Invoice!', 'success');
        closeModal();
        fetchEligibleAsns(); // Refresh
      } else {
        const errorData = await res.json();
        Swal.fire('Gagal', `Gagal: ${errorData.message || "Terjadi kesalahan"}`, 'error');
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire('Error', 'Terjadi kesalahan sistem saat menyimpan data.', 'error');
    }
  };

  const filteredAsns = asns.filter(asn => 
    asn.asn_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (asn.no_master_bl || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-brand-500" />
          Permintaan Pengiriman
        </h1>
        <p className="text-sm text-gray-500">Buat permintaan pengeluaran barang dan invoice dari dokumen ASN yang telah diterima di gudang.</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Cari No ASN / BL..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredAsns.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800/50">
            {searchTerm ? 'ASN tidak ditemukan.' : 'Tidak ada ASN yang memenuhi syarat (Status: RECEIVED).'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 font-semibold">No ASN</th>
                  <th className="p-4 font-semibold">No Master BL</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAsns.map((asn, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{asn.asn_number}</span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{asn.no_master_bl || '-'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-success-50 text-success-600 rounded-full text-xs font-medium dark:bg-success-500/15 dark:text-success-500">
                        {asn.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openModal(asn)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" /> Buat DR & Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && selectedAsn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                Form Permintaan Pengiriman
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-4 text-sm text-gray-600 dark:text-gray-300">
                Membuat Delivery Request untuk ASN: <span className="font-bold">{selectedAsn.asn_number}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No SPPB</label>
                <input required type="text" name="no_sppb" value={formData.no_sppb} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal SPPB</label>
                  <input required type="date" name="tgl_sppb" value={formData.tgl_sppb} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis SPPB</label>
                  <input required type="text" name="jenis_sppb" value={formData.jenis_sppb} onChange={handleInputChange} placeholder="Contoh: Merah/Kuning" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No Referensi</label>
                  <input required type="text" name="no_referensi" value={formData.no_referensi} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Invoice</label>
                  <input required type="date" name="tgl_invoice" value={formData.tgl_invoice} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium text-sm transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 font-medium text-sm shadow-sm shadow-brand-500/20 transition-colors">Simpan & Buat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
