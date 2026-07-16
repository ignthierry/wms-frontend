"use client";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function RevenueAndShippedCard({ metrics }: { metrics?: any }) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 60,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 2,
      },
    },
    colors: ["#3b82f6"],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function (seriesName) {
            return "";
          },
        },
      },
      marker: {
        show: false,
      },
    },
  };

  const series = [
    {
      data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54, 30],
    },
  ];

  return (
    <div className="flex flex-col justify-between space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Dokumen Inbound
          </p>
          <h3 className="text-3xl font-medium text-gray-800 dark:text-white/90">
            {metrics?.total_asn || 0}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Dokumen Outbound
          </p>
          <h3 className="text-3xl font-medium text-gray-800 dark:text-white/90">
            {metrics?.total_dr || 0}
          </h3>
        </div>
        <div className="h-[60px] w-full max-w-[150px]">
          {typeof window !== "undefined" && (
            <Chart options={options} series={series} type="bar" height={60} />
          )}
        </div>
      </div>
    </div>
  );
}
