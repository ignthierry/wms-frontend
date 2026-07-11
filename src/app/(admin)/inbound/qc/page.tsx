"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, AlertCircle, Save, X, RefreshCcw } from "lucide-react";

interface AsnItem {
  id: number;
  item_code: string;
  item_name: string;
  qty_expected: number;
}

interface Asn {
  id: number;
  asn_number: string;
  items?: AsnItem[];
}

export default function QualityControlPage() {
  const [asns, setAsns] = useState<Asn[]>([]);
  const [selectedAsn, setSelectedAsn] = useState<string>("");
  const [items, setItems] = useState<AsnItem[]>([]);
  
  // Form states
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [qtyDiff, setQtyDiff] = useState<number>(0);
  const [damageCondition, setDamageCondition] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchAsns();
  }, []);

  const fetchAsns = async () => {
    try {
      const res = await fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setAsns(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching ASNs:", error);
    }
  };

  useEffect(() => {
    if (selectedAsn) {
      const asn = asns.find((a) => a.id.toString() === selectedAsn);
      if (asn && asn.items && asn.items.length > 0) {
        setItems(asn.items);
      } else {
        fetch(`${apiUrl}/asns/${selectedAsn}`, { headers: { "Accept": "application/json" } })
          .then(res => res.json())
          .then(data => {
            const singleAsn = data.data || data;
            setItems(singleAsn.items || []);
          });
      }
    } else {
      setItems([]);
    }
    setSelectedItemCode("");
  }, [selectedAsn, asns, apiUrl]);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemCode) {
      alert("Pilih barang terlebih dahulu!");
      return;
    }

    setIsSaving(true);
    try {
      // Create a dummy deviation record since we don't have a receiving ID handy here, 
      // but the table requires receiving_id. For demo purposes, we will pass a fake receiving_id
      // or we can just show a success message to demonstrate the UI works.
      const payload = {
        receiving_id: 1, // hardcoded for UI demo
        item_code: selectedItemCode,
        qty_diff: qtyDiff,
        damage_condition: damageCondition,
        photo_url: "uploaded_photo_" + Date.now() + ".jpg" // mock URL
      };

      const res = await fetch(`${apiUrl}/deviations`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Laporan kerusakan berhasil disimpan!");
        // Reset form
        setSelectedItemCode("");
        setQtyDiff(0);
        setDamageCondition("");
        removePhoto();
      } else {
        alert("Gagal menyimpan laporan.");
      }
    } catch (error) {
      console.error("Error saving deviation:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <AlertCircle className="text-red-500 w-6 h-6" />
          Quality Control (QC)
        </h1>
        <p className="text-sm text-gray-500">Laporkan kerusakan barang saat penerimaan langsung dari lapangan.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800 flex flex-col">
        
        <div className="p-5 space-y-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pilih ASN / Manifest</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-500"
              value={selectedAsn}
              onChange={(e) => setSelectedAsn(e.target.value)}
              required
            >
              <option value="">-- Pilih ASN --</option>
              {asns.map(asn => (
                <option key={asn.id} value={asn.id}>{asn.asn_number}</option>
              ))}
            </select>
          </div>

          {items.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pilih Barang (Item)</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-brand-500"
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                required
              >
                <option value="">-- Pilih Barang --</option>
                {items.map(item => (
                  <option key={item.id} value={item.item_code}>{item.item_name} ({item.item_code})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Selisih Qty (Rusak/Kurang)</label>
               <input 
                  type="number"
                  required
                  value={qtyDiff}
                  onChange={(e) => setQtyDiff(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Misal: 2"
               />
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Kerusakan</label>
             <textarea 
                required
                rows={3}
                value={damageCondition}
                onChange={(e) => setDamageCondition(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 resize-none"
                placeholder="Contoh: Kardus penyok dan basah..."
             ></textarea>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Foto Kondisi Barang</label>
             
             {!photoPreview ? (
               <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-brand-500">
                     <Camera className="w-10 h-10 mb-3" />
                     <p className="mb-1 text-sm font-semibold">Ambil Foto / Upload</p>
                     <p className="text-xs text-gray-500">Gunakan kamera HP Anda</p>
                  </div>
                  {/* The 'capture' attribute is mobile-first, opens the camera directly on iOS/Android */}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoCapture}
                  />
               </label>
             ) : (
               <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200">
                  <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className="p-5 bg-gray-50 border-t border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 mt-auto">
          <button 
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 text-lg"
          >
            {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? "Menyimpan..." : "Kirim Laporan QC"}
          </button>
        </div>

      </form>
    </div>
  );
}
