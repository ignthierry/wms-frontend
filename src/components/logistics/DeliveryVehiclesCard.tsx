import React from "react";
import { MoreHorizontal } from "lucide-react";
export default function DeliveryVehiclesCard() {
  return (
    <div className="flex flex-col justify-between space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Armada Pengiriman
          </h3>
          <p className="dark:text-gray-40 text-sm text-gray-500">
            Kendaraan yang sedang beroperasi
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      <div className="relative mt-5 flex justify-between">
        <div>
          <h3 className="mb-1 text-3xl font-medium text-gray-800 dark:text-white/90">
            29
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="text-success-600 font-medium">+3.85% </span>
            dari minggu lalu
          </p>
          <div className="mt-5 flex items-center gap-2">
            <div className="ring-success-500 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-inset">
              <div className="bg-success-500 h-2.5 w-2.5 rounded-full"></div>
            </div>
            <div>
              <span className="text-success-500 text-sm font-medium">Dalam Perjalanan</span>
            </div>
          </div>
        </div>
        <div>
          <div className="absolute -right-2 -bottom-2 w-24 h-24 sm:w-32 sm:h-32 opacity-80 pointer-events-none">
             <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 15V8C1 6.89543 1.89543 6 3 6H13V15H1Z" fill="#3b82f6"/>
                <path d="M13 15V8H16L20 11V15H13Z" fill="#60a5fa"/>
                <circle cx="5.5" cy="17.5" r="2.5" fill="#1f2937"/>
                <circle cx="16.5" cy="17.5" r="2.5" fill="#1f2937"/>
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
