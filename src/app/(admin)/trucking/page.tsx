"use client";

import React, { useState, useEffect } from "react";
import { Truck, Plus, Search, Pencil, Trash2, RefreshCcw, X, Save, Building2, Star } from "lucide-react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function headers() {
  const h: any = { "Accept": "application/json" };
  const token = Cookies.get("auth_token");
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

const emptyForm = {
  name: "", company_code: "", address: "", phone: "", email: "",
  pic_name: "", pic_phone: "", npwp: "", is_ours: false, is_active: true,
};

export default function TruckingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/truckings`, { headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || data);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ ...item }); setIsModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editing ? `${apiUrl}/truckings/${editing.id}` : `${apiUrl}/truckings`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        Swal.fire("Berhasil", editing ? "Trucking diperbarui." : "Trucking ditambahkan.", "success");
        setIsModalOpen(false);
        fetchItems();
      } else {
        const el = await res.json();
        Swal.fire("Gagal", el.message || "Gagal menyimpan.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menyimpan.", "error");
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (item: any) => {
    const conf = await Swal.fire({ title: "Hapus Trucking?", text: item.name, icon: "warning", showCancelButton: true, confirmButtonText: "Hapus", cancelButtonText: "Batal" });
    if (!conf.isConfirmed) return;
    const res = await fetch(`${apiUrl}/truckings/${item.id}`, { method: "DELETE", headers: headers() });
    if (res.ok) { Swal.fire("Terhapus", "", "success"); fetchItems(); }
  };

  const filtered = items.filter(i =>
    (i.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.company_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-brand-500" /> Trucking Supplier
        </h1>
        <button onClick={openCreate} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Trucking
        </button>
      </div>
      <p className="text-sm text-gray-500 -mt-3">Kelola penyedia jasa trucking (milik sendiri milik sendiri & pihak ketiga).</p>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-72 mb-5">
          <input type="text" placeholder="Cari Trucking..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500"><Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Belum ada trucking supplier.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/40 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/10">
                      <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-1.5">
                        {item.name}
                        {item.is_ours && <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full"><Star className="w-2.5 h-2.5" /> MILIK KITA</span>}
                      </p>
                      <p className="text-xs text-gray-500">{item.company_code || "-"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300'}`}>
                    {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <p>📍 {item.address || "-"}</p>
                  <p>📞 {item.phone || "-"}</p>
                  <p>✉️ {item.email || "-"}</p>
                  <p className="text-blue-600 dark:text-blue-400">PIC: {item.pic_name || "-"} {item.pic_phone ? `(${item.pic_phone})` : ""}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.tarifs?.length || 0} tarif</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="bg-brand-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Building2 className="w-5 h-5" /> {editing ? "Edit Trucking" : "Tambah Trucking"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-brand-700 hover:bg-brand-800 p-1 rounded"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Trucking *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Kode</label>
                  <input value={form.company_code} onChange={(e) => set("company_code", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Telepon</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                  <input value={form.address} onChange={(e) => set("address", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">NPWP</label>
                  <input value={form.npwp} onChange={(e) => set("npwp", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">PIC</label>
                  <input value={form.pic_name} onChange={(e) => set("pic_name", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">PIC Telepon</label>
                  <input value={form.pic_phone} onChange={(e) => set("pic_phone", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={!!form.is_ours} onChange={(e) => set("is_ours", e.target.checked)} className="w-4 h-4" />
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Trucking milik kita
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={!!form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="w-4 h-4" />
                  Aktif
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 flex items-center justify-center gap-2 disabled:opacity-70">
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}