"use client";
import React, { useState } from "react";
import { Filter } from "lucide-react";

export default function DeliveryActivitiesTable() {
  const [selectedTab, setSelectedTab] = useState("All");
  
  const tabs = ["All", "Delivered", "In-Transit", "Pending", "Processing"];
  
  const deliveries = [
    {
      id: "#23412-234",
      category: "Electronics",
      company: "TechCorp",
      amount: "$1,250",
      status: "Delivered",
      date: "12 Apr 2028",
    },
    {
      id: "#23412-235",
      category: "Furniture",
      company: "IKEA",
      amount: "$850",
      status: "In-Transit",
      date: "13 Apr 2028",
    },
    {
      id: "#23412-236",
      category: "Clothing",
      company: "Zara",
      amount: "$320",
      status: "Pending",
      date: "14 Apr 2028",
    },
    {
      id: "#23412-237",
      category: "Groceries",
      company: "Whole Foods",
      amount: "$150",
      status: "Processing",
      date: "15 Apr 2028",
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Delivered": return "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500";
      case "In-Transit": return "bg-brand-50 text-brand-500 dark:bg-brand-500/15";
      case "Pending": return "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500";
      case "Processing": return "bg-blue-50 text-blue-500 dark:bg-blue-500/15";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const filteredDeliveries = selectedTab === "All" 
    ? deliveries 
    : deliveries.filter(d => d.status === selectedTab);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
        <div className="flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Delivery Activities
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your recent shipping activities
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

          <div>
            <button className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
            <tr>
              <th className="px-5 py-4 font-medium">Order ID</th>
              <th className="px-5 py-4 font-medium">Category</th>
              <th className="px-5 py-4 font-medium">Company</th>
              <th className="px-5 py-4 font-medium">Amount</th>
              <th className="px-5 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredDeliveries.map((delivery) => (
              <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {delivery.id}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{delivery.date}</div>
                </td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{delivery.category}</td>
                <td className="px-5 py-4 text-gray-600 dark:text-gray-300">{delivery.company}</td>
                <td className="px-5 py-4 text-gray-900 dark:text-white font-medium">{delivery.amount}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </td>
              </tr>
            ))}
            
            {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No activities found.
                  </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
