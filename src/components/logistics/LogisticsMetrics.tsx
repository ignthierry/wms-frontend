"use client";
import React from "react";
import { Package, Truck, CheckCircle } from "lucide-react";

export default function LogisticsMetrics() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Metric 1: Total Orders */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
          <Package className="h-7 w-7 text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            12,384
          </h3>
          <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            Total Orders
            <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
              +20%
            </span>
          </p>
        </div>
      </article>

      {/* Metric 2: Orders in Transit */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
          <Truck className="h-7 w-7 text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            728
          </h3>
          <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            Orders in Transit
            <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
              +12%
            </span>
          </p>
        </div>
      </article>

      {/* Metric 3: Delivered Orders */}
      <article className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
          <CheckCircle className="h-7 w-7 text-gray-800 dark:text-white/90" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            11,540
          </h3>
          <p className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            Delivered Orders
            <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
              +15%
            </span>
          </p>
        </div>
      </article>
    </div>
  );
}
