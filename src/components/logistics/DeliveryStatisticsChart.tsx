"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DeliveryStatisticsChart({ chartData }: { chartData?: any }) {
  const categories = chartData?.categories || [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const series = chartData?.series || [
    {
      name: "Inbound (ASN)",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "Outbound (DR)",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#3b82f6", "#10b981"], // blue (Inbound) and green (Outbound)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Aktivitas Inbound & Outbound (6 Bulan Terakhir)
          </h3>
          <p className="dark:text-gray-40 text-sm text-gray-500">
            Grafik penerimaan (ASN) dan pengiriman (DR)
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-5 pt-5">
          <div className="flex items-center gap-1.5">
            <div className="bg-blue-500 h-2.5 w-2.5 rounded-full"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inbound (ASN)</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-green-500 h-2.5 w-2.5 rounded-full"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Outbound (DR)</p>
          </div>
        </div>
        <div className="h-[256px] w-full mt-4">
          {typeof window !== "undefined" && (
             <Chart options={options} series={series} type="area" height={256} />
          )}
        </div>
      </div>
    </div>
  );
}
