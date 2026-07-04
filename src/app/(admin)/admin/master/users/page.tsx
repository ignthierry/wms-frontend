"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2 } from "lucide-react";

interface Role {
  id: number;
  role_name: string;
}

interface User {
  id: number;
  role_id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  is_active: boolean | number;
  role?: Role;
}

export default function MasterUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    role_id: "",
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    is_active: 1,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // For now we might not have auth tokens set up fully, so we just attempt to fetch.
      // If it fails with 401, you may need to implement a Bearer token retrieval.
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${apiUrl}/users`, {
          headers: {
            "Accept": "application/json",
          }
        }),
        fetch(`${apiUrl}/roles`, {
          headers: {
            "Accept": "application/json",
          }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // Assuming Laravel API resource returns { data: [...] } or just [...]
        setUsers(usersData.data || usersData);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData.data || rolesData);
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

  const handleOpenModal = (user?: User) => {
    if (user) {
      setIsEditMode(true);
      setFormData({
        id: user.id,
        role_id: user.role_id.toString(),
        username: user.username,
        email: user.email,
        password: "", // Leave empty for edit
        name: user.name,
        phone: user.phone || "",
        is_active: user.is_active ? 1 : 0,
      });
    } else {
      setIsEditMode(false);
      setFormData({
        id: 0,
        role_id: "",
        username: "",
        email: "",
        password: "",
        name: "",
        phone: "",
        is_active: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `${apiUrl}/users/${formData.id}` : `${apiUrl}/users`;
      const method = isEditMode ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (isEditMode && !payload.password) {
        delete (payload as any).password;
      }

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
        alert("Failed to save user: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json"
        },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Master Users</h1>
        <Button onClick={() => handleOpenModal()} className="bg-brand-500 hover:bg-brand-600 text-white">
          + Add User
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User Details</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={6}>Loading...</TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={6}>No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{user.id}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{user.email} | @{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {user.role?.role_name || roles.find(r => r.id === user.role_id)?.role_name || user.role_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{user.phone || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={user.is_active ? "success" : "error"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleOpenModal(user)} className="text-gray-500 hover:text-brand-500 transition-colors" title="Edit">
                            <Pencil className="w-4.5 h-4.5" />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
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
          {isEditMode ? "Edit User" : "Add User"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
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
                required
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="" className="dark:bg-gray-900">Select a role</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="dark:bg-gray-900">{r.role_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="is_active"
                value={formData.is_active}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={1} className="dark:bg-gray-900">Active</option>
                <option value={0} className="dark:bg-gray-900">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {isEditMode && <span className="text-gray-400 text-xs">(Leave empty to keep unchanged)</span>}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!isEditMode}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
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
