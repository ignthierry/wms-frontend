"use client";
import React, { useState } from "react";
import { Filter } from "lucide-react";

export default function DeliveryActivitiesTable({ asns, drs }: { asns?: any[], drs?: any[] }) {
  const [selectedTab, setSelectedTab] = useState("All");
  
  const tabs = ["All", "Inbound", "Outbound"];
  
  const activities = [
    ...(asns || []).map(a => ({
      id: a.asn_number,
      type: "Inbound",
      warehouse: a.warehouse?.name || "-",
      date: new Date(a.created_at).toLocaleDateString(),
      status: a.status,
      timestamp: new Date(a.created_at).getTime()
    })),
    ...(drs || []).map(d => ({
      id: d.dr_number,
      type: "Outbound",
      warehouse: d.warehouse?.name || "-",
      date: new Date(d.created_at).toLocaleDateString(),
      status: d.status,
      timestamp: new Date(d.created_at).getTime()
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "RECEIVED":
      case "DELIVERED":
      case "COMPLETED":
        return "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500";
      case "ON_TRANSIT":
      case "SHIPPED":
        return "bg-brand-50 text-brand-500 dark:bg-brand-500/15";
      case "PENDING":
      case "DRAFT":
        return "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500";
      case "PROCESSING":
        return "bg-blue-50 text-blue-500 dark:bg-blue-500/15";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const filteredActivities = selectedTab === "All" 
    ? activities 
    : activities.filter(a => a.type === selectedTab);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
        <div className="flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Aktivitas Terbaru
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lacak aktivitas Inbound dan Outbound terbaru
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex h-11 w-full gap-0.5 overflow-x-auto rounded-lg bg-gray-100 p-0.5 sm:w-auto lg:min-w-fit dark:bg-gray-900">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`h-10 flex-1 rounded-md px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm lg:flex-initial transition-colors ${
                  selectedTab === tab
                    ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
            <tr>
              <th className="px-5 py-4 font-medium">Nomor Dokumen</th>
              <th className="px-5 py-4 font-medium">Tipe</th>
              <th className="px-5 py-4 font-medium">Gudang</th>
              <th className="px-5 py-4 font-medium">Tanggal</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredActivities.map((activity, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {activity.id}
                  </div>
                </td>
                <td className="px-5 py-4">
                   <span className={`px-2 py-1 rounded text-xs font-medium ${activity.type === 'Inbound' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                     {activity.type}
                   </span>
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{activity.warehouse}</td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{activity.date}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
            
            {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Tidak ada aktivitas.
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
