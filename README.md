# Datalaris - Project Overview

**Datalaris** adalah aplikasi analitik e-commerce multi-tenant yang dirancang untuk membantu pemilik toko online mengelola dan menganalisis data penjualan mereka dari berbagai platform (Shopee, TikTok Shop, Tokopedia).

## 🏗️ Arsitektur Sistem

### Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Lucide React
- **Backend:** Go (Gin Gonic), GORM
- **Database:** PostgreSQL (via Supabase)
- **Auth:** JWT (JSON Web Tokens)

### Core Features
1. **Multi-Tenant System:** Mendukung banyak user dengan data terisolasi.
2. **Data Upload:** Upload data penjualan via Excel/CSV.
3. **Analytics Dashboard:** Visualisasi performa penjualan (Revenue, Orders, Top Products).
4. **Admin Console:** Panel administrasi untuk manajemen user, toko, dan konfigurasi sistem.
5. **Store Management:** Manajemen multiple toko per user.

## 🔄 Alur Data
1. **User** upload file excel.
2. **Frontend** kirim file ke Backend API.
3. **Backend** proses file, validasi, dan simpan ke Database.
4. **Frontend** request data analytics.
5. **Backend** query database dan return JSON data.

## 🔐 Security & Schema
- **Schema Management:** Dilakukan langsung di Supabase.
- **Authentication:** Middleware JWT untuk proteksi API endpoints.
- **Role-Based Access:** User vs Admin roles.

---
*Dokumen ini adalah referensi utama untuk pemahaman level tinggi tentang proyek Datalaris.*
