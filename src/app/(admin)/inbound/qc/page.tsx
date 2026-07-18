"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, AlertCircle, Save, X, RefreshCcw, Scan, MapPin, Package } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import Swal from "sweetalert2";
import imageCompression from 'browser-image-compression';

export default function MobileScannerPage() {
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
    // Fetch locations
    fetch(`${apiUrl}/locations`, { headers: { "Accept": "application/json" } })
      .then(res => res.json())
      .then(data => {
         const locs = data.data || data;
         setLocations(locs);
      })
      .catch(err => console.error(err));

    // Initialize scanner safely
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
      // Ignored to avoid spamming the console
  };

  const handleSearchQr = async (qrText: string) => {
      if (!qrText || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setIsLoading(true);
      try {
          const res = await fetch(`${apiUrl}/asn-items/qr/${encodeURIComponent(qrText)}`, {
              headers: { "Accept": "application/json" }
          });
          if (res.ok) {
              const data = await res.json();
              const foundItem = data.data || data;
              setItem(foundItem);
              setBlockLocation(foundItem.block_location || "");
              setItemCondition(foundItem.item_condition || "NORMAL");
              setManualQr(""); // clear manual input
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
          maxSizeMB: 1, // compress to max 1MB
          maxWidthOrHeight: 1200, // max resolution
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
        
        // reset input so same file can be selected again if needed
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
      const formData = new FormData();
      formData.append('_method', 'PUT'); // for laravel spoofing
      formData.append('block_location', blockLocation);
      formData.append('item_condition', itemCondition);
      
      if (photoFiles.length > 0) {
          photoFiles.forEach(f => {
              formData.append('photo_proof_files[]', f);
          });
          formData.append('jenis_foto', 'in');
      }

      const res = await fetch(`${apiUrl}/asn-items/${item.id}`, {
        method: "POST", // POST with _method=PUT
        headers: {
          "Accept": "application/json",
        },
        body: formData
      });

      if (res.ok) {
        Swal.fire('Berhasil', 'Status dan lokasi item berhasil diperbarui!', 'success');
        setItem(null);
        setPhotoPreviews([]);
        setPhotoFiles([]);
        isProcessingRef.current = false;
        if (scannerRef.current) {
            try { scannerRef.current.resume(); } catch(e) {}
        }
      } else {
        Swal.fire('Gagal', 'Gagal memperbarui item.', 'error');
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
      {/* Mobile Banner */}
      <div className="bg-brand-600 text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
              <Scan className="w-8 h-8" />
              <h1 className="text-2xl font-bold">WMS Scanner</h1>
          </div>
          <p className="text-brand-100 text-sm">Scan QR code pada label barang untuk update status, lokasi, dan foto.</p>
      </div>

      <div className="px-4 space-y-4">
          
          {/* Scanner Card */}
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

          {/* Result Card */}
          {item && (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4">
                  <div className={`${
                      item.status === 'RECEIVED' ? 'bg-emerald-600' : 
                      item.status === 'CANCEL' ? 'bg-red-600' : 
                      'bg-gray-800'
                  } text-white p-4 flex justify-between items-start transition-colors`}>
                      <div>
                          <h3 className="font-bold flex items-center gap-2">
                              <Package className="w-5 h-5 text-white/80" /> {item.item_code}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 ${
                                  item.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 
                                  item.status === 'CANCEL' ? 'bg-red-100 text-red-800' : 
                                  'bg-white/20 text-white'
                              }`}>
                                  {item.status || 'PENDING'}
                              </span>
                          </h3>
                          <p className="text-sm text-white/90 mt-1">{item.item_name}</p>
                          <p className="text-xs text-white/70 mt-1">ASN: {item.asn?.asn_number || '-'}</p>
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
                          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs font-semibold"
                      >
                          Tutup
                      </button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-brand-500" /> Lokasi (Block / Rak)
                          </label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-brand-500"
                              value={blockLocation}
                              onChange={(e) => setBlockLocation(e.target.value)}
                          >
                              <option value="">-- Pilih Lokasi --</option>
                              {locations.map(loc => (
                                  <option key={loc.id} value={loc.barcode_loc}>
                                      {loc.barcode_loc} {loc.warehouse?.warehouse_name ? `(${loc.warehouse.warehouse_name})` : ''}
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-brand-500" /> Kondisi Barang
                          </label>
                          <select 
                              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:ring-2 focus:ring-brand-500"
                              value={itemCondition}
                              onChange={(e) => setItemCondition(e.target.value)}
                          >
                              <option value="NORMAL">Normal</option>
                              <option value="RUSAK">Rusak</option>
                              <option value="BASAH">Basah</option>
                              <option value="QUARANTINE">Karantina</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Foto (Multiple / Dropzone)</label>
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-brand-500">
                                <Camera className="w-8 h-8 mb-2" />
                                <p className="text-xs font-semibold">Ambil Foto / Pilih Multiple Files</p>
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
                              <div className="mt-4 grid grid-cols-3 gap-2">
                                  {photoPreviews.map((preview, idx) => (
                                      <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square">
                                          <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                          <button 
                                            type="button"
                                            onClick={() => removePhoto(idx)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {item.photos && item.photos.length > 0 && (
                          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Galeri Foto Sebelumnya</label>
                              <div className="grid grid-cols-3 gap-2">
                                  {item.photos.map((photo: any, idx: number) => {
                                      const url = photo.photo_proof.startsWith('http') 
                                          ? photo.photo_proof 
                                          : `${apiUrl}/photos/${photo.photo_proof.replace('photo_proofs/', '')}`;
                                      return (
                                          <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square group">
                                              <img src={url} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                                              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center">
                                                  <span className="text-[10px] text-white font-semibold uppercase">{photo.jenis_foto}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                      <button 
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-4 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                      >
                          {isSaving ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          {isSaving ? "Menyimpan..." : "Simpan Pembaruan"}
                      </button>
                  </div>
              </form>
          )}

      </div>
    </div>
  );
}
