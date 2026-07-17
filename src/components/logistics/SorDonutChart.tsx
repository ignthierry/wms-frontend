"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SorDonutChart({ metrics }: { metrics?: any }) {
  const sor = metrics?.sor_percentage || 0;
  
  const series = [sor, 100 - sor];
  
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#0ea5e9", "#f1f5f9"], // Brand color and light gray
    labels: ["Terisi", "Kosong"],
    legend: {
      show: true,
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "#64748b",
            },
            value: {
              show: true,
              fontSize: "24px",
              fontWeight: 600,
              color: "#0f172a",
              formatter: function (val) {
                return val + "%";
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: "SOR",
              fontSize: "14px",
              color: "#64748b",
              formatter: function (w) {
                return sor + "%";
              }
            }
          }
        }
      }
    },
    stroke: {
      show: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val) {
          return val + "%";
        }
      }
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Storage Occupancy
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kapasitas Gudang Terpakai
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {typeof window !== "undefined" && (
          <Chart options={options} series={series} type="donut" height={256} width="100%" />
        )}
      </div>
    </div>
  );
}
