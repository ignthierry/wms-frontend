Product Requirement Document (PRD) – Integrated Logistics & WMS
1. Project Overview
Membangun platform logistik terintegrasi digital untuk mengelola operasional end-to-end: dari manajemen gudang (WMS), pengurusan dokumen kepabeanan (PPJK), manajemen armada domestik (EMKL/Transportasi), hingga pengiriman internasional (Freight Forwarding ekspor-impor).
Tech Stack Architecture
Backend: Laravel (sebagai Robust RESTful API / GraphQL, Queue Management untuk integrasi pihak ketiga, dan rekam log kontainer).
Frontend: Next.js (Dashboard Admin, Portal Pelanggan, yang responsif, state management yang kuat, dan mendukung SSR/ISR untuk efisiensi).
Database: MySQL / PostgreSQL (mendukung relasi data yang kompleks antara inventory, shipping, dan billing).
2. User Personas & Roles
Sistem akan diakses oleh beberapa peran dengan hak akses (RBAC) yang ketat:
Super Admin / Management: Monitoring revenue, utilisasi gudang, dan performa operasional global.
Warehouse Admin & Staff: Mengelola inbound, outbound, stock opname, dan space allocation di gudang.
PPJK & Forwarding Specialist: Mengurus dokumen kepabeanan (PEB, PIB), billing pelayaran, dan booking kontainer.
Dispatcher / Operational Land Transport: Mengatur penjadwalan armada truk (EMKL) dan pelacakan driver.
Customer Portal Users: Eksportir/Importir yang memantau status barang, posisi kontainer, sisa kuota gudang, dan tagihan.
3. Core Modules & Feature Requirements
A. WMS Module (Persewaan & Manajemen Gudang)
Mengelola aktivitas fisik barang di dalam gudang serta skema bisnis penyewaan (per m², per kubik, atau per palet).
Space & Contract Management: Pencatatan kontrak sewa gudang pelanggan (durasi, tarif per m³ atau per palet).
Inbound & Outbound Logistics: Proses receiving barang, put-away (penempatan rak), picking, dan packing.
Stock Opname & Movement: Fitur penyesuaian stok berkala dan riwayat perpindahan antar-rak.
Cross-Docking: Fasilitas pemindahan barang langsung dari inbound ke outbound tanpa masuk ke penyimpanan permanen.
B. PPJK & Forwarding Module (Ekspor-Impor)
Modul untuk menangani regulasi kepabeanan dan koordinasi logistik internasional.
Customs Document Management: Upload dan validasi dokumen PIB (Pemberitahuan Impor Barang), PEB (Pemberitahuan Ekspor Barang), Bill of Lading (B/L), dan Packing List.
Container Log History: Pelacakan tipe penanganan kontainer secara spesifik:
FCL (Full Container Load): Tracking satu kontainer penuh dari shipper ke consignee.
LCL (Less Container Load): Manajemen konsolidasi barang dari beberapa pelanggan ke dalam satu kontainer, termasuk proses stripping (bongkar) di gudang penimbunan.
PLP (Pindah Lokasi Penimbunan): Pengurusan administrasi dan tracking perpindahan kontainer dari lini 1 pelabuhan ke gudang berikat/gudang sendiri.
C. EMKL & Multimodal Transportation Module
Mengelola armada darat (truk) dan integrasi manifes laut/udara.
Fleet & Driver Management: Database truk (milik sendiri atau sub-kon), masa berlaku STNK/KEIR, dan manajemen driver.
Order Delivery & Dispatching: Pembuatan Surat Jalan, penugasan driver, dan penentuan rute penjemputan kontainer dari depo/pelabuhan.
Digital Proof of Delivery (e-POD): Sisi kurir/driver dapat mengunggah foto barang saat diterima/diserahkan melalui portal frontend yang dioptimalkan untuk mobile.
D. Billing, Invoicing, & Quotation
Multi-Component Quotation: Pembuatan penawaran harga otomatis yang mencakup komponen: biaya PPJK, sewa gudang, trucking, handling THC (Terminal Handling Charges), dan freight.
Automated Invoicing: Sistem otomatis menerbitkan tagihan begitu status pekerjaan selesai (e.g., setelah status e-POD sukses atau nota dokumen jalur hijau keluar).
4. Key API & Integration Points (Laravel Focus)
Sebagai backend engine, API Laravel harus menyediakan:
Integrasi Kepabeanan (Opsional Future Phase): Kesiapan struktur data untuk integrasi via API/Web Services dengan sistem INSW / CEISA Bea Cukai.
Tracking Kontainer Pihak Ketiga: Integrasi dengan API pelayaran komersial untuk real-time container tracking berdasarkan nomor B/L atau nomor kontainer.
Notification Engine: Integrasi WhatsApp API / Email OTP untuk notifikasi otomatis ke pelanggan saat kontainer masuk status PLP atau barang telah keluar gudang.
5. Non-Functional Requirements & Security
Audit Trail / Activity Log: Setiap perubahan status kontainer (misal: perubahan dari FCL ke proses stripping LCL) wajib mencatat timestamp dan ID operator.
Data Isolation: Data antar-pelanggan di Customer Portal harus terisolasi secara ketat (Multi-tenancy secara logis di level query database).
Performance: Endpoint pencarian log kontainer wajib dioptimalkan menggunakan indexing database pada kolom container_number, bl_number, dan job_order_id.
6. Next Steps & Development Roadmap
Phase 1: Database Schema Design & Core API (Fokus pada ERD relasi antara Job Order, Kontainer, Gudang, dan Dokumen PPJK).
Phase 2: Backend WMS & EMKL Implementation (Pembuatan logika bisnis inbound/outbound dan manajemen armada di Laravel).
Phase 3: Frontend Admin & Customer Portal (Pembangunan UI menggunakan Next.js dengan komponen tabel yang kaya fitur untuk memantau ratusan log kontainer sekaligus).
Phase 4: Testing & Deployment (Uji coba integrasi alur kerja dari barang masuk pelabuhan hingga masuk ke gudang sewa).

