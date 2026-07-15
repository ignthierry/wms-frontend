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
import { Pencil, Trash2 } from "lucide-react";



interface Consignee {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
}

export default function MasterConsigneePage() {
  const [consignees, setConsignees] = useState<Consignee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "ACTIVE",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const consigneesRes = await fetch(`${apiUrl}/consignees`, {
        headers: {
          "Accept": "application/json",
        }
      });

      if (consigneesRes.ok) {
        const data = await consigneesRes.json();
        setConsignees(data.data || data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (consignee?: Consignee) => {
    if (consignee) {
      setIsEditMode(true);
      setFormData({
        id: consignee.id,
        name: consignee.name,
        email: consignee.email || "",
        phone: consignee.phone || "",
        address: consignee.address || "",
        status: consignee.status || "ACTIVE",
      });
    } else {
      setIsEditMode(false);
      setFormData({
        id: 0,
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "ACTIVE",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `${apiUrl}/consignees/${formData.id}` : `${apiUrl}/consignees`;
      const method = isEditMode ? "PUT" : "POST";
      
      const payload = { ...formData };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        handleCloseModal();
        fetchData();
      } else {
        const errorData = await res.json();
        Swal.fire("Failed to save consignee: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error saving consignee:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this consignee?")) return;
    try {
      const res = await fetch(`${apiUrl}/consignees/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json"
        },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting consignee:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Master Consignee</h1>
        <Button onClick={() => handleOpenModal()} className="bg-brand-500 hover:bg-brand-600 text-white">
          + Add Consignee
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Consignee Info</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
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
                    <TableCell className="px-5 py-4 text-center" colSpan={5}>No consignees found.</TableCell>
                  </TableRow>
                ) : (
                  consignees.map((consignee) => (
                    <TableRow key={consignee.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{consignee.id}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{consignee.name}</span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{consignee.email || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{consignee.phone || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenModal(consignee)} className="text-gray-500 hover:text-brand-500 transition-colors" title="Edit">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="w-full max-w-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {isEditMode ? "Edit Consignee" : "Add Consignee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consignee Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCloseModal} type="button">Cancel</Button>
            <Button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
