"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Truck, FileText, Search, Plus, Calculator, Download } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "@/components/form/date-picker";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function DeliveryRequestPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    no_sppb: "",
    tgl_sppb: "",
    jenis_sppb: "",
    no_referensi: "",
    tgl_invoice: "",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/asn-items`, { 
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        } 
      });
      if (res.ok) {
        const data = await res.json();
        const allItems = data.data || data;
        
        // Filter items that are received
        const eligible = allItems.filter((i: any) => i.status === 'RECEIVED');
        setItems(eligible);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
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
    if (!selectedItem) return;

    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/delivery-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          asn_item_id: selectedItem.id,
          ...formData
        })
      });

      if (res.ok) {
        Swal.fire('Berhasil', 'Berhasil membuat Permintaan Pengeluaran dan Invoice!', 'success');
        closeModal();
        fetchItems(); // Refresh
      } else {
        const errorData = await res.json();
        Swal.fire('Gagal', `Gagal: ${errorData.message || "Terjadi kesalahan"}`, 'error');
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire('Error', 'Terjadi kesalahan sistem saat menyimpan data.', 'error');
    }
  };

  const filteredItems = items.filter(item => 
    (item.host_bl || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.asn?.asn_number || "").toLowerCase().includes(searchTerm.toLowerCase())
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
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800/50">
            {searchTerm ? 'Barang tidak ditemukan.' : 'Tidak ada Barang yang memenuhi syarat (Status: RECEIVED).'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  <th className="p-3 font-semibold">Host BL</th>
                  <th className="p-3 font-semibold">Tgl Stripping</th>
                  <th className="p-3 font-semibold">No Container</th>
                  <th className="p-3 font-semibold">No Manifest</th>
                  <th className="p-3 font-semibold">Jenis Barang</th>
                  <th className="p-3 font-semibold text-right">Jumlah</th>
                  <th className="p-3 font-semibold text-right">Berat (Kg)</th>
                  <th className="p-3 font-semibold text-right">CBM</th>
                  <th className="p-3 font-semibold">Consignee</th>
                  <th className="p-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{item.host_bl || '-'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.asn?.tanggal_stripping || '-'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.asn?.no_container || '-'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.asn?.no_master_bl || '-'}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.item_name || '-'}</td>
                    <td className="p-3 text-right text-gray-600 dark:text-gray-300">{item.qty_expected || 0}</td>
                    <td className="p-3 text-right text-gray-600 dark:text-gray-300">{item.actual_weight || 0}</td>
                    <td className="p-3 text-right text-gray-600 dark:text-gray-300">{item.actual_volume || 0}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.consignee?.name || '-'}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {item.invoice ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => router.push(`/outbound/request/${item.id}/perincian`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium dark:bg-blue-500/15 dark:text-blue-500 dark:hover:bg-blue-500/25"
                          >
                            <Calculator className="w-4 h-4" /> Perincian
                          </button>
                          <button 
                            onClick={() => Swal.fire('Info', 'Fitur download/lihat Invoice segera hadir', 'info')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <FileText className="w-4 h-4" /> Invoice
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => openModal(item)}
                          title="Buat DR & Invoice"
                          className="inline-flex items-center justify-center w-8 h-8 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && selectedItem && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-start justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 my-8 sm:my-12">
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
                Membuat Delivery Request untuk Barang: <span className="font-bold">{selectedItem.item_name} (Host BL: {selectedItem.host_bl || '-'})</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No SPPB</label>
                <input required type="text" name="no_sppb" value={formData.no_sppb} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  id="tgl_sppb"
                  label="Tanggal SPPB"
                  dateFormat="Y-m-d"
                  isStatic={true}
                  defaultDate={formData.tgl_sppb || undefined}
                  onChange={(_, dateStr) => setFormData({ ...formData, tgl_sppb: dateStr })}
                />
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
                <DatePicker
                  id="tgl_invoice"
                  label="Tanggal Invoice"
                  dateFormat="Y-m-d"
                  isStatic={true}
                  defaultDate={formData.tgl_invoice || undefined}
                  onChange={(_, dateStr) => setFormData({ ...formData, tgl_invoice: dateStr })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium text-sm transition-colors">Batal</button>
                <button 
                  type="button" 
                  onClick={() => window.open(`/outbound/request/${selectedItem.id}/perincian?tgl_invoice=${formData.tgl_invoice}`, '_blank')}
                  className="px-4 py-2 text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/50 font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> Perincian
                </button>
                <button type="submit" className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 font-medium text-sm shadow-sm shadow-brand-500/20 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Buat Invoice
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
