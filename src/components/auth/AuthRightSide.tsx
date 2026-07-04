"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const backgroundImages = [
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
];

export default function AuthRightSide() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative lg:w-1/2 w-full h-full hidden lg:block overflow-hidden">
      {backgroundImages.map((src, index) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: currentImageIndex === index ? 1 : 0,
            scale: currentImageIndex === index ? 1 : 1.1,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <Image
            src={src}
            alt={`Warehouse Logistics ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            unoptimized
          />
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-brand-950/60 dark:bg-black/70 mix-blend-multiply z-10"></div>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
        <motion.div 
          className="flex flex-col items-center max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Link href="/" className="block mb-6">
            <Image
              width={250}
              height={50}
              src="https://everwin-company-profile.vercel.app/_next/static/media/logo.e7c017e3.png"
              alt="Everwin Logo"
              className="drop-shadow-lg object-contain bg-white/80 p-2 rounded-lg"
              unoptimized
            />
          </Link>
          <p className="text-white text-xl font-medium drop-shadow-md mb-4">
            Integrated Logistics & Warehouse Management System
          </p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-accent font-bold text-2xl">500+</span>
              <span className="text-white/80 text-sm">Klien Puas</span>
            </div>
            <div className="w-px bg-white/30 h-10 my-auto"></div>
            <div className="flex flex-col items-center">
              <span className="text-accent font-bold text-2xl">1000+</span>
              <span className="text-white/80 text-sm">Pengiriman</span>
            </div>
            <div className="w-px bg-white/30 h-10 my-auto"></div>
            <div className="flex flex-col items-center">
              <span className="text-accent font-bold text-2xl">100%</span>
              <span className="text-white/80 text-sm">Tepat Waktu</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
