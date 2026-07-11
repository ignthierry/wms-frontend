# Product Requirement Document (PRD) – Everwin WMS (LCL Operations)

## 1. Project Overview
Membangun sistem *Warehouse Management System* (WMS) yang dikhususkan untuk operasional **Less than Container Load (LCL)**. Sistem ini akan mendigitalisasi alur kerja dari penerimaan barang (Inbound), penempatan (Storage), hingga pengeluaran barang (Outbound), lengkap dengan perhitungan otomatis tagihan (*Automated Billing*) dan portal pelacakan eksternal bagi *Customer*.

### Tech Stack Architecture
- **Backend**: Laravel (RESTful API)
- **Frontend**: Next.js (Dashboard Admin & External Tracking Portal)
- **Database**: MySQL / PostgreSQL

---

## 2. Struktur Data Utama (Data Hierarchy)

Alur operasional LCL berpusat pada relasi hierarkis berikut:

1. **Master EMKL (Forwarding)**: Bertindak sebagai pengelola utama manifes.
2. **Master Consignee**: Satu Forwarding dapat menaungi satu atau beberapa Consignee (pemilik barang sesungguhnya).
3. **Manifest (Container Level / Header)**: 
   - Atribut: *Master BL, No Container, Size Type, Voyage, Forwarding, Tanggal Stripping, Jumlah Pos, No Segel, Trucking, Nopol.*
4. **Detail POS (Item Level)**:
   - Atribut: *Host BL, Consignee, Jenis Barang, Jumlah, Kemasan/Satuan, Berat, Volume, Kondisi, Keterangan.*
5. **Koli / Barang (Barcode Level)**: Barang fisik aktual yang dipecah dari Detail POS dan diberikan label *barcode* unik untuk *Quality Control* (QC) dan pelacakan.

---

## 3. Workflow & Fitur Inti (Core Features)

### A. Proses Inbound (Barang Masuk)
1. **Penerimaan Dokumen Manifes**: Customer datang membawa dokumen manifes ke Admin Gudang.
2. **Data Entry (Admin)**: 
   - Admin memasukkan data manifes (Header) dan data Pos (Detail).
3. **Barcode Generation**: Setelah data Pos tersimpan, sistem secara otomatis menghasilkan *barcode* unik untuk setiap barang/koli.
4. **Quality Control (Tallyman)**: 
   - Tallyman mencetak *barcode*.
   - Melakukan pengecekan fisik barang, mencocokkannya dengan dokumen manifes.
   - Menempelkan *barcode* pada setiap koli barang.
   - Mengambil foto sebagai bukti kondisi barang (*Photo Proof*).
5. **Penempatan / Put-away (Tallyman)**: 
   - Barang fisik dimasukkan ke stok gudang.
   - Tallyman bebas menentukan lokasi blok (tanpa *auto-routing* dari sistem).
   - Tallyman melakukan *scan barcode* dan memperbarui/mengisi data lokasi blok penyimpanan ke dalam sistem.

### B. Proses Outbound (Barang Keluar) & Billing
1. **Permintaan Pengeluaran**: Customer datang membawa referensi manifes.
2. **Automated Billing (Admin)**: 
   - Admin membuka menu *Invoice* dan memilih manifes yang akan dikeluarkan dari daftar stok (Inventory).
   - Sistem akan **menghitung biaya otomatis** (Biaya *Storage* dan *Handling*) berdasarkan tarif per kapasitas (CBM/Tonase maksimal) dikalikan dengan lama waktu penyimpanan (hari).
3. **Penerbitan Surat Jalan (Admin)**: Setelah *Invoice* terbit dan diselesaikan, Admin mencetak Surat Jalan / *Delivery Note*.
4. **Pengambilan Barang (Tallyman)**: Tallyman mengambil barang fisik dari lokasi blok berdasarkan Surat Jalan.
5. **Final Outbound**: Barang dikeluarkan dari gudang.

### C. Portal Eksternal (Customer Tracking)
Sebuah portal *web public* yang dioptimalkan untuk Forwarding dan Consignee:
1. **Real-time Tracking**: Pelacakan menggunakan nomor *Master BL*, *Host BL*, atau *Nomor Kontainer*.
2. **Position & Condition Monitoring**: 
   - Customer dapat melihat secara langsung lokasi blok tempat barang disimpan.
   - Customer dapat melihat bukti foto (QC / Penyimpanan).
3. **Billing Transparency**: Pengecekan rincian estimasi atau realisasi biaya *Storage* dan *Handling*.

---

## 4. User Personas & Roles

- **Admin Gudang**: Mengelola input dokumen manifes, menerbitkan *Invoice*, dan mencetak Surat Jalan.
- **Tallyman (Checker)**: Eksekutor lapangan yang melakukan QC fisik, menempel *barcode*, menentukan lokasi penyimpanan, mengunggah foto, dan mengambil barang.
- **Master EMKL (Forwarding)**: *Customer* tingkat atas yang membawa kontainer dan manifes konsolidasi ke gudang.
- **Consignee**: Pemilik barang spesifik di dalam kontainer yang dapat melacak barangnya melalui portal publik.

---

## 5. Non-Functional Requirements & Aturan Khusus

1. **Barcode System**: *Barcode* dicetak per koli fisik untuk memastikan tingkat ketelitian (*granularity*) maksimal saat QC dan *Put-away*.
2. **Fleksibilitas Penempatan**: WMS *tidak* membatasi lokasi. Tallyman memiliki otoritas penuh menentukan blok letak barang secara aktual di lapangan dan cukup meng-update sistem.
3. **Perhitungan Billing**: Harus mendukung logika penentuan tarif berdasarkan *nilai maksimal antara Berat (Tonase) atau Volume (CBM)*. 
4. **Data Isolation (Portal Eksternal)**: Pencarian dengan *Host BL* hanya memunculkan data Consignee spesifik. Pencarian dengan *Master BL / Container* memunculkan ringkasan keseluruhan Forwarding.
