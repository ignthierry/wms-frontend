import React from "react";
import { MoreHorizontal, ShoppingCart, MapPin, CheckCircle2, Box } from "lucide-react";

export default function TrackingDeliveryTimeline({ asns, drs }: { asns?: any[], drs?: any[] }) {
  const latestDoc = (() => {
    const all = [
      ...(asns || []).map(a => ({ type: 'ASN', id: a.asn_number, date: a.created_at, status: a.status })),
      ...(drs || []).map(d => ({ type: 'DR', id: d.dr_number, date: d.created_at, status: d.status }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all[0];
  })();

  if (!latestDoc) {
    return (
      <div className="space-y-4 rounded-xl border bg-gray-100 p-2 dark:border-gray-800 dark:bg-white/3">
         <div className="rounded-xl bg-white p-4 dark:bg-gray-900 text-center text-gray-500">
           Belum ada aktivitas.
         </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (['RECEIVED', 'DELIVERED', 'COMPLETED'].includes(status)) return "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500";
    if (['ON_TRANSIT', 'SHIPPED'].includes(status)) return "bg-brand-50 text-brand-500 dark:bg-brand-500/15";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  return (
    <div className="space-y-4 rounded-xl border bg-gray-100 p-2 dark:border-gray-800 dark:bg-white/3">
      <div className="rounded-xl bg-white p-4 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tracking Terbaru
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dokumen Inbound/Outbound terakhir
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-gray-900">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{latestDoc.type} ID</p>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {latestDoc.id}
            </h3>
          </div>
          <div className="relative">
            <span className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${getStatusColor(latestDoc.status)}`}>
              {latestDoc.status}
            </span>
          </div>
        </div>

        <div className="mt-5">
          {/* Created */}
          <div className="relative pb-5 pl-11">
            <div className="text-brand-500 bg-brand-50 dark:ring-brand-500/15 ring-brand-50 dark:bg-brand-950 absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ring-2 dark:border-gray-700">
              <Box className="w-5 h-5" />
            </div>
            <div className="ml-2 flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(latestDoc.date).toLocaleDateString()}</p>
                <h4 className="font-medium text-gray-800 dark:text-white/90">Dibuat</h4>
              </div>
            </div>
            <div className="border-brand-500 absolute top-10 left-5 h-full w-px border border-dashed"></div>
          </div>

          {/* Current Status */}
          <div className="relative pl-11">
            <div className="dark:ring-brand-500/15 ring-brand-50 absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-700 ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="ml-2 flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(latestDoc.date).toLocaleDateString()}</p>
                <h4 className="font-medium text-gray-800 dark:text-white/90">{latestDoc.status}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
