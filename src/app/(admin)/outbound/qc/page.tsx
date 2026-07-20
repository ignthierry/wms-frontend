"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, AlertCircle, Save, X, RefreshCcw, Scan, MapPin, Package, FileText, Truck } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import Swal from "sweetalert2";
import imageCompression from 'browser-image-compression';
import Cookies from "js-cookie";

export default function OutboundMobileScannerPage() {
  const [manualQr, setManualQr] = useState("");
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [locations, setLocations] = useState<any[]>([]);
  
  // Form states
  const [blockLocation, setBlockLocation] = useState("");
  const [itemCondition, setItemCondition] = useState("NORMAL");
  
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const token = Cookies.get("auth_token");
    const headers: any = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${apiUrl}/locations`, { headers })
      .then(res => res.json())
      .then(data => {
         const locs = data.data || data;
         setLocations(locs);
      })
      .catch(err => console.error(err));

    if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10, 
                qrbox: {width: 250, height: 250}, 
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
            },
            false
        );
        
        scannerRef.current.render(onScanSuccess, onScanFailure);
    }
    
    return () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        }
    };
  }, []);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
      if (!isProcessingRef.current) {
          handleSearchQr(decodedText);
      }
  };

  const onScanFailure = (error: any) => {
  };

  const handleSearchQr = async (qrText: string) => {
      if (!qrText || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsLoading(true);
      
      const token = Cookies.get("auth_token");
      const headers: any = { "Accept": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
          const res = await fetch(`${apiUrl}/asn-items/qr/${encodeURIComponent(qrText)}`, { headers });
          if (res.ok) {
              const data = await res.json();
              const foundItem = data.data || data;
              
              if (!foundItem.invoice) {
                  Swal.fire('Belum Ada Invoice', 'Item ini belum dibuatkan Invoice. Silakan buat invoice terlebih dahulu sebelum proses Outbound QC.', 'warning');
                  setItem(null);
                  isProcessingRef.current = false;
                  setIsLoading(false);
                  return;
              }

              setItem(foundItem);
              setBlockLocation(foundItem.block_location || "");
              setItemCondition(foundItem.item_condition || "NORMAL");
              setManualQr("");
              
              if (scannerRef.current) {
                  try { scannerRef.current.pause(true); } catch(e) {}
              }
              
              Swal.fire({
                  title: 'Berhasil!',
                  text: 'Data barang ditemukan.',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false
              });
          } else {
              Swal.fire('Tidak Ditemukan', 'Item dengan QR code tersebut tidak ditemukan.', 'error');
              setItem(null);
              isProcessingRef.current = false;
          }
      } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Terjadi kesalahan saat mencari item.', 'error');
          isProcessingRef.current = false;
      } finally {
          setIsLoading(false);
      }
  };

  const handleManualSearch = (e: React.FormEvent) => {
      e.preventDefault();
      handleSearchQr(manualQr);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsLoading(true);
      try {
        const options = {
          maxSizeMB: 1, 
          maxWidthOrHeight: 1200, 
          useWebWorker: true,
        };
        
        const newCompressedFiles: File[] = [];
        const newPreviews: string[] = [];
        
        for (const file of files) {
          const compressedFile = await imageCompression(file, options);
          newCompressedFiles.push(compressedFile);
          
          const reader = new FileReader();
          const previewUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });
          newPreviews.push(previewUrl);
        }
        
        setPhotoFiles(prev => [...prev, ...newCompressedFiles]);
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
        
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Error compressing image:", error);
        Swal.fire('Error', 'Gagal memproses foto', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSaving(true);
    try {
      const token = Cookies.get("auth_token");
      const headers: any = { "Accept": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('block_location', blockLocation);
      formData.append('item_condition', itemCondition);
      
      if (photoFiles.length > 0) {
          photoFiles.forEach(f => {
              formData.append('photo_proof_files[]', f);
          });
      }

      const res = await fetch(`${apiUrl}/outbound/qc/${item.id}`, {
        method: "POST", 
        headers,
        body: formData
      });

      if (res.ok) {
        Swal.fire('Berhasil', 'Outbound QC berhasil! Barang siap untuk Dispatch.', 'success');
        setItem(null);
        setPhotoPreviews([]);
        setPhotoFiles([]);
        isProcessingRef.current = false;
        if (scannerRef.current) {
            try { scannerRef.current.resume(); } catch(e) {}
        }
      } else {
        const errData = await res.json();
        Swal.fire('Gagal', errData.message || 'Gagal menyimpan data QC Outbound.', 'error');
      }
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
      <div className="bg-brand-600 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
              <Scan className="w-8 h-8" />
              <h1 className="text-2xl font-bold">WMS Outbound QC</h1>
          </div>
          <p className="text-brand-100 text-sm">Scan QR code barang untuk persiapan keluar (Dispatch).</p>
      </div>

      <div className="px-4 space-y-4">
          
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden p-4 ${item ? 'hidden' : 'block'}`}>
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-500" /> Arahkan Kamera ke QR Code
              </h2>
              <div className="relative w-full rounded-xl overflow-hidden bg-black border border-gray-300 dark:border-gray-700">
                  <div id="qr-reader" className="w-full [&>div]:border-none [&>video]:object-cover"></div>
                  <style dangerouslySetInnerHTML={{__html: `
                            #qr-reader {
                                background: white !important;
                            }
                            #qr-reader__dashboard_section_csr span {
                                font-size: 14px;
                                color: #4b5563;
                                display: block;
                                margin-bottom: 8px;
                            }
                            #qr-reader a {
                                display: inline-block;
                                padding: 10px 20px;
                                background-color: #3b82f6;
                                color: white !important;
                                text-decoration: none;
                                border-radius: 10px;
                                font-size: 14px;
                                font-weight: 600;
                                margin: 8px 4px;
                                transition: background-color 0.2s ease;
                                cursor: pointer;
                                box-shadow: 0 2px 4px rgba(59,130,246,0.3);
                            }
                            #qr-reader a:hover {
                                background-color: #2563eb;
                            }
                            #qr-reader button {
                                display: inline-block;
                                padding: 10px 20px;
                                background-color: #3b82f6;
                                color: white !important;
                                border: none;
                                border-radius: 10px;
                                font-size: 14px;
                                font-weight: 600;
                                margin: 8px 4px;
                                cursor: pointer;
                                box-shadow: 0 2px 4px rgba(59,130,246,0.3);
                            }
                            #qr-reader select {
                                padding: 10px;
                                border: 1px solid #d1d5db;
                                border-radius: 10px;
                                font-size: 14px;
                                margin: 8px 0;
                                background-color: white;
                                width: 90%;
                                max-width: 300px;
                                outline: none;
                            }
                          `}} />
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <form onSubmit={handleManualSearch} className="flex gap-2">
                      <input 
                          type="text" 
                          value={manualQr}
                          onChange={(e) => setManualQr(e.target.value)}
                          placeholder="Atau ketik ID Manual..."
                          className="flex-1 p-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 text-sm focus:ring-2 focus:ring-brand-500"
                      />
                      <button 
                          type="submit" 
                          disabled={isLoading || !manualQr}
                          className="px-4 py-3 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                      >
                          Cari
                      </button>
                  </form>
              </div>
          </div>

          {item && (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-brand-600 text-white p-4 flex justify-between items-start transition-colors">
                      <div>
                          <h3 className="font-bold flex items-center gap-2">
                              <Package className="w-5 h-5 text-white/80" /> {item.item_code}
                          </h3>
                          <p className="text-sm text-white/90 mt-1 font-semibold">{item.item_name}</p>
                          <div className="mt-2 space-y-1">
                              <p className="text-xs text-brand-100 flex items-center gap-1"><FileText className="w-3 h-3"/> Invoice: <span className="font-bold text-white">{item.invoice?.invoice_number || '-'}</span></p>
                              <p className="text-xs text-brand-100 flex items-center gap-1"><FileText className="w-3 h-3"/> ASN: {item.asn?.asn_number || '-'}</p>
                          </div>
                      </div>
                      <button 
                          type="button" 
                          onClick={() => {
                              setItem(null);
                              isProcessingRef.current = false;
                              if (scannerRef.current) {
                                  try { scannerRef.current.resume(); } catch(e) {}
                              }
                          }} 
                          className="bg-brand-700 hover:bg-brand-800 px-3 py-1 rounded text-xs font-semibold shadow-sm"
                      >
                          Tutup
                      </button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-brand-500" /> Lokasi
                              </label>
                              <select 
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                                  value={blockLocation}
                                  onChange={(e) => setBlockLocation(e.target.value)}
                              >
                                  <option value="">-- Pilih Lokasi --</option>
                                  {locations.map(loc => (
                                      <option key={loc.id} value={loc.barcode_loc}>
                                          {loc.barcode_loc}
                                      </option>
                                  ))}
                              </select>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-brand-500" /> Kondisi
                              </label>
                              <select 
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 dark:text-white"
                                  value={itemCondition}
                                  onChange={(e) => setItemCondition(e.target.value)}
                              >
                                  <option value="NORMAL">Normal</option>
                                  <option value="RUSAK">Rusak</option>
                                  <option value="BASAH">Basah</option>
                                  <option value="QUARANTINE">Karantina</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-2">Upload Foto Bukti Out (Multiple)</label>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-2 pb-2 text-brand-500">
                                <Camera className="w-6 h-6 mb-1" />
                                <p className="text-xs font-semibold">Ambil Foto Outbound</p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                capture="environment"
                                multiple
                                ref={fileInputRef}
                                onChange={handlePhotoCapture}
                              />
                          </label>

                          {photoPreviews.length > 0 && (
                              <div className="mt-3 grid grid-cols-4 gap-2">
                                  {photoPreviews.map((preview, idx) => (
                                      <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square">
                                          <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                          <button 
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                      <button 
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                      >
                          {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          {isSaving ? "Menyimpan QC..." : "Selesai QC Outbound"}
                      </button>
                  </div>
              </form>
          )}

      </div>
    </div>
  );
}
