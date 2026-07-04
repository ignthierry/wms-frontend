"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CapacityChart() {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#465fff", "#10B981", "#F59E0B", "#F3F4F6"],
    labels: ["Zone A (Dry)", "Zone B (Cold)", "Zone C (Hazmat)", "Empty Space"],
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Outfit",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 700,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Capacity",
              formatter: function (w) {
                return "2,560";
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
  };

  const series = [850, 420, 200, 1090];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          Warehouse Capacity
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Storage utilization across all zones
        </p>
      </div>
      <div className="relative flex items-center justify-center pt-2">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={320}
        />
      </div>
    </motion.div>
  );
}
