import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="relative lg:w-1/2 w-full h-full hidden lg:block">
            <Image
              src="/images/warehouse.png"
              alt="Warehouse Logistics"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-950/40 dark:bg-black/60 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <div className="flex flex-col items-center max-w-sm p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <Link href="/" className="block mb-4">
                  <Image
                    width={231}
                    height={48}
                    src="/images/logo/auth-logo.svg"
                    alt="Logo"
                  />
                </Link>
                <p className="text-white text-lg font-medium drop-shadow-md">
                  Integrated Logistics & Warehouse Management System
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
