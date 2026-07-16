import type { Metadata } from "next";
import React from "react";
import DashboardContent from "@/components/logistics/DashboardContent";

export const metadata: Metadata = {
  title: "WMS Dashboard | WarehousePro Integrated Logistics",
  description: "Main dashboard for WMS Logistics Portal",
};

export default function LogisticsDashboard() {
  return (
    <DashboardContent />
  );
}
