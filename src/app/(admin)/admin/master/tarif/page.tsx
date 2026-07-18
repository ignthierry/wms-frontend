"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag, Search, Save, X } from "lucide-react";
import Swal from "sweetalert2";
import { Modal } from "@/components/ui/modal";

export default function MasterTarifPage() {
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const initialForm = {
    nama_tarif: "",
    storage_masa_1: 0,
    storage_masa_2: 0,
    storage_masa_3: 0,
    storage_masa_4: 0,
    administrasi: 0,
    minimum_tarif: 0,
    mekanis: 0,
    service: 0,
    surveyor_fee: 0,
    behandle: 0,
    stiker: 0,
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchTarifs();
  }, []);

  const fetchTarifs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/tarifs`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setTarifs(data);
      }
    } catch (error) {
      console.error("Error fetching tarifs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (tarif: any = null) => {
    if (tarif) {
      setEditingId(tarif.id);
      setFormData({
        nama_tarif: tarif.nama_tarif,
        storage_masa_1: Number(tarif.storage_masa_1) || 0,
        storage_masa_2: Number(tarif.storage_masa_2) || 0,
        storage_masa_3: Number(tarif.storage_masa_3) || 0,
        storage_masa_4: Number(tarif.storage_masa_4) || 0,
        administrasi: Number(tarif.administrasi) || 0,
        minimum_tarif: Number(tarif.minimum_tarif) || 0,
        mekanis: Number(tarif.mekanis) || 0,
        service: Number(tarif.service) || 0,
        surveyor_fee: Number(tarif.surveyor_fee) || 0,
        behandle: Number(tarif.behandle) || 0,
        stiker: Number(tarif.stiker) || 0,
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${apiUrl}/tarifs/${editingId}` : `${apiUrl}/tarifs`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire('Berhasil', `Berhasil ${editingId ? 'memperbarui' : 'menyimpan'} tarif!`, 'success');
        closeModal();
        fetchTarifs();
      } else {
        const errorData = await res.json();
        Swal.fire('Gagal', `Gagal: ${errorData.message || "Terjadi kesalahan"}`, 'error');
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire('Error', 'Terjadi kesalahan sistem saat menyimpan data.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda ingin menghapus tarif ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const res = await fetch(`${apiUrl}/tarifs/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        Swal.fire('Terhapus!', 'Tarif telah dihapus.', 'success');
        fetchTarifs();
      }
    } catch (error) {
      console.error("Error deleting tarif:", error);
      Swal.fire('Error', 'Gagal menghapus tarif.', 'error');
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const filteredTarifs = tarifs.filter(t => 
    (t.nama_tarif || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Tag className="w-6 h-6 text-brand-500" />
            Master Tarif Gudang
          </h1>
          <p className="text-sm text-gray-500">Kelola komponen tarif untuk perhitungan biaya penyimpanan, administrasi, dll.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium shadow-sm shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" /> Tambah Tarif
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Cari Nama Tarif..." 
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
        ) : filteredTarifs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800/50">
            {searchTerm ? 'Tarif tidak ditemukan.' : 'Belum ada data tarif.'}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3 font-semibold">Nama Tarif</th>
                  <th className="p-3 font-semibold text-right">Masa 1</th>
                  <th className="p-3 font-semibold text-right">Masa 2</th>
                  <th className="p-3 font-semibold text-right">Masa 3</th>
                  <th className="p-3 font-semibold text-right">Masa 4</th>
                  <th className="p-3 font-semibold text-right">Administrasi</th>
                  <th className="p-3 font-semibold text-right">Min. Tarif</th>
                  <th className="p-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTarifs.map((tarif, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{tarif.nama_tarif}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.storage_masa_1)}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.storage_masa_2)}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.storage_masa_3)}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.storage_masa_4)}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.administrasi)}</td>
                    <td className="p-3 text-right font-mono text-gray-600 dark:text-gray-400">{formatRupiah(tarif.minimum_tarif)}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(tarif)} className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors dark:bg-blue-500/10 dark:hover:bg-blue-500/20" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tarif.id)} className="p-1.5 text-error-500 bg-error-50 hover:bg-error-100 rounded-md transition-colors dark:bg-error-500/10 dark:hover:bg-error-500/20" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={closeModal} className="max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-500" />
            {editingId ? 'Edit Tarif' : 'Tambah Tarif Baru'}
          </h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nama Kategori Tarif <span className="text-error-500">*</span></label>
                  <input required type="text" name="nama_tarif" value={formData.nama_tarif} onChange={handleInputChange} placeholder="Contoh: Tarif Normal Gudang A" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-gray-800/30 dark:border-gray-800">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Komponen Storage</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Masa 1 (Rp)</label>
                        <input type="number" name="storage_masa_1" value={formData.storage_masa_1} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Masa 2 (Rp)</label>
                        <input type="number" name="storage_masa_2" value={formData.storage_masa_2} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Masa 3 (Rp)</label>
                        <input type="number" name="storage_masa_3" value={formData.storage_masa_3} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Masa 4 (Rp)</label>
                        <input type="number" name="storage_masa_4" value={formData.storage_masa_4} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-gray-800/30 dark:border-gray-800">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Komponen Lainnya</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Administrasi</label>
                          <input type="number" name="administrasi" value={formData.administrasi} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Minimum Tarif</label>
                          <input type="number" name="minimum_tarif" value={formData.minimum_tarif} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mekanis</label>
                          <input type="number" name="mekanis" value={formData.mekanis} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Service</label>
                          <input type="number" name="service" value={formData.service} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Surveyor Fee</label>
                          <input type="number" name="surveyor_fee" value={formData.surveyor_fee} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Behandle</label>
                          <input type="number" name="behandle" value={formData.behandle} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stiker</label>
                        <input type="number" name="stiker" value={formData.stiker} onChange={handleInputChange} min="0" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 font-medium text-sm transition-colors">Batal</button>
                <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 font-medium text-sm shadow-sm shadow-brand-500/20 transition-colors">
                  <Save className="w-4 h-4" /> Simpan Tarif
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
