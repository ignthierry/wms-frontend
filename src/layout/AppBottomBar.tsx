"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, BoxCubeIcon, TableIcon, PageIcon } from "../icons/index";

export default function AppBottomBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/", icon: <GridIcon /> },
    { name: "Scan Inbound", path: "/inbound/receiving", icon: <BoxCubeIcon /> },
    { name: "Stock Check", path: "/inventory/stock", icon: <TableIcon /> },
    { name: "Scan Outbound", path: "/outbound/packing", icon: <PageIcon /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={index}
              href={item.path}
              className={`inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group ${
                isActive ? "text-brand-500" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 mb-1 group-hover:text-brand-500 ${
                  isActive ? "text-brand-500 fill-current" : ""
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs ${
                  isActive
                    ? "text-brand-500 font-semibold"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-brand-500"
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
