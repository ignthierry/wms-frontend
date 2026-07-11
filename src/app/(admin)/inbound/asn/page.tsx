"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Pencil, Trash2, Printer } from "lucide-react";

interface Client {
  id: number;
  client_code: string;
  client_name: string;
}

interface Warehouse {
  id: number;
  warehouse_code: string;
  warehouse_name: string;
}

interface Asn {
  id: number;
  client_id: number;
  warehouse_id: number;
  asn_number: string;
  eta: string;
  driver_name: string;
  vehicle_plate: string;
  status: string;
  client?: Client;
  warehouse?: Warehouse;
}

export default function AsnPage() {
  const [asns, setAsns] = useState<Asn[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [asnsRes, clientsRes, warehousesRes] = await Promise.all([
        fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } }),
        fetch(`${apiUrl}/clients`, { headers: { "Accept": "application/json" } }),
        fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } }),
      ]);

      if (asnsRes.ok) {
        const asnsData = await asnsRes.json();
        setAsns(asnsData.data || asnsData);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.data || clientsData);
      }

      if (warehousesRes.ok) {
        const warehousesData = await warehousesRes.json();
        setWarehouses(warehousesData.data || warehousesData);
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ASN?")) return;
    try {
      const res = await fetch(`${apiUrl}/asns/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json"
        },
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting ASN:", error);
    }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'PENDING': return 'warning';
          case 'RECEIVED': return 'success';
          case 'CANCELLED': return 'error';
          default: return 'info';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inbound ASN (Advance Shipping Notice)</h1>
        <Link href="/inbound/asn/create">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
            + Create ASN
            </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ASN Number</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Client</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Warehouse</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ETA</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Vehicle</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {isLoading ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={7}>Loading...</TableCell>
                  </TableRow>
                ) : asns.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center" colSpan={7}>No ASNs found.</TableCell>
                  </TableRow>
                ) : (
                  asns.map((asn) => (
                    <TableRow key={asn.id}>
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">{asn.asn_number}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {asn.client?.client_name || clients.find(c => c.id === asn.client_id)?.client_name || asn.client_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {asn.warehouse?.warehouse_name || warehouses.find(w => w.id === asn.warehouse_id)?.warehouse_name || asn.warehouse_id}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {new Date(asn.eta).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {asn.vehicle_plate || '-'} <br/>
                        <span className="text-xs">{asn.driver_name || ''}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <Badge size="sm" color={getStatusColor(asn.status) as any}>
                          {asn.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/inbound/asn/${asn.id}/print`} target="_blank" className="text-gray-500 hover:text-blue-500 transition-colors" title="Print QR">
                            <Printer className="w-4.5 h-4.5" />
                          </Link>
                          <Link href={`/inbound/asn/${asn.id}/edit`} className="text-gray-500 hover:text-brand-500 transition-colors" title="Edit">
                            <Pencil className="w-4.5 h-4.5" />
                          </Link>
                          <button onClick={() => handleDelete(asn.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
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
