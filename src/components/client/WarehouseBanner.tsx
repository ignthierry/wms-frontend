"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, Sparkles } from "lucide-react";

interface WarehouseBannerProps {
  name?: string;
  totalItems?: number;
  unpaidInvoices?: number;
}

/**
 * Banner hero bergaya native mobile app — ilustrasi warehouse full-cover,
 * animasi mengambang, karakter robot/kurir, dan statistik klikable.
 */
export default function WarehouseBanner({ name, totalItems = 0, unpaidInvoices = 0 }: WarehouseBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-brand-200/60 shadow-xl shadow-brand-700/20 dark:border-white/10"
    >
      {/* Background illustration — FULL COVER, tanpa gap */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/images/warehouse.png"
          alt=""
          fill
          sizes="(max-width: 512px) 100vw, 512px"
          className="object-cover object-center"
          unoptimized
          priority
        />
        {/* Overlay RINGAN agar ilustrasi warehouse tetap terlihat, teks tetap terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-900/15 to-brand-950/70" />
      </div>

      {/* Animated glow orbs */}
      <motion.div
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-500/30 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-brand-400/30 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Floating warehouse characters (front layer) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating box */}
        <motion.div
          className="absolute right-6 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm"
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Package className="h-5 w-5 text-white" />
        </motion.div>
        {/* Floating truck */}
        <motion.div
          className="absolute right-20 top-14 flex h-9 w-9 items-center justify-center rounded-full bg-orange-500/25 backdrop-blur-sm"
          animate={{ y: [0, -6, 0], x: [0, 3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <Truck className="h-4.5 w-4.5 text-orange-200" />
        </motion.div>
        {/* Floating sparkles */}
        <motion.div
          className="absolute left-10 bottom-16 text-brand-200"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>
        <motion.div
          className="absolute left-24 top-6 text-brand-200/70"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.div>

        {/* Robot character (mini AMR) */}
        <motion.div
          className="absolute bottom-4 right-5 flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm">🤖</span>
          <span className="text-[10px] font-semibold text-white/90">AMR-01</span>
        </motion.div>

        {/* Forklift character */}
        <motion.div
          className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm">🚛</span>
          <span className="text-[10px] font-semibold text-white/90">Forklift</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white">
              Warehouse Aktif
            </span>
          </div>
          <h2 className="text-xl font-extrabold leading-tight text-white drop-shadow-sm">
            Halo, {name?.split(" ")[0] || "Client"}! 👋
          </h2>
          <p className="mt-1 max-w-[75%] text-xs leading-relaxed text-brand-100/90">
            Pantau pergerakan barang Anda secara real-time di gudang kami.
          </p>
        </motion.div>

        {/* Stats row — KLIKABLE, ganti redundansi di bawah */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 grid grid-cols-2 gap-2.5"
        >
          <Link
            href="/client/barang"
            className="flex items-center gap-2.5 rounded-2xl bg-white/10 p-3 backdrop-blur-md transition hover:bg-white/20 active:scale-[0.97]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Package className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-white">{totalItems}</p>
              <p className="mt-0.5 text-[10px] font-medium text-brand-100/80">Total Barang</p>
            </div>
          </Link>
          <Link
            href="/client/invoice"
            className="flex items-center gap-2.5 rounded-2xl bg-white/10 p-3 backdrop-blur-md transition hover:bg-white/20 active:scale-[0.97]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/30">
              <span className="text-base">📦</span>
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-white">{unpaidInvoices}</p>
              <p className="mt-0.5 text-[10px] font-medium text-brand-100/80">Invoice Belum Bayar</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Bottom fade for smooth transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/10 to-transparent" />
    </motion.section>
  );
}