import type { Metadata } from "next";
import React from "react";
import LogisticsMetrics from "@/components/logistics/LogisticsMetrics";
import DeliveryStatisticsChart from "@/components/logistics/DeliveryStatisticsChart";
import RevenueAndShippedCard from "@/components/logistics/RevenueAndShippedCard";
import DeliveryVehiclesCard from "@/components/logistics/DeliveryVehiclesCard";
import TrackingDeliveryTimeline from "@/components/logistics/TrackingDeliveryTimeline";
import DeliveryActivitiesTable from "@/components/logistics/DeliveryActivitiesTable";

export const metadata: Metadata = {
  title: "WMS Dashboard | WarehousePro Integrated Logistics",
  description: "Main dashboard for WMS Logistics Portal",
};

export default function LogisticsDashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Top Metrics Cards */}
      <div className="col-span-12">
        <LogisticsMetrics />
      </div>

      <div className="col-span-12 space-y-6 lg:col-span-8">
        <DeliveryStatisticsChart />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <RevenueAndShippedCard />
          <DeliveryVehiclesCard />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <TrackingDeliveryTimeline />
      </div>

      <div className="col-span-12">
        <DeliveryActivitiesTable />
      </div>
    </div>
  );
}
