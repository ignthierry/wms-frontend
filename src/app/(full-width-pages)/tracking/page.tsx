"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { Search } from "lucide-react";

export default function TrackingPortal() {
  const [identifier, setIdentifier] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const res = await fetch(`${apiUrl}/tracking/cargo/${encodeURIComponent(identifier)}`, {
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingData(data);
      } else {
        setError("Cargo not found. Please check your Master BL, Host BL, or Container Number.");
      }
    } catch (err) {
      setError("An error occurred while tracking.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Cargo</h1>
          <p className="mt-2 text-gray-600">Enter your Master BL, Host BL, or Container Number</p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center bg-white p-2 rounded-full shadow-sm border border-gray-200 focus-within:ring-2 ring-brand-500">
          <div className="pl-4 text-gray-400"><Search className="w-5 h-5"/></div>
          <input 
            type="text" 
            placeholder="e.g., MBL-12345, HBL-98765, CONT-1122" 
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button type="submit" disabled={isLoading} className="bg-brand-500 hover:bg-brand-600 text-white rounded-full px-8 py-3 h-auto">
            {isLoading ? "Searching..." : "Track"}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}

        {trackingData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h2 className="text-xl font-semibold border-b pb-4">Tracking Results</h2>
            
            {trackingData.type === 'HOST_BL' ? (
                // Consignee Level Result
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">Tracking Level: Consignee (Host BL)</p>
                    {trackingData.data.map((item: any) => (
                        <div key={item.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>Host BL: <span className="font-semibold">{item.host_bl}</span></div>
                                <div>Item: <span className="font-semibold">{item.item_name}</span></div>
                                <div>Qty: <span className="font-semibold">{item.qty_expected} {item.packaging}</span></div>
                                <div>Condition: <span className="font-semibold">{item.item_condition || '-'}</span></div>
                                <div>Location Block: <span className="font-semibold text-brand-600">{item.block_location || 'Not Stored Yet'}</span></div>
                            </div>
                            {item.photo_proof && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-2">Physical Condition Proof:</p>
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/${item.photo_proof}`} alt="Proof" className="max-w-full h-auto rounded-lg max-h-64 object-contain bg-white border"/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                // Forwarding Level Result
                <div className="space-y-6">
                    <p className="text-sm text-gray-500">Tracking Level: Forwarding (Master BL / Container)</p>
                    {trackingData.data.map((asn: any) => (
                        <div key={asn.id} className="space-y-4">
                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Master BL: <span className="font-semibold">{asn.no_master_bl}</span></div>
                                    <div>Container: <span className="font-semibold">{asn.no_container}</span></div>
                                    <div>Status: <span className="font-semibold">{asn.status}</span></div>
                                </div>
                            </div>
                            
                            <h3 className="font-medium mt-4">Items inside:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {asn.items.map((item: any) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 text-sm">
                                        <div className="font-semibold">{item.host_bl || 'No Host BL'} - {item.item_name}</div>
                                        <div className="text-gray-500 text-xs mt-1">Block: {item.block_location || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
