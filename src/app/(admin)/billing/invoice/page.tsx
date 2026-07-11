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
import Input from "@/components/form/input/InputField";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [asnNumber, setAsnNumber] = useState("");
  const [calculation, setCalculation] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const fetchInvoices = async () => {
    // For now we don't have an index endpoint for invoices, but this would fetch them.
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCalculate = async () => {
    if (!asnNumber) return;
    try {
      // For this to work with ASN ID, we need the ID, not the number. 
      // But let's assume the user enters the ID for now for simplicity, or we do a lookup.
      const res = await fetch(`${apiUrl}/invoices/calculate/${asnNumber}`, {
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setCalculation(data);
      } else {
        alert("Failed to calculate. Make sure the ASN ID is correct.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    if (!calculation) return;
    try {
      const res = await fetch(`${apiUrl}/invoices/generate/${calculation.asn_id}`, {
        method: "POST",
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        alert("Invoice Generated Successfully!");
        setCalculation(null);
        setAsnNumber("");
        fetchInvoices();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Billing & Invoicing</h1>
      </div>

      <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h2 className="text-lg font-semibold mb-4">Generate Invoice</h2>
        <div className="flex gap-4 items-end">
            <div className="w-64">
                <Input 
                    type="text" 
                    placeholder="Enter ASN ID" 
                    value={asnNumber}
                    onChange={(e) => setAsnNumber(e.target.value)}
                />
            </div>
            <Button onClick={handleCalculate} className="bg-brand-500 text-white">Calculate</Button>
        </div>

        {calculation && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-3">Pre-Billing Estimate</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Total Capacity: <strong>{calculation.total_capacity} (Max of CBM/Ton)</strong></div>
                    <div>Days Stored: <strong>{calculation.days} days</strong></div>
                    <div>Base Tariff: <strong>Rp {calculation.base_tariff.toLocaleString()}</strong></div>
                    <div>Handling Fee: <strong>Rp {calculation.handling_fee.toLocaleString()}</strong></div>
                    <div>Storage Fee: <strong>Rp {calculation.storage_fee.toLocaleString()}</strong></div>
                    <div className="text-lg font-bold text-brand-600 mt-2">Total: Rp {calculation.total_amount.toLocaleString()}</div>
                </div>
                <div className="mt-4 flex gap-3">
                    <Button onClick={() => setCalculation(null)} variant="outline">Cancel</Button>
                    <Button onClick={handleGenerate} className="bg-green-500 text-white hover:bg-green-600">Confirm & Generate Invoice</Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
