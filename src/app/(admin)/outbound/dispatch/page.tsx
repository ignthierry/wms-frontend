"use client";

import React, { useState, useEffect } from "react";
import { Truck, FileText, Search, FileOutput, Printer } from "lucide-react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function DispatchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    expedition_name: "",
    driver_name: "",
    driver_phone: "",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/outbound/ready-to-dispatch`, { 
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        } 
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || data);
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
      expedition_name: "",
      driver_name: "",
      driver_phone: "",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/outbound/dispatch/generate`, {
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
        const result = await res.json();
        Swal.fire({
            title: 'Berhasil', 
            text: 'Surat Jalan berhasil dibuat!', 
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Cetak Sekarang',
            cancelButtonText: 'Tutup'
        }).then((result) => {
            if (result.isConfirmed) {
                // Future enhancement: redirect to print page
                // router.push(`/outbound/dispatch/${dispatch_id}/print`);
                Swal.fire('Info', 'Fitur cetak dokumen akan segera hadir.', 'info');
            }
        });
        closeModal();
        fetchItems(); // Refresh the list
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
    (item.item_code || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.invoice?.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileOutput className="w-6 h-6 text-brand-500" />
          Pengiriman (Surat Jalan)
        </h1>
        <p className="text-sm text-gray-500">Buat Surat Jalan untuk barang-barang yang sudah melewati proses QC Outbound.</p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Cari Barang / Invoice..." 
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
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada barang yang siap untuk dikirim.</p>
            <p className="text-sm mt-1">Pastikan barang telah melewati tahap QC Outbound.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                  <th className="p-3 font-semibold rounded-tl-lg">Item</th>
                  <th className="p-3 font-semibold">No. Invoice</th>
                  <th className="p-3 font-semibold">Lokasi Terakhir</th>
                  <th className="p-3 font-semibold text-right rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.item_code}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.item_name}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-medium">{item.invoice?.invoice_number || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                        {item.block_location || '-'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => openModal(item)}
                        className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Buat Surat Jalan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" />
                Data Driver & Ekspedisi
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
                <strong>Item:</strong> {selectedItem.item_code} <br/>
                <span className="text-xs opacity-80">{selectedItem.item_name}</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Ekspedisi</label>
                  <input 
                    type="text" 
                    name="expedition_name"
                    required
                    value={formData.expedition_name}
                    onChange={handleInputChange}
                    placeholder="Contoh: PT. JNE / Ekspedisi Internal"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Sopir</label>
                    <input 
                      type="text" 
                      name="driver_name"
                      required
                      value={formData.driver_name}
                      onChange={handleInputChange}
                      placeholder="Nama Lengkap"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. HP Sopir</label>
                    <input 
                      type="text" 
                      name="driver_phone"
                      required
                      value={formData.driver_phone}
                      onChange={handleInputChange}
                      placeholder="0812..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium shadow-sm transition-colors flex items-center gap-2"
                >
                  Buat Surat Jalan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
