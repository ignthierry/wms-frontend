import type { Metadata } from "next";
import React from "react";
import WMSMetrics from "@/components/wms/WMSMetrics";
import ActivityFeed from "@/components/wms/ActivityFeed";
import CapacityChart from "@/components/wms/CapacityChart";

export const metadata: Metadata = {
  title: "WMS Dashboard | WarehousePro Integrated Logistics",
  description: "Main dashboard for WMS Logistics Portal",
};

export default function LogisticsDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Top Metrics Cards */}
      <div className="col-span-12">
        <WMSMetrics />
      </div>

      {/* Main Content Row */}
      <div className="col-span-12 xl:col-span-8">
        <ActivityFeed />
      </div>

      {/* Sidebar Content Row */}
      <div className="col-span-12 xl:col-span-4">
        <CapacityChart />
      </div>
    </div>
  );
}
