"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Truck, AlertCircle, PackageCheck } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "inbound_completed",
    title: "Goods Receiving Completed",
    description: "ASN-202607-0001 from PT. Supplier Utama has been successfully received and verified.",
    time: "10 mins ago",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    color: "bg-green-50",
  },
  {
    id: 2,
    type: "dispatch",
    title: "Delivery Dispatched",
    description: "DR-202607-0005 for Client A is in transit via Express Logistics.",
    time: "1 hour ago",
    icon: <Truck className="w-5 h-5 text-blue-500" />,
    color: "bg-blue-50",
  },
  {
    id: 3,
    type: "deviation",
    title: "Inbound Deviation Reported",
    description: "Shortage of 2 pallets in ASN-202607-0002. Waiting for client confirmation.",
    time: "3 hours ago",
    icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
    color: "bg-orange-50",
  },
  {
    id: 4,
    type: "packing",
    title: "Packing Verified",
    description: "DR-202607-0006 packing process completed by Operator John.",
    time: "4 hours ago",
    icon: <PackageCheck className="w-5 h-5 text-purple-500" />,
    color: "bg-purple-50",
  },
];

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
          Recent Activities
        </h3>
        <button className="text-sm font-medium text-brand-500 hover:text-brand-600">
          View All
        </button>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6"
      >
        {activities.map((activity) => (
          <motion.div key={activity.id} variants={itemVariants} className="relative pl-6">
            <div
              className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${activity.color}`}
            >
              {activity.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {activity.title}
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activity.description}
              </p>
              <span className="mt-2 block text-xs text-gray-400 dark:text-gray-500">
                {activity.time}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
