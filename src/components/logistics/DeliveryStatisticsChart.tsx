"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DeliveryStatisticsChart() {
  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#3b82f6", "#10b981"], // blue (Shipment) and green (Delivery)
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
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
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

  const series = [
    {
      name: "Shipment",
      data: [150, 200, 180, 210, 250, 220, 260, 290, 310, 280, 330, 350],
    },
    {
      name: "Delivery",
      data: [130, 180, 160, 190, 230, 200, 240, 270, 290, 260, 310, 320],
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Delivery Statistics
          </h3>
          <p className="dark:text-gray-40 text-sm text-gray-500">
            Total number of deliveries 70.5K
          </p>
        </div>
        <div>
          <select className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-5 pt-5">
          <div className="flex items-center gap-1.5">
            <div className="bg-blue-500 h-2.5 w-2.5 rounded-full"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shipment</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-green-500 h-2.5 w-2.5 rounded-full"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery</p>
          </div>
        </div>
        <div className="h-[256px] w-full mt-4">
          <Chart options={options} series={series} type="area" height={256} />
        </div>
      </div>
    </div>
  );
}
