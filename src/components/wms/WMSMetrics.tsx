"use client";
import React from "react";
import { motion } from "framer-motion";
import { Package, ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";

const metrics = [
  {
    title: "Total Capacity",
    value: "84%",
    description: "2,150 / 2,560 Pallets",
    icon: <Package className="w-6 h-6 text-brand-500" />,
    color: "bg-brand-50 text-brand-500",
  },
  {
    title: "Inbound Today",
    value: "142",
    description: "Pallets Received",
    icon: <ArrowDownToLine className="w-6 h-6 text-green-500" />,
    color: "bg-green-50 text-green-500",
  },
  {
    title: "Outbound Today",
    value: "89",
    description: "Pallets Dispatched",
    icon: <ArrowUpFromLine className="w-6 h-6 text-orange-500" />,
    color: "bg-orange-50 text-orange-500",
  },
  {
    title: "Pending ASN",
    value: "12",
    description: "Awaiting Arrival",
    icon: <Clock className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-50 text-blue-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WMSMetrics() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.title}
              </p>
              <h4 className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
                {metric.value}
              </h4>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${metric.color} dark:bg-white/10`}
            >
              {metric.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {metric.description}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
