"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Plus, X } from "lucide-react";
import ReactSelect from "react-select";
import DatePicker from "@/components/form/date-picker";
import Swal from "sweetalert2";

interface Forwarding {
  id: number;
  forwarding_name: string;
}

interface Warehouse {
  id: number;
  warehouse_name: string;
}

interface AsnItem {
  item_code: string;
  item_name: string;
  qty_expected: number;
  pos_number?: string;
  expiry_date?: string;
  host_bl?: string;
  consignee_id?: string;
  packaging?: string;
  item_condition?: string;
  remarks?: string;
}

const getCardStyle = (index: number) => {
  const styles = [
    {
      bg: "bg-blue-50/40 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/50",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
    },
    {
      bg: "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
    },
    {
      bg: "bg-purple-50/40 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/50",
      badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"
    },
    {
      bg: "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
    },
    {
      bg: "bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/50",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200"
    }
  ];
  return styles[index % styles.length];
};

export default function EditAsnPage() {
  const router = useRouter();
  const params = useParams();
  const asnId = params?.id;
  
  const [forwardings, setForwardings] = useState<Forwarding[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [masterConsignees, setMasterConsignees] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  
  const [formData, setFormData] = useState({
    forwarding_id: "", // Forwarding ID
    warehouse_id: "",
    asn_number: "",
    eta: "",
    driver_name: "",
    vehicle_plate: "",
    status: "PENDING",
    no_master_bl: "",
    tgl: "",
    tanggal_tiba: "",
    tanggal_stripping: "",
    tgl_in_container: "",
    out_container: "",
    no_segel: "",
    voyage: "",
    jumlah_pos: "",
    no_container: "",
    size: "",
    asn_items: [] as AsnItem[],
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchData = async () => {
      if (!asnId) return;
      setIsFetchingData(true);
      try {
        const [asnRes, forwardingsRes, warehousesRes, masterConsigneesRes] = await Promise.all([
          fetch(`${apiUrl}/asns/${asnId}`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/forwardings`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/consignees`, { headers: { "Accept": "application/json" } }),
        ]);

        let forwardingsList: Forwarding[] = [];
        if (forwardingsRes.ok) {
          const fwdData = await forwardingsRes.json();
          forwardingsList = fwdData.data || fwdData;
          setForwardings(forwardingsList);
        }
        
        if (masterConsigneesRes.ok) {
            const mcData = await masterConsigneesRes.json();
            setMasterConsignees(mcData.data || mcData);
        }

        if (warehousesRes.ok) {
          const warehousesData = await warehousesRes.json();
          setWarehouses(warehousesData.data || warehousesData);
        }

        if (asnRes.ok) {
          const asnDetail = await asnRes.json();
          const asn = asnDetail.data || asnDetail;
          
          let formattedEta = "";
          if (asn.eta) {
              const date = new Date(asn.eta);
              const tzOffset = date.getTimezoneOffset() * 60000;
              formattedEta = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
          }

          setFormData({
            forwarding_id: asn.forwarding_id?.toString() || "",
            warehouse_id: asn.warehouse_id?.toString() || "",
            asn_number: asn.asn_number || "",
            eta: formattedEta,
            driver_name: asn.driver_name || "",
            vehicle_plate: asn.vehicle_plate || "",
            status: asn.status || "PENDING",
            no_master_bl: asn.no_master_bl || "",
            tgl: asn.tgl || "",
            tanggal_tiba: asn.tanggal_tiba || "",
            tanggal_stripping: asn.tanggal_stripping || "",
            tgl_in_container: asn.tgl_in_container || "",
            out_container: asn.out_container || "",
            no_segel: asn.no_segel || "",
            voyage: asn.voyage || "",
            jumlah_pos: asn.jumlah_pos || "",
            no_container: asn.no_container || "",
            size: asn.size || "",
            asn_items: asn.items || asn.asn_items || [],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsFetchingData(false);
      }
    };

    fetchData();
  }, [apiUrl, asnId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Only run if not fetching initial data, otherwise it might override fetched items before they settle?
    // Actually, setting formData is atomic in fetchData. So this is fine.
    const numPos = parseInt(formData.jumlah_pos) || 0;
    setFormData(prev => {
        const newItems = [...prev.asn_items];
        
        if (numPos > newItems.length) {
            for (let i = newItems.length; i < numPos; i++) {
                newItems.push({
                    item_code: "", item_name: "", qty_expected: 1, pos_number: (i + 1).toString(), expiry_date: "", host_bl: "", consignee_id: "", packaging: "", item_condition: "", remarks: ""
                });
            }
        } else if (numPos < newItems.length) {
            newItems.splice(numPos);
        }
        
        const updatedItems = newItems.map((item, idx) => ({ ...item, pos_number: (idx + 1).toString() }));
        
        const isSame = prev.asn_items.length === updatedItems.length && prev.asn_items.every((it, idx) => it.pos_number === updatedItems[idx].pos_number);
        
        if (!isSame) {
            return { ...prev, asn_items: updatedItems };
        }
        return prev;
    });
  }, [formData.jumlah_pos]);

  useEffect(() => {
    if (isFetchingData) return;

    setFormData(prev => {
      const updatedItems = prev.asn_items.map((item, idx) => {
        const posNum = (idx + 1).toString();
        const expectedPattern = `ITM-${prev.asn_number}-P${posNum}`;
        const isAutogenerated = !item.item_code || /^ITM-.*-P\d+$/.test(item.item_code);
        
        if (isAutogenerated && item.item_code !== expectedPattern) {
          return { ...item, item_code: expectedPattern };
        }
        return item;
      });

      const isSame = prev.asn_items.every((it, idx) => it.item_code === updatedItems[idx]?.item_code);
      if (!isSame) {
        return { ...prev, asn_items: updatedItems };
      }
      return prev;
    });
  }, [formData.asn_number, formData.asn_items.length, isFetchingData]);



  const handleRemoveItem = (index: number) => {
    setFormData(prev => {
        const newItems = [...prev.asn_items];
        newItems.splice(index, 1);
        return { ...prev, asn_items: newItems };
    });
  };

  const handleItemChange = (index: number, field: keyof AsnItem, value: any) => {
    setFormData(prev => {
        const newItems = [...prev.asn_items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, asn_items: newItems };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
    if (!formData.forwarding_id) {
        Swal.fire({
            icon: 'error',
            title: 'Validasi Gagal',
            text: 'Harap pilih Forwarding.',
            confirmButtonColor: '#1E3A8A'
        });
        return;
    }
    if (!formData.asn_number) {
        Swal.fire({
            icon: 'error',
            title: 'Validasi Gagal',
            text: 'Harap isi ASN Number.',
            confirmButtonColor: '#1E3A8A'
        });
        return;
    }
    if (!formData.eta) {
        Swal.fire({
            icon: 'error',
            title: 'Validasi Gagal',
            text: 'Harap tentukan Estimated Time of Arrival (ETA).',
            confirmButtonColor: '#1E3A8A'
        });
        return;
    }
    if (formData.asn_items.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Validasi Gagal',
            text: 'Harap tambahkan minimal 1 item/pos ASN.',
            confirmButtonColor: '#1E3A8A'
        });
        return;
    }
    
    for (let i = 0; i < formData.asn_items.length; i++) {
        const item = formData.asn_items[i];
        if (!item.item_code) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: `Item pada Pos ${item.pos_number || (i+1)}: Item Code tidak boleh kosong.`,
                confirmButtonColor: '#1E3A8A'
            });
            return;
        }
        if (!item.item_name) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: `Item pada Pos ${item.pos_number || (i+1)}: Item Name (Jenis Barang) tidak boleh kosong.`,
                confirmButtonColor: '#1E3A8A'
            });
            return;
        }
        if (!item.qty_expected || item.qty_expected <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validasi Gagal',
                text: `Item pada Pos ${item.pos_number || (i+1)}: Expected Qty harus lebih besar dari 0.`,
                confirmButtonColor: '#1E3A8A'
            });
            return;
        }
    }

    setIsLoading(true);
    try {
      const payload = {
          ...formData,
          items: formData.asn_items 
      };

      const res = await fetch(`${apiUrl}/asns/${asnId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: 'ASN berhasil diperbarui.',
            confirmButtonColor: '#1E3A8A',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            router.push("/inbound/asn");
        });
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.message || JSON.stringify(errorData);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memperbarui ASN',
            text: errorMessage,
            confirmButtonColor: '#1E3A8A'
        });
      }
    } catch (error) {
      console.error("Error updating ASN:", error);
      Swal.fire({
          icon: 'error',
          title: 'Kesalahan Sistem',
          text: 'Terjadi kesalahan saat menghubungi server.',
          confirmButtonColor: '#1E3A8A'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const forwardingOptions = forwardings.map(f => ({ value: f.id.toString(), label: f.forwarding_name }));

  const statusOptions = [
      { value: 'PENDING', label: 'PENDING' },
      { value: 'RECEIVED', label: 'RECEIVED' },
      { value: 'CANCELLED', label: 'CANCELLED' }
  ];

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '44px',
      borderRadius: '0.5rem',
      borderColor: '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af'
      }
    })
  };

  if (isFetchingData) {
      return <div className="p-6 text-center text-gray-500">Loading ASN Data...</div>;
  }
  
  return (
    <div>
      <PageBreadcrumb pageTitle="Edit ASN" />
      <div className="grid grid-cols-1 gap-6">
        <form onSubmit={handleSubmit}>
          <ComponentCard title="ASN Details">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Forwarding</Label>
                  <div className="relative z-10">
                    <ReactSelect
                      instanceId="forwarding-select"
                      options={forwardingOptions}
                      placeholder="Pilih Forwarding..."
                      styles={customSelectStyles}
                      isClearable
                      value={forwardingOptions.find(opt => opt.value === formData.forwarding_id) || null}
                      onChange={(option: any) => {
                        setFormData(prev => ({ ...prev, forwarding_id: option ? option.value : "" }));
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>ASN Number</Label>
                  <Input 
                    type="text" 
                    name="asn_number"
                    value={formData.asn_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <DatePicker
                    id="eta"
                    label="Estimated Time of Arrival (ETA)"
                    placeholder="Pilih Tanggal & Waktu..."
                    enableTime={true}
                    defaultDate={formData.eta}
                    onChange={(selectedDates, dateStr) => setFormData(prev => ({ ...prev, eta: dateStr }))}
                  />
                </div>



                <div>
                  <Label>Vehicle Plate</Label>
                  <Input 
                    type="text" 
                    name="vehicle_plate"
                    value={formData.vehicle_plate}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="relative">
                    <Select
                      options={statusOptions}
                      placeholder="Select Status"
                      onChange={(value) => handleSelectChange('status', value)}
                      className="dark:bg-dark-900"
                    />
                    <div className="mt-1 text-xs text-gray-400">Current Status: {formData.status} (Select again if needed)</div>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>

          <div className="mt-6">
            <ComponentCard title="LCL Manifest Details">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>No Master BL</Label>
                    <Input 
                      type="text" 
                      name="no_master_bl"
                      value={formData.no_master_bl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="tgl"
                      label="Tanggal Manifest"
                      placeholder="Pilih Tanggal & Waktu..."
                      enableTime={true}
                      defaultDate={formData.tgl}
                      onChange={(dates, dateStr) => setFormData(prev => ({ ...prev, tgl: dateStr }))}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="tanggal_stripping"
                      label="Tanggal Stripping"
                      placeholder="Pilih Tanggal & Waktu..."
                      enableTime={true}
                      defaultDate={formData.tanggal_stripping}
                      onChange={(dates, dateStr) => setFormData(prev => ({ ...prev, tanggal_stripping: dateStr }))}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="tgl_in_container"
                      label="Tanggal In Container"
                      placeholder="Pilih Tanggal & Waktu..."
                      enableTime={true}
                      defaultDate={formData.tgl_in_container}
                      onChange={(dates, dateStr) => setFormData(prev => ({ ...prev, tgl_in_container: dateStr }))}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="out_container"
                      label="Tanggal Out Container"
                      placeholder="Pilih Tanggal & Waktu..."
                      enableTime={true}
                      defaultDate={formData.out_container}
                      onChange={(dates, dateStr) => setFormData(prev => ({ ...prev, out_container: dateStr }))}
                    />
                  </div>
                  <div>
                    <Label>No Segel</Label>
                    <Input 
                      type="text" 
                      name="no_segel"
                      value={formData.no_segel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Voyage</Label>
                    <Input 
                      type="text" 
                      name="voyage"
                      value={formData.voyage}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Jumlah Pos</Label>
                    <Input 
                      type="number" 
                      name="jumlah_pos"
                      value={formData.jumlah_pos}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>No Container</Label>
                    <Input 
                      type="text" 
                      name="no_container"
                      value={formData.no_container}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Size Container</Label>
                    <select 
                      name="size"
                      className="w-full h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-theme-sm text-gray-800 bg-transparent dark:border-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      value={formData.size}
                      onChange={handleInputChange}
                    >
                      <option value="">Pilih Size</option>
                      <option value="20ft">20ft</option>
                      <option value="40ft">40ft</option>
                    </select>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="mt-6">
            <ComponentCard title="ASN Items">
              <div className="space-y-4">

                {formData.asn_items.length === 0 ? (
                   <div className="text-center py-4 text-sm text-gray-500">No items added. Please add items.</div>
                ) : (
                    <div className="space-y-4">
                       {formData.asn_items.map((item, index) => {
                           const cardStyle = getCardStyle(index);
                           return (
                               <div key={index} className={`flex flex-col border p-5 rounded-xl transition-all shadow-theme-xs ${cardStyle.bg}`}>
                                   <div className="flex justify-between items-center border-b border-gray-200/60 dark:border-gray-700/60 pb-3 mb-4">
                                       <span className={`inline-flex items-center justify-center px-3 py-1 text-sm font-semibold rounded-lg ${cardStyle.badge}`}>
                                           Pos {item.pos_number || (index + 1)}
                                       </span>
                                       <button 
                                           type="button" 
                                           onClick={() => handleRemoveItem(index)} 
                                           className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                           title="Hapus Pos"
                                       >
                                           <X className="w-5 h-5" />
                                       </button>
                                   </div>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                       <div>
                                           <Label>Item Code</Label>
                                           <Input type="text" required value={item.item_code} onChange={(e) => handleItemChange(index, 'item_code', e.target.value)} />
                                       </div>
                                       <div>
                                           <Label>Item Name (Jenis Barang)</Label>
                                           <Input type="text" required value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} />
                                       </div>
                                       <div>
                                           <Label>Host BL</Label>
                                           <Input type="text" value={item.host_bl || ''} onChange={(e) => handleItemChange(index, 'host_bl', e.target.value)} />
                                       </div>
                                       <div>
                                           <Label>Master Consignee</Label>
                                           <select 
                                              className="w-full h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-theme-sm text-gray-800 bg-transparent dark:border-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                              value={item.consignee_id || ''}
                                              onChange={(e) => handleItemChange(index, 'consignee_id', e.target.value)}
                                           >
                                              <option value="">Pilih Consignee...</option>
                                              {masterConsignees.map(mc => (
                                                  <option key={mc.id} value={mc.id}>{mc.name}</option>
                                              ))}
                                           </select>
                                       </div>
                                       <div>
                                           <Label>Expected Qty (Koli/Pcs)</Label>
                                           <Input type="number" required value={item.qty_expected} onChange={(e) => handleItemChange(index, 'qty_expected', parseInt(e.target.value) || 0)} />
                                       </div>
                                       <div>
                                           <Label>Packaging (Kemasan)</Label>
                                           <select 
                                              className="w-full h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-theme-sm text-gray-800 bg-transparent dark:border-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                              value={item.packaging || ''}
                                              onChange={(e) => handleItemChange(index, 'packaging', e.target.value)}
                                           >
                                              <option value="">Pilih Kemasan...</option>
                                              <option value="BAG">Bag (BAG)</option>
                                              <option value="BALE">Bale (BAL)</option>
                                              <option value="BOX">Box (BOX)</option>
                                              <option value="BUNDLE">Bundle (BDL)</option>
                                              <option value="CARTON">Carton (CTN)</option>
                                              <option value="CRATE">Crate (CRT)</option>
                                              <option value="CYLINDER">Cylinder (CYL)</option>
                                              <option value="DRUM">Drum (DRM)</option>
                                              <option value="PACK">Pack (PCK)</option>
                                              <option value="PALLET">Pallet (PLT)</option>
                                              <option value="PIECES">Pieces (PCS)</option>
                                              <option value="ROLL">Roll (ROL)</option>
                                           </select>
                                       </div>
                                       <div>
                                           <Label>Condition</Label>
                                           <select 
                                              className="w-full h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-theme-sm text-gray-800 bg-transparent dark:border-gray-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                              value={item.item_condition || ''}
                                              onChange={(e) => handleItemChange(index, 'item_condition', e.target.value)}
                                           >
                                              <option value="">Select Condition</option>
                                              <option value="NORMAL">Normal</option>
                                              <option value="RUSAK">Rusak</option>
                                              <option value="BASAH">Basah</option>
                                           </select>
                                       </div>
                                       <div>
                                           <Label>Remarks</Label>
                                           <Input type="text" value={item.remarks || ''} onChange={(e) => handleItemChange(index, 'remarks', e.target.value)} />
                                       </div>
                                        <div>
                                            <DatePicker
                                                id={`expiry_date_${index}`}
                                                label="Expiry Date"
                                                placeholder="Pilih Tanggal..."
                                                defaultDate={item.expiry_date || ""}
                                                onChange={(dates, dateStr) => handleItemChange(index, 'expiry_date', dateStr)}
                                            />
                                        </div>
                                   </div>
                               </div>
                           );
                       })}
                    </div>
                )}
              </div>
            </ComponentCard>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => router.push('/inbound/asn')} type="button">Cancel</Button>
            <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white" disabled={isLoading}>
                {isLoading ? "Saving..." : "Update ASN"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
