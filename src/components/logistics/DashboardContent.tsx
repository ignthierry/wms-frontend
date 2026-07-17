"use client";
import React, { useEffect, useState } from "react";
import LogisticsMetrics from "./LogisticsMetrics";
import DeliveryStatisticsChart from "./DeliveryStatisticsChart";
import RevenueAndShippedCard from "./RevenueAndShippedCard";
import DeliveryVehiclesCard from "./DeliveryVehiclesCard";
import TrackingDeliveryTimeline from "./TrackingDeliveryTimeline";
import DeliveryActivitiesTable from "./DeliveryActivitiesTable";
import SorDonutChart from "./SorDonutChart";

export default function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${apiUrl}/dashboard`, {
        headers: { "Accept": "application/json" }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12">
        <LogisticsMetrics metrics={data?.metrics} />
      </div>

      <div className="col-span-12 space-y-6 lg:col-span-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DeliveryStatisticsChart chartData={data?.chart_data} />
          </div>
          <div className="lg:col-span-1">
            <SorDonutChart metrics={data?.metrics} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <RevenueAndShippedCard metrics={data?.metrics} />
          <DeliveryVehiclesCard />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <TrackingDeliveryTimeline asns={data?.recent_asns} drs={data?.recent_drs} />
      </div>

      <div className="col-span-12">
        <DeliveryActivitiesTable asns={data?.recent_asns} drs={data?.recent_drs} />
      </div>
    </div>
  );
}
