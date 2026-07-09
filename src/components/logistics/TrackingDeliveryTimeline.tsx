import React from "react";
import { MoreHorizontal, ShoppingCart, MapPin, CheckCircle2 } from "lucide-react";

export default function TrackingDeliveryTimeline() {
  return (
    <div className="space-y-4 rounded-xl border bg-gray-100 p-2 dark:border-gray-800 dark:bg-white/3">
      <div className="rounded-xl bg-white p-4 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tracking Delivery
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last viewed delivery history
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-5">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5145053176284!2d90.42105717591272!3d23.800296778636472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7e9f37a5a3d%3A0x41d7d1d02e1ed0e4!2sPimjo!5e0!3m2!1sen!2sbd!4v1751871078440!5m2!1sen!2sbd"
            width="100%"
            height="180"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl border border-gray-200 grayscale dark:border-gray-800"
          ></iframe>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 dark:bg-gray-900">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tracking ID</p>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              #28745-72809bjk
            </h3>
          </div>
          <div className="relative">
            <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium">
              In Transit
            </span>
          </div>
        </div>

        <div className="mt-5">
          {/* Picked up */}
          <div className="relative pb-5 pl-11">
            <div className="text-brand-500 bg-brand-50 dark:ring-brand-500/15 ring-brand-50 dark:bg-brand-950 absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ring-2 dark:border-gray-700">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="ml-2 flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">12 Apr 2028</p>
                <h4 className="font-medium text-gray-800 dark:text-white/90">Picked up</h4>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">12:54</span>
              </div>
            </div>
            <div className="border-brand-500 absolute top-10 left-5 h-full w-px border border-dashed"></div>
          </div>

          {/* In Transit */}
          <div className="relative pb-5 pl-11">
            <div className="text-brand-500 bg-brand-50 dark:ring-brand-500/15 ring-brand-50 dark:bg-brand-950 absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white ring-2 dark:border-gray-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="ml-2 flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">12 Apr 2028</p>
                <h4 className="font-medium text-gray-800 dark:text-white/90">In Transit</h4>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">12:58</span>
              </div>
            </div>
            <div className="absolute top-10 left-5 z-10 h-full w-px border border-dashed border-gray-200 dark:border-gray-800"></div>
          </div>

          {/* Delivered */}
          <div className="relative pl-11">
            <div className="dark:ring-brand-500/15 ring-brand-50 absolute top-0 left-0 z-20 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-700 ring-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="ml-2 flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">13 Apr 2028</p>
                <h4 className="font-medium text-gray-800 dark:text-white/90">Delivered</h4>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">--:--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Courier profile */}
      <div className="flex justify-between rounded-xl bg-white p-4 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-gray-500 font-bold">DW</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Courier</p>
            <h3 className="text-sm font-medium text-gray-800 dark:text-white/90">Devid walthen</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
