import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import PWARegister from '@/components/PWARegister';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "WarehousePro WMS",
  description: "WarehousePro Logistics Portal — pantau barang, scan QR, lacak kiriman, dan kelola stok gudang Anda dari mana saja.",
  manifest: "/manifest.json",
  applicationName: "WarehousePro WMS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WarehousePro WMS",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#465FFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
        <PWARegister />
      </body>
    </html>
  );
}
