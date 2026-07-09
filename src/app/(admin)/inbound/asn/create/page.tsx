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

interface Role {
  id: number;
  role_name: string;
}

interface User {
  id: number;
  role_id: number;
  name: string;
  email: string;
}

interface Client {
  id: number;
  user_id: number | null;
  client_name: string;
  company_name: string;
}

interface Warehouse {
  id: number;
  warehouse_name: string;
}

interface AsnItem {
  item_code: string;
  item_name: string;
  qty_expected: number;
  lot_number?: string;
  expiry_date?: string;
}

export default function CreateAsnPage() {
  const router = useRouter();
  const [emkls, setEmkls] = useState<User[]>([]);
  const [consignees, setConsignees] = useState<Client[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  
  const [selectedEmkl, setSelectedEmkl] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    client_id: "", // Consignee ID
    warehouse_id: "",
    asn_number: `ASN-${Date.now()}`,
    eta: "",
    driver_name: "",
    vehicle_plate: "",
    status: "PENDING",
    asn_items: [] as AsnItem[],
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [clientsRes, warehousesRes, usersRes, rolesRes] = await Promise.all([
          fetch(`${apiUrl}/clients`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/users`, { headers: { "Accept": "application/json" } }),
          fetch(`${apiUrl}/roles`, { headers: { "Accept": "application/json" } }),
        ]);

        let allRoles: Role[] = [];
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          allRoles = rolesData.data || rolesData;
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const allUsers: User[] = usersData.data || usersData;
          const clientRole = allRoles.find(r => r.role_name.toLowerCase() === 'client');
          if (clientRole) {
            setEmkls(allUsers.filter(u => u.role_id === clientRole.id));
          }
        }

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setConsignees(clientsData.data || clientsData);
        }

        if (warehousesRes.ok) {
          const warehousesData = await warehousesRes.json();
          const whs = warehousesData.data || warehousesData;
          setWarehouses(whs);
          if (whs.length > 0) {
             // Default to the first warehouse
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

  const handleAddItem = () => {
    setFormData(prev => ({
        ...prev,
        asn_items: [
            ...prev.asn_items,
            { item_code: "", item_name: "", qty_expected: 1, lot_number: "", expiry_date: "" }
        ]
    }));
  };

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
    if (!formData.client_id) {
        alert("Please select a Consignee.");
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

  const emklOptions = emkls.map(e => ({ value: e.id, label: `${e.name} (${e.email})` }));
  const filteredConsignees = consignees.filter(c => selectedEmkl === null || c.user_id === selectedEmkl);
  const consigneeOptions = filteredConsignees.map(c => ({ value: c.id.toString(), label: c.client_name }));
  
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
                  <Label>Master EMKL</Label>
                  <div className="relative z-20">
                    <ReactSelect
                      instanceId="emkl-select"
                      options={emklOptions}
                      placeholder="Pilih EMKL..."
                      styles={customSelectStyles}
                      isClearable
                      onChange={(option: any) => {
                        setSelectedEmkl(option ? option.value : null);
                        setFormData(prev => ({ ...prev, client_id: "" })); // Reset consignee
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Label>Consignee</Label>
                  <div className="relative z-10">
                    <ReactSelect
                      instanceId="consignee-select"
                      options={consigneeOptions}
                      placeholder="Pilih Consignee..."
                      styles={customSelectStyles}
                      isDisabled={!selectedEmkl}
                      value={consigneeOptions.find(opt => opt.value === formData.client_id) || null}
                      onChange={(option: any) => {
                        setFormData(prev => ({ ...prev, client_id: option ? option.value : "" }));
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
                  <Label>Driver Name</Label>
                  <Input 
                    type="text" 
                    name="driver_name"
                    value={formData.driver_name}
                    onChange={handleInputChange}
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
            <ComponentCard title="ASN Items">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Item
                  </Button>
                </div>

                {formData.asn_items.length === 0 ? (
                   <div className="text-center py-4 text-sm text-gray-500">No items added. Please add items.</div>
                ) : (
                   <div className="space-y-4">
                       {formData.asn_items.map((item, index) => (
                           <div key={index} className="flex gap-4 items-start border p-4 rounded-xl border-gray-200 dark:border-gray-800">
                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                                   <div>
                                       <Label>Item Code</Label>
                                       <Input type="text" required value={item.item_code} onChange={(e) => handleItemChange(index, 'item_code', e.target.value)} />
                                   </div>
                                   <div>
                                       <Label>Item Name</Label>
                                       <Input type="text" required value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} />
                                   </div>
                                   <div>
                                       <Label>Expected Qty</Label>
                                       <Input type="number" required value={item.qty_expected} onChange={(e) => handleItemChange(index, 'qty_expected', parseInt(e.target.value) || 0)} />
                                   </div>
                                   <div>
                                       <Label>Lot Number</Label>
                                       <Input type="text" value={item.lot_number || ''} onChange={(e) => handleItemChange(index, 'lot_number', e.target.value)} />
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
