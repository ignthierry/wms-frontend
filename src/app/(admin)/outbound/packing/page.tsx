"use client";

import React, { useState, useEffect } from "react";
import { PackageCheck, Search, RefreshCcw, Package, FileText, MapPin, AlertCircle, Truck, X, Save, Boxes, Camera } from "lucide-react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function OutboundPackingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Packaging form
  const [packForm, setPackForm] = useState({ qty_out: "", item_condition: "NORMAL", remarks: "" });
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const res = await fetch(`${apiUrl}/outbound/packing`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching packing items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (item: any) => {
    setSelectedItem(item);
    setPackForm({ qty_out: String(item.qty_expected || 1), item_condition: item.item_condition || "NORMAL", remarks: "" });
    setPhotoPreviews([]);
    setPhotoFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setPhotoPreviews([]);
    setPhotoFiles([]);
    setIsSaving(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      const newPreviews: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        const previewUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newPreviews.push(previewUrl);
      }
      setPhotoFiles((prev) => [...prev, ...files]);
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memproses foto", "error");
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSaving(true);
    try {
      const token = Cookies.get("auth_token");
      const formData = new FormData();
      formData.append("qty_out", packForm.qty_out);
      formData.append("item_condition", packForm.item_condition);
      formData.append("remarks", packForm.remarks);
      if (photoFiles.length > 0) {
        photoFiles.forEach((f) => formData.append("photo_proof_files[]", f));
      }

      const res = await fetch(`${apiUrl}/outbound/packing/${selectedItem.id}`, {
        method: "POST",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Pengemasan & verifikasi selesai. Barang siap untuk surat jalan.", "success");
        closeModal();
        fetchItems();
      } else {
        const errData = await res.json();
        Swal.fire("Gagal", errData.message || "Gagal menyimpan data pengemasan.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Terjadi kesalahan jaringan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter((item) =>
    (item.item_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.invoice?.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-brand-500" />
          Pengemasan & Verifikasi
        </h1>
        <p className="text-sm text-gray-500">
          Verifikasi & selesaikan pengemasan barang yang akan keluar sebelum dibuat surat jalan.
        </p>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari Barang / Invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <span className="inline-flex items-center gap-2 text-sm text-gray-500">
            <Boxes className="w-4 h-4 text-brand-500" />
            {filteredItems.length} barang siap diverifikasi
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <PackageCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Tidak ada barang yang menunggu pengemasan.</p>
            <p className="text-sm mt-1">Barang berstatus diterima (RECEIVED) akan ditampilkan di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="py-3 pr-4">Barang</th>
                  <th className="py-3 pr-4">Manifest / Invoice</th>
                  <th className="py-3 pr-4">Kuantitas</th>
                  <th className="py-3 pr-4">Lokasi</th>
                  <th className="py-3 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                          <Package className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{item.item_name}</p>
                          <p className="text-xs text-gray-500">{item.item_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-500" /> {item.asn?.asn_number || "-"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.invoice?.invoice_number || "Belum ada invoice"}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{item.qty_expected}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">{item.block_location || "-"}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Verifikasi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-brand-600 text-white p-4 flex justify-between items-start">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  <PackageCheck className="w-5 h-5" /> Pengemasan: {selectedItem.item_code}
                </h3>
                <p className="text-sm text-white/90 mt-0.5 font-semibold">{selectedItem.item_name}</p>
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-brand-100 flex items-center gap-1"><FileText className="w-3 h-3" /> ASN: {selectedItem.asn?.asn_number || "-"}</p>
                  <p className="text-xs text-brand-100 flex items-center gap-1"><FileText className="w-3 h-3" /> Invoice: {selectedItem.invoice?.invoice_number || "Belum ada"}</p>
                </div>
              </div>
              <button onClick={closeModal} className="bg-brand-700 hover:bg-brand-800 px-3 py-1 rounded text-xs font-semibold shadow-sm">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Qty Keluar</label>
                  <input
                    type="number"
                    min="1"
                    value={packForm.qty_out}
                    onChange={(e) => setPackForm({ ...packForm, qty_out: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Kondisi</label>
                  <select
                    value={packForm.item_condition}
                    onChange={(e) => setPackForm({ ...packForm, item_condition: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="RUSAK">Rusak</option>
                    <option value="BASAH">Basah</option>
                    <option value="QUARANTINE">Karantina</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Catatan / Remarks</label>
                <textarea
                  value={packForm.remarks}
                  onChange={(e) => setPackForm({ ...packForm, remarks: e.target.value })}
                  placeholder="Catatan verifikasi packing..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Foto Bukti Packing (Out)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 transition-colors">
                  <Camera className="w-6 h-6 mb-1 text-brand-500" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Ambil Foto Bukti Packing</p>
                  <input type="file" className="hidden" accept="image/*" capture="environment" multiple ref={fileInputRef} onChange={handlePhotoCapture} />
                </label>
                {photoPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square">
                        <img src={preview} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Menyimpan..." : "Verifikasi & Selesai"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}