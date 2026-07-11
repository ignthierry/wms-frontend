"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2 } from "lucide-react";
import Input from "@/components/form/input/InputField";

interface Consignee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
}

export default function ConsigneePage() {
  const [consignees, setConsignees] = useState<Consignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchConsignees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/consignees`, { headers: { "Accept": "application/json" } });
      if (res.ok) {
        const data = await res.json();
        setConsignees(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching consignees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsignees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${apiUrl}/consignees/${editingId}` : `${apiUrl}/consignees`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ name: "", email: "", phone: "", address: "", status: "ACTIVE" });
        fetchConsignees();
      }
    } catch (error) {
      console.error("Error saving consignee:", error);
    }
  };

  const handleEdit = (consignee: Consignee) => {
    setFormData({
      name: consignee.name,
      email: consignee.email || "",
      phone: consignee.phone || "",
      address: consignee.address || "",
      status: consignee.status,
    });
    setEditingId(consignee.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Consignee?")) return;
    try {
      const res = await fetch(`${apiUrl}/consignees/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
        },
      });
      if (res.ok) {
        fetchConsignees();
      }
    } catch (error) {
      console.error("Error deleting consignee:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Master Consignee</h1>
        <Button onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (!isFormOpen) {
                setEditingId(null);
                setFormData({ name: "", email: "", phone: "", address: "", status: "ACTIVE" });
            }
        }} className="bg-brand-500 hover:bg-brand-600 text-white">
          {isFormOpen ? "Close Form" : "+ Create Consignee"}
        </Button>
      </div>

      {isFormOpen && (
        <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Consignee" : "Create Consignee"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Consignee Name" required />
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email Address" />
              <Input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone Number" />
              <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" />
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-11 rounded-lg border border-gray-200 px-4 py-2.5 text-theme-sm text-gray-800 bg-transparent dark:border-gray-800 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="flex justify-end">
                <Button type="submit" className="bg-brand-500 text-white">Save Consignee</Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : consignees.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={5}>No Consignees found.</TableCell>
                  </TableRow>
                ) : (
                  consignees.map((consignee) => (
                    <TableRow key={consignee.id}>
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">{consignee.name}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{consignee.email || '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{consignee.phone || '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={consignee.status === 'ACTIVE' ? 'success' : 'error'}>
                          {consignee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(consignee)} className="text-gray-500 hover:text-brand-500 transition-colors" title="Edit">
                            <Pencil className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(consignee.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
