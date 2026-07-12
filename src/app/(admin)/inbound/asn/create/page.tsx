"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Plus, X } from "lucide-react";
import ReactSelect from "react-select";

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

export default function CreateAsnPage() {
  const router = useRouter();
  const [forwardings, setForwardings] = useState<Forwarding[]>([]);
  const [masterConsignees, setMasterConsignees] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    forwarding_id: "", // Forwarding ID
    warehouse_id: "",
    asn_number: `ASN-${Date.now()}`,
    eta: "",

    vehicle_plate: "",
    trucking_company: "",
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
    const fetchSelectData = async () => {
      try {
        const [forwardingsRes, warehousesRes, masterConsigneesRes] = await Promise.all([
          fetch(`${apiUrl}/forwardings`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/consignees`, { headers: { "Accept": "application/json" } }),
        ]);

        if (forwardingsRes.ok) {
          const fwdData = await forwardingsRes.json();
          setForwardings(fwdData.data || fwdData);
        }

        if (masterConsigneesRes.ok) {
            const mcData = await masterConsigneesRes.json();
            setMasterConsignees(mcData.data || mcData);
        }

        if (warehousesRes.ok) {
          const warehousesData = await warehousesRes.json();
          const whs = warehousesData.data || warehousesData;
          setWarehouses(whs);
          if (whs.length > 0) {
             setFormData(prev => ({ ...prev, warehouse_id: whs[0].id.toString() }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchSelectData();
  }, [apiUrl]);

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
    if (!formData.forwarding_id) {
        alert("Please select a Forwarding.");
        return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
          ...formData,
          items: formData.asn_items 
      };

      const res = await fetch(`${apiUrl}/asns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/inbound/asn");
      } else {
        const errorData = await res.json();
        alert("Failed to save ASN: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error saving ASN:", error);
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

  return (
    <div>
      <PageBreadcrumb pageTitle="Create ASN" />
      <div className="grid grid-cols-1 gap-6">
        <form onSubmit={handleSubmit}>
          <ComponentCard title="ASN Details">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Forwarding</Label>
                  <div className="relative z-20">
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
                  <Label>Trucking Company</Label>
                  <Input 
                    type="text" 
                    name="trucking_company"
                    value={formData.trucking_company || ""}
                    onChange={handleInputChange}
                    placeholder="Nama Perusahaan Ekspedisi"
                  />
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
                  <Label>Estimated Time of Arrival (ETA)</Label>
                  <Input 
                    type="datetime-local" 
                    name="eta"
                    value={formData.eta}
                    onChange={handleInputChange}
                    required
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
                    <Label>Tanggal Manifest</Label>
                    <Input 
                      type="datetime-local" 
                      name="tgl"
                      value={formData.tgl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Tanggal Stripping</Label>
                    <Input 
                      type="datetime-local" 
                      name="tanggal_stripping"
                      value={formData.tanggal_stripping}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Tanggal In Container</Label>
                    <Input 
                      type="datetime-local" 
                      name="tgl_in_container"
                      value={formData.tgl_in_container}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label>Tanggal Out Container</Label>
                    <Input 
                      type="datetime-local" 
                      name="out_container"
                      value={formData.out_container}
                      onChange={handleInputChange}
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
                       {formData.asn_items.map((item, index) => (
                           <div key={index} className="flex gap-4 items-start border p-4 rounded-xl border-gray-200 dark:border-gray-800">
                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1">
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
                                       <Label>Pos Number</Label>
                                       <Input type="text" readOnly className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" value={item.pos_number || ''} />
                                   </div>
                                   <div>
                                       <Label>Expiry Date</Label>
                                       <Input type="date" value={item.expiry_date || ''} onChange={(e) => handleItemChange(index, 'expiry_date', e.target.value)} />
                                   </div>
                               </div>
                               <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 mt-8 text-gray-400 hover:text-red-500 transition-colors">
                                   <X className="w-5 h-5" />
                               </button>
                           </div>
                       ))}
                   </div>
                )}
              </div>
            </ComponentCard>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => router.push('/inbound/asn')} type="button">Cancel</Button>
            <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save ASN"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
