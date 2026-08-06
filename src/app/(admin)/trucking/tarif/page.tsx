"use client";

import React, { useState, useEffect } from "react";
import { Banknote, Plus, Search, Pencil, Trash2, RefreshCcw, X, Save, Truck } from "lucide-react";
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
  trucking_company_id: "", nama_tarif: "", origin: "", destination: "",
  vehicle_type: "", rate: "", rate_unit: "per_trip", minimum_charge: 0, is_active: true,
};

export default function TruckingTarifPage() {
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [tr, cp] = await Promise.all([
        fetch(`${apiUrl}/trucking-tarifs`, { headers: headers() }),
        fetch(`${apiUrl}/truckings`, { headers: headers() }),
      ]);
      const trData = await tr.json();
      const cpData = await cp.json();
      setTarifs(trData.data || trData);
      setCompanies(cpData.data || cpData);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const fmt = (n: any) => {
    const v = Number(n || 0);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
  };

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, trucking_company_id: companies[0]?.id || "" }); setIsModalOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ ...t }); setIsModalOpen(true); };
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editing ? `${apiUrl}/trucking-tarifs/${editing.id}` : `${apiUrl}/trucking-tarifs`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rate: Number(form.rate), minimum_charge: Number(form.minimum_charge) }),
      });
      if (res.ok) { Swal.fire("Berhasil", editing ? "Tarif diperbarui." : "Tarif ditambahkan.", "success"); setIsModalOpen(false); fetchAll(); }
      else { const el = await res.json(); Swal.fire("Gagal", el.message || "Gagal.", "error"); }
    } catch { Swal.fire("Error", "Gagal menyimpan.", "error"); } finally { setIsSaving(false); }
  };

  const handleDelete = async (t: any) => {
    const conf = await Swal.fire({ title: "Hapus Tarif?", text: t.nama_tarif || "Tarif", icon: "warning", showCancelButton: true, confirmButtonText: "Hapus", cancelButtonText: "Batal" });
    if (!conf.isConfirmed) return;
    const res = await fetch(`${apiUrl}/trucking-tarifs/${t.id}`, { method: "DELETE", headers: headers() });
    if (res.ok) { Swal.fire("Terhapus", "", "success"); fetchAll(); }
  };

  const companyName = (id: any) => companies.find(c => c.id === id)?.name || "-";

  const filtered = tarifs.filter(t =>
    (t.nama_tarif || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.origin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.destination || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Banknote className="w-6 h-6 text-brand-500" /> Tarif Trucking
        </h1>
        <button onClick={openCreate} className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-sm transition-colors">
          <Plus className="w-4 h-4" /> Tambah Tarif
        </button>
      </div>
      <p className="text-sm text-gray-500 -mt-3">Tarif pengiriman trucking per perusahaan.</p>

      <div className="bg-white p-5 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-72 mb-5">
          <input type="text" placeholder="Cari Tarif / Rute..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none" />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500"><Banknote className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>Belum ada tarif trucking.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 uppercase">
                  <th className="py-3 pr-4">Nama Tarif</th>
                  <th className="py-3 pr-4">Vendor</th>
                  <th className="py-3 pr-4">Rute</th>
                  <th className="py-3 pr-4">Kendaraan</th>
                  <th className="py-3 pr-4">Rate</th>
                  <th className="py-3 pr-4">Unit</th>
                  <th className="py-3 pr-4">Min. Charge</th>
                  <th className="py-3 pr-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{t.nama_tarif || "-"}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${t.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300'}`}>{t.is_active ? 'AKTIF' : 'NONAKTIF'}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">{companyName(t.trucking_company_id)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300">{t.origin || "-"} → {t.destination || "-"}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1"><Truck className="w-3 h-3" /> {t.vehicle_type || "-"}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-700 dark:text-gray-200">{fmt(t.rate)}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{t.rate_unit?.replace('_',' ') || "-"}</td>
                    <td className="py-3 pr-4 text-xs text-gray-500">{fmt(t.minimum_charge)}</td>
                    <td className="py-3 pr-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(t)} className="mr-2 p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(t)} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="bg-brand-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Banknote className="w-5 h-5" /> {editing ? "Edit Tarif" : "Tambah Tarif"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-brand-700 hover:bg-brand-800 p-1 rounded"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Vendor Trucking *</label>
                <select required value={form.trucking_company_id} onChange={(e) => set("trucking_company_id", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white">
                  <option value="">-- Pilih Trucking --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Nama Tarif</label>
                  <input value={form.nama_tarif} onChange={(e) => set("nama_tarif", e.target.value)} placeholder="cth. LCL Lokal Jakarta - Cikarang" className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Asal</label>
                  <input value={form.origin} onChange={(e) => set("origin", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tujuan</label>
                  <input value={form.destination} onChange={(e) => set("destination", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tipe Kendaraan</label>
                  <input value={form.vehicle_type} onChange={(e) => set("vehicle_type", e.target.value)} placeholder="cth. Truk Fuso 8 Ton" className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Rate</label>
                  <input type="number" min="0" value={form.rate} onChange={(e) => set("rate", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Satuan</label>
                  <select value={form.rate_unit} onChange={(e) => set("rate_unit", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white">
                    <option value="per_trip">per Trip</option>
                    <option value="per_km">per KM</option>
                    <option value="per_container">per Container</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Minimum Charge</label>
                  <input type="number" min="0" value={form.minimum_charge} onChange={(e) => set("minimum_charge", e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white" />
                </div>
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