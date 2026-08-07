"use client";
import React from "react";
import { PackageOpen, QrCode, ClipboardList, Truck } from "lucide-react";
import LiquidNav from "@/components/client/LiquidNav";
import "@/components/client/liquidnav.css";

const NAV = [
  { name: "Receiving", path: "/inbound/receiving", icon: PackageOpen, acc: "#1e40af" },
  { name: "QC Scan", path: "/inbound/qc", icon: QrCode, acc: "#0891b2" },
  { name: "Stock", path: "/inventory/stock", icon: ClipboardList, acc: "#16a34a" },
  { name: "Outbound", path: "/outbound/packing", icon: Truck, acc: "#ea580c" },
];

export default function AppBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-3">
        <LiquidNav items={NAV.map((n) => ({ href: n.path, label: n.name, icon: n.icon, acc: n.acc }))} />
      </div>
    </div>
  );
}