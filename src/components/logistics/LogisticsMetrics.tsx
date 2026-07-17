"use client";
import React from "react";
import { Package, Truck, Database, Building2, PieChart } from "lucide-react";

export default function LogisticsMetrics({ metrics }: { metrics?: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Total Inbound (ASN) */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 shrink-0">
          <Package className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {metrics?.total_asn || 0}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inbound (ASN)</p>
        </div>
      </article>

      {/* Metric 2: Total Outbound (DR) */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 shrink-0">
          <Truck className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {metrics?.total_dr || 0}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Outbound (DR)</p>
        </div>
      </article>

      {/* Metric 3: Total Stock */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500 shrink-0">
          <Database className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {metrics?.total_stock_qty || 0}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock Qty</p>
        </div>
      </article>

      {/* Metric 4: Total Warehouses */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500 shrink-0">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {metrics?.total_warehouse || 0}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Warehouses</p>
        </div>
      </article>
    </div>
  );
}
