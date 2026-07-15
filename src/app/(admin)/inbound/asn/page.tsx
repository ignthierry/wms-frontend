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
import { Pencil, Trash2, Printer, ChevronDown, ChevronRight, Package, User, Search } from "lucide-react";

interface Forwarding {
  id: number;
  forwarding_name: string;
}

interface Warehouse {
  id: number;
  warehouse_code: string;
  warehouse_name: string;
}

interface AsnItem {
  id: number;
  pos_number: string;
  item_code: string;
  item_name: string;
  qty_expected: number;
  consignee?: { consignee_name: string };
}

interface Asn {
  id: number;
  forwarding_id: number;
  warehouse_id: number;
  asn_number: string;
  eta: string;
  vehicle_plate: string;
  status: string;
  no_master_bl?: string;
  no_container?: string;
  voyage?: string;
  jumlah_pos?: number;
  forwarding?: Forwarding;
  warehouse?: Warehouse;
  items?: AsnItem[];
}

export default function AsnPage() {
  const [asns, setAsns] = useState<Asn[]>([]);
  const [forwardings, setForwardings] = useState<Forwarding[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleRow = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [asnsRes, clientsRes, warehousesRes] = await Promise.all([
        fetch(`${apiUrl}/asns`, { headers: { "Accept": "application/json" } }),
        fetch(`${apiUrl}/forwardings`, { headers: { "Accept": "application/json" } }),
        fetch(`${apiUrl}/warehouses`, { headers: { "Accept": "application/json" } }),
      ]);

      if (asnsRes.ok) {
        const asnsData = await asnsRes.json();
        setAsns(asnsData.data || asnsData);
      }

      if (clientsRes.ok) {
        const forwardingsData = await clientsRes.json();
        setForwardings(forwardingsData.data || forwardingsData);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Inbound ASN (Advance Shipping Notice)</h1>
        <Link href="/inbound/asn/create">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white">
            + Create ASN
            </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-5 border-b border-gray-200 dark:border-white/[0.05]">
            <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                </div>
                <input 
                    type="text" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-brand-500 dark:focus:border-brand-500 transition-colors" 
                    placeholder="Search ASN, BL, Container, Forwarding..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-10"></TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Manifest Details</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Container Details</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ETA</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Jumlah Pos</TableCell>
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
                  (() => {
                    const filteredAsns = asns.filter(asn => {
                        const query = searchQuery.toLowerCase();
                        return (
                            asn.asn_number?.toLowerCase().includes(query) ||
                            asn.no_master_bl?.toLowerCase().includes(query) ||
                            asn.no_container?.toLowerCase().includes(query) ||
                            asn.voyage?.toLowerCase().includes(query) ||
                            (asn.forwarding?.forwarding_name || forwardings.find(c => c.id === asn.forwarding_id)?.forwarding_name || "").toLowerCase().includes(query)
                        );
                    });

                    if (filteredAsns.length === 0) {
                        return (
                          <TableRow>
                            <TableCell className="px-5 py-4 text-center" colSpan={7}>No matching ASNs found.</TableCell>
                          </TableRow>
                        );
                    }

                    return filteredAsns.map((asn) => (
                      <React.Fragment key={asn.id}>
                      <TableRow className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02] ${expandedRows.includes(asn.id) ? 'bg-gray-50 dark:bg-white/[0.02]' : ''}`} onClick={() => toggleRow(asn.id)}>
                        <TableCell className="px-5 py-4 text-gray-500">
                          {expandedRows.includes(asn.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{asn.asn_number}</span>
                            {asn.no_master_bl && <span className="text-xs text-gray-500">MBL: <span className="font-medium text-gray-700 dark:text-gray-300">{asn.no_master_bl}</span></span>}
                            {asn.voyage && <span className="text-xs text-gray-500">Voyage: <span className="font-medium text-gray-700 dark:text-gray-300">{asn.voyage}</span></span>}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {asn.no_container ? <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{asn.no_container}</span> : <span className="text-xs italic text-gray-400">No Container</span>}
                            <span className="text-xs text-gray-500">{asn.forwarding?.forwarding_name || forwardings.find(c => c.id === asn.forwarding_id)?.forwarding_name || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                          {new Date(asn.eta).toLocaleString()}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge size="sm" color="info">
                            {asn.items?.length || asn.jumlah_pos || 0} Pos
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge size="sm" color={getStatusColor(asn.status) as any}>
                            {asn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Link href={`/inbound/asn/${asn.id}/edit`} className="text-gray-500 hover:text-brand-500 transition-colors" title="Edit" onClick={(e) => e.stopPropagation()}>
                            <Pencil className="w-4.5 h-4.5" />
                          </Link>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(asn.id); }} className="text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.includes(asn.id) && (
                      <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                        <TableCell colSpan={7} className="p-0">
                          <div className="px-10 py-5">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <Package className="w-4 h-4 text-brand-500" />
                              Daftar Pos / Item Manifest
                            </h4>
                            {asn.items && asn.items.length > 0 ? (
                              <div className="border border-gray-200 dark:border-white/[0.05] rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader className="bg-gray-100 dark:bg-white/[0.02]">
                                    <TableRow>
                                      <TableCell isHeader className="px-4 py-2 font-medium text-gray-500 text-start text-xs">Pos</TableCell>
                                      <TableCell isHeader className="px-4 py-2 font-medium text-gray-500 text-start text-xs">Item Code</TableCell>
                                      <TableCell isHeader className="px-4 py-2 font-medium text-gray-500 text-start text-xs">Item Name</TableCell>
                                      <TableCell isHeader className="px-4 py-2 font-medium text-gray-500 text-center text-xs">Expected Qty</TableCell>
                                      <TableCell isHeader className="px-4 py-2 font-medium text-gray-500 text-right text-xs">Print QR</TableCell>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {asn.items.map((item, idx) => (
                                      <TableRow key={item.id} className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                        <TableCell className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                          Pos {item.pos_number || (idx + 1)}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                          {item.item_code}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                                          {item.item_name}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                                          {item.qty_expected}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-right">
                                          <Link href={`/inbound/asn/pos/${item.id}/print`} target="_blank" className="inline-flex items-center justify-center text-gray-500 hover:text-brand-500 bg-gray-100 hover:bg-brand-50 dark:bg-white/[0.05] dark:hover:bg-brand-500/20 p-2 rounded-md transition-colors" title="Print QR Item" onClick={(e) => e.stopPropagation()}>
                                            <Printer className="w-4 h-4" />
                                          </Link>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic px-4">Tidak ada data item untuk ASN ini.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    ));
                  })()
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
