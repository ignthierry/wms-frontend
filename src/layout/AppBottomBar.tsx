"use client";
import React, { useEffect, useState } from "react";
import { PackageOpen, QrCode, Camera, CheckSquare, ClipboardList, Truck } from "lucide-react";
import LiquidNav from "@/components/client/LiquidNav";
import "@/components/client/liquidnav.css";

const NAV_ADMIN = [
  { name: "Receiving", path: "/inbound/receiving", icon: PackageOpen, acc: "#1e40af" },
  { name: "QC Scan", path: "/inbound/qc", icon: QrCode, acc: "#0891b2" },
  { name: "Stock", path: "/inventory/stock", icon: ClipboardList, acc: "#16a34a" },
  { name: "Outbound", path: "/outbound/packing", icon: Truck, acc: "#ea580c" },
];

/** Operator field: hanya 4 menu operasional masuk/keluar */
const NAV_OPERATOR = [
  { name: "Receiving", path: "/inbound/receiving", icon: PackageOpen, acc: "#1e40af" },
  { name: "QC Scan", path: "/inbound/qc", icon: QrCode, acc: "#0891b2" },
  { name: "Outbound QC", path: "/outbound/qc", icon: Camera, acc: "#7c3aed" },
  { name: "Packing", path: "/outbound/packing", icon: CheckSquare, acc: "#ea580c" },
];

export default function AppBottomBar() {
  const [isOperator, setIsOperator] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setIsOperator(parsed.role?.role_name === "operator_field");
      }
    } catch {}
  }, []);

  const NAV = isOperator ? NAV_OPERATOR : NAV_ADMIN;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-3">
        <LiquidNav items={NAV.map((n) => ({ href: n.path, label: n.name, icon: n.icon, acc: n.acc }))} />
      </div>
    </div>
  );
}