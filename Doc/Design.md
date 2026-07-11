Architecture & Design Document (DESIGN.md)
Dokumen ini menjelaskan arsitektur tingkat tinggi, pilihan teknologi, struktur proyek, dan prinsip-prinsip desain yang diterapkan dalam TailAdmin Free Next.js Admin Dashboard.

1. Tech Stack & Core Decisions
Aplikasi ini dibangun dengan fokus pada performa, skalabilitas tipe data, dan kemudahan kustomisasi UI menggunakan teknologi modern:

Framework: Next.js (App Router) – Memanfaatkan Server Components secara default untuk performa loading yang cepat dan optimasi SEO, serta Client Components hanya pada bagian interaktif.

Language: TypeScript – Menjamin type-safety di seluruh komponen, mengurangi bug saat runtime, dan mempermudah proses refactoring.

Styling: Tailwind CSS – Pendekatan utility-first untuk membangun UI yang responsif, konsisten, dan sangat modular tanpa perlu menulis file CSS terpisah.

Icons & Graphics: React Icons / SVGs inline – Menjaga bundle size tetap ringan dan memastikan aset visual tetap tajam di berbagai resolusi layar.

2. High-Level Architecture
TailAdmin menggunakan pola arsitektur Feature-Based & Component-Driven Architecture yang dipadukan dengan struktur folder bawaan Next.js App Router.

Aliran Data & Render (Data Flow)
Layout Level: layout.tsx utama membungkus aplikasi dengan penyedia state (seperti Sidebar context dan Theme provider) dan menyediakan struktur global (Sidebar, Header, Main Content).

Page Level: Setiap route di dalam direktori app/ bertindak sebagai entry point. Komponen di tingkat ini berfokus pada penyusunan tata letak spesifik halaman.

Component Level: Bagian-bagian kecil UI (seperti Charts, Tables, dan Cards) bersifat mandiri (self-contained) dan menerima data melalui props atau mengelola state lokal mereka sendiri.

3. Project Directory Structure
Berikut adalah gambaran ringkas struktur direktori utama dan tanggung jawab masing-masing folder:

Plaintext
├── app/                    # Next.js App Router (Routing & Pages)
│   ├── calendar/           # Halaman Kalender
│   ├── chart/              # Halaman Visualisasi Data / Chart
│   ├── forms/              # Halaman Form Elements & Layouts
│   ├── profile/            # Halaman Profil Pengguna
│   ├── tables/             # Halaman Data Tables
│   ├── layout.tsx          # Layout Utama (Sidebar + Header + Content Container)
│   └── page.tsx            # Dashboard E-Commerce (Halaman Utama)
├── components/             # Reusable UI Components
│   ├── Calender/           # Komponen spesifik Kalender
│   ├── Charts/             # Komponen ApexCharts (ChartOne, ChartTwo, dll.)
│   ├── Chat/               # Komponen Chat Card
│   ├── Dashboard/          # Sub-komponen khusus Dashboard Utama
│   ├── Header/             # Navigasi Atas (User Menu, Notification, DarkModeSwitcher)
│   ├── Maps/               # Komponen Peta (Vector Maps)
│   ├── Sidebar/            # Navigasi Samping (Menu links & Collapsible groups)
│   └── Tables/             # Variasi tabel data
├── css/                    # Konfigurasi style global (satoshi.css, style.css)
├── hooks/                  # Custom React Hooks (e.g., useLocalStorage, useColorMode)
├── types/                  # TypeScript Interfaces & Types global
└── public/                 # Aset statis (Images, Icons, SVG)
4. UI/UX Design System
TailAdmin menerapkan sistem desain yang konsisten dengan karakteristik sebagai berikut:

🎨 Color Palette & Themes
Dark Mode Support: Dukungan penuh untuk mode gelap (Dark Mode) yang dikelola melalui utilitas hooks/useColorMode dan kelas dark: bawaan Tailwind.

Primary Accent: Menggunakan warna biru/indigo modern sebagai warna aksi utama (call-to-action), dipadukan dengan latar belakang netral (slate/gray) untuk menjaga keterbacaan yang tinggi.

📐 Typography & Layouts
Font: Menggunakan font Satoshi (atau sistem font fallback sans-serif) yang dimuat secara lokal untuk memberikan kesan premium, bersih, dan profesional.

Responsiveness: Tata letak menggunakan pendekatan Mobile-First. Sidebar secara otomatis tersembunyi pada layar kecil (tablet/mobile) dan dapat dimunculkan melalui tombol hamburger di Header.