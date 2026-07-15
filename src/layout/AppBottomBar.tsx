"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PackageOpen, QrCode, ClipboardList, Truck } from "lucide-react";

export default function AppBottomBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Receiving", path: "/inbound/receiving", icon: PackageOpen },
    { name: "QC Scan", path: "/inbound/qc", icon: QrCode },
    { name: "Stock", path: "/inventory/stock", icon: ClipboardList },
    { name: "Outbound", path: "/outbound/packing", icon: Truck },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto font-medium px-4">
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={index}
              href={item.path}
              className="relative inline-flex flex-col items-center justify-center w-16 h-full group"
            >
              <div
                className={`absolute transition-all duration-300 ease-out flex items-center justify-center rounded-full ${
                  isActive 
                    ? "w-12 h-12 bg-brand-500 text-white -translate-y-5 shadow-lg shadow-brand-500/40 ring-4 ring-white dark:ring-gray-900" 
                    : "w-8 h-8 text-gray-400 group-hover:text-brand-500 bg-transparent translate-y-[-10px]"
                }`}
              >
                {React.createElement(item.icon, { className: "w-6 h-6" })}
              </div>
              <span
                className={`absolute bottom-2 text-[10px] whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "text-brand-600 font-bold opacity-100 translate-y-0"
                    : "text-gray-500 dark:text-gray-400 font-medium translate-y-1"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
