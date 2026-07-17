"use client";
import Swal from "sweetalert2";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2, Map, LayoutGrid } from "lucide-react";

interface Warehouse {
  id: number;
  warehouse_name: string;
  code: string;
  address: string;
}

interface Location {
  id: number;
  warehouse_id: number;
  zone: string;
  aisle: string;
  rack_row: string;
  tier: string;
  bin_location: string;
  barcode_loc: string;
  is_empty: boolean | number;
  capacity?: number;
  warehouse?: Warehouse;
}

export default function MasterWarehousePage() {
  const [activeTab, setActiveTab] = useState<"warehouses" | "locations">("warehouses");

  // State for Warehouses
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isWHModalOpen, setIsWHModalOpen] = useState(false);
  const [isWHEditMode, setIsWHEditMode] = useState(false);
  const [whFormData, setWhFormData] = useState({ id: 0, warehouse_name: "", code: "", address: "" });

  // State for Locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isLocEditMode, setIsLocEditMode] = useState(false);
  const [locFormData, setLocFormData] = useState({
    id: 0, warehouse_id: "", zone: "", aisle: "", rack_row: "", tier: "", barcode_loc: "", is_empty: 1, capacity: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.data || data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${apiUrl}/locations`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setLocations(data.data || data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchWarehouses(), fetchLocations()]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- WAREHOUSE HANDLERS ---
  const handleOpenWHModal = (wh?: Warehouse) => {
    if (wh) {
      setIsWHEditMode(true);
      setWhFormData({ ...wh });
    } else {
      setIsWHEditMode(false);
      setWhFormData({ id: 0, warehouse_name: "", code: "", address: "" });
    }
    setIsWHModalOpen(true);
  };

  const handleWHSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isWHEditMode ? `${apiUrl}/warehouses/${whFormData.id}` : `${apiUrl}/warehouses`;
    const method = isWHEditMode ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(whFormData),
      });
      if (res.ok) {
        setIsWHModalOpen(false);
        fetchWarehouses();
      } else {
        Swal.fire("Failed to save warehouse");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWH = async (id: number) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      const res = await fetch(`${apiUrl}/warehouses/${id}`, { method: "DELETE" });
      if (res.ok) fetchWarehouses();
    } catch (e) {
      console.error(e);
    }
  };

  // --- LOCATION HANDLERS ---
  const handleOpenLocModal = (loc?: Location) => {
    if (loc) {
      setIsLocEditMode(true);
      setLocFormData({
        ...loc,
        warehouse_id: loc.warehouse_id.toString(),
        is_empty: loc.is_empty ? 1 : 0,
        capacity: loc.capacity || 0
      });
    } else {
      setIsLocEditMode(false);
      setLocFormData({ id: 0, warehouse_id: "", zone: "", aisle: "", rack_row: "", tier: "", barcode_loc: "", is_empty: 1, capacity: 0 });
    }
    setIsLocModalOpen(true);
  };

  const handleLocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isLocEditMode ? `${apiUrl}/locations/${locFormData.id}` : `${apiUrl}/locations`;
    const method = isLocEditMode ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(locFormData),
      });
      if (res.ok) {
        setIsLocModalOpen(false);
        fetchLocations();
      } else {
        const errorData = await res.json();
        Swal.fire("Failed to save location: " + JSON.stringify(errorData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLoc = async (id: number) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const res = await fetch(`${apiUrl}/locations/${id}`, { method: "DELETE" });
      if (res.ok) fetchLocations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gudang & Layout</h1>
        {activeTab === "warehouses" ? (
          <Button onClick={() => handleOpenWHModal()} className="bg-brand-500 hover:bg-brand-600 text-white">
            + Tambah Gudang
          </Button>
        ) : (
          <Button onClick={() => handleOpenLocModal()} className="bg-brand-500 hover:bg-brand-600 text-white">
            + Tambah Lokasi / Rak
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "warehouses"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("warehouses")}
        >
          <Map className="w-4 h-4" /> Manajemen Gudang (Cabang)
        </button>
        <button
          className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "locations"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("locations")}
        >
          <LayoutGrid className="w-4 h-4" /> Denah & Lokasi Rak
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {activeTab === "warehouses" && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Kode</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Nama Gudang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Alamat</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-right text-theme-xs">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow><TableCell className="px-5 py-4 text-center" colSpan={4}>Loading...</TableCell></TableRow>
                  ) : warehouses.length === 0 ? (
                    <TableRow><TableCell className="px-5 py-4 text-center" colSpan={4}>Belum ada data gudang.</TableCell></TableRow>
                  ) : (
                    warehouses.map((wh) => (
                      <TableRow key={wh.id}>
                        <TableCell className="px-5 py-4 text-theme-sm font-medium">{wh.code}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm">{wh.warehouse_name}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500">{wh.address || "-"}</TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleOpenWHModal(wh)} className="text-gray-500 hover:text-brand-500"><Pencil className="w-4.5 h-4.5" /></button>
                            <button onClick={() => handleDeleteWH(wh.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4.5 h-4.5" /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {activeTab === "locations" && (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Barcode / ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Gudang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Zone-Aisle-Row-Tier</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Kapasitas</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-right text-theme-xs">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow><TableCell className="px-5 py-4 text-center" colSpan={6}>Loading...</TableCell></TableRow>
                  ) : locations.length === 0 ? (
                    <TableRow><TableCell className="px-5 py-4 text-center" colSpan={6}>Belum ada data lokasi.</TableCell></TableRow>
                  ) : (
                    locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="px-5 py-4 text-theme-sm font-medium">{loc.barcode_loc}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm">
                          {loc.warehouse?.warehouse_name || warehouses.find(w => w.id === loc.warehouse_id)?.warehouse_name || `Gudang ID: ${loc.warehouse_id}`}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-brand-500 font-mono bg-brand-50 dark:bg-brand-900/20 inline-block px-2 py-1 rounded mt-3">
                          {loc.bin_location || `${loc.zone}-${loc.aisle}-${loc.rack_row}-${loc.tier}`}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm">
                          {loc.capacity ? `${loc.capacity} CBM` : '-'}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm">
                          {loc.is_empty ? (
                            <span className="text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded text-xs">Kosong</span>
                          ) : (
                            <span className="text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded text-xs">Terisi</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleOpenLocModal(loc)} className="text-gray-500 hover:text-brand-500"><Pencil className="w-4.5 h-4.5" /></button>
                            <button onClick={() => handleDeleteLoc(loc.id)} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4.5 h-4.5" /></button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* WH Modal */}
      <Modal isOpen={isWHModalOpen} onClose={() => setIsWHModalOpen(false)} className="w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {isWHEditMode ? "Edit Gudang" : "Tambah Gudang"}
        </h2>
        <form onSubmit={handleWHSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kode Gudang</label>
            <input type="text" required value={whFormData.code} onChange={e => setWhFormData({...whFormData, code: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Gudang</label>
            <input type="text" required value={whFormData.warehouse_name} onChange={e => setWhFormData({...whFormData, warehouse_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <textarea rows={3} value={whFormData.address} onChange={e => setWhFormData({...whFormData, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsWHModalOpen(false)} type="button">Batal</Button>
            <Button type="submit" className="bg-brand-500 text-white">Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Loc Modal */}
      <Modal isOpen={isLocModalOpen} onClose={() => setIsLocModalOpen(false)} className="w-full max-w-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {isLocEditMode ? "Edit Lokasi Rak" : "Tambah Lokasi Rak"}
        </h2>
        <form onSubmit={handleLocSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Gudang</label>
              <select required value={locFormData.warehouse_id} onChange={e => setLocFormData({...locFormData, warehouse_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500">
                <option value="" className="dark:bg-gray-900">-- Pilih --</option>
                {warehouses.map(w => <option key={w.id} value={w.id} className="dark:bg-gray-900">{w.code} - {w.warehouse_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barcode Lokasi</label>
              <input type="text" required value={locFormData.barcode_loc} onChange={e => setLocFormData({...locFormData, barcode_loc: e.target.value})} placeholder="Contoh: WH1-Z1-A1" className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zona</label>
              <input type="text" required value={locFormData.zone} onChange={e => setLocFormData({...locFormData, zone: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lorong (Aisle)</label>
              <input type="text" required value={locFormData.aisle} onChange={e => setLocFormData({...locFormData, aisle: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Baris (Row)</label>
              <input type="text" required value={locFormData.rack_row} onChange={e => setLocFormData({...locFormData, rack_row: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tingkat (Tier)</label>
              <input type="text" required value={locFormData.tier} onChange={e => setLocFormData({...locFormData, tier: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kapasitas Maksimal (CBM)</label>
            <input type="number" step="0.01" min="0" required value={locFormData.capacity} onChange={e => setLocFormData({...locFormData, capacity: parseFloat(e.target.value) || 0})} className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsLocModalOpen(false)} type="button">Batal</Button>
            <Button type="submit" className="bg-brand-500 text-white">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
