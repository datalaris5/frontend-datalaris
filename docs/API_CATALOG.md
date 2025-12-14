# 📡 API Catalog - Datalaris

> **Tujuan:** Dokumentasi SEMUA endpoint yang tersedia dan komponen UI yang menggunakannya.  
> **Maintainer:** Tim Frontend  
> **Last Updated:** 2024-12-15  
> ✅ **Aman di-push ke GitHub** (tidak ada secrets)

> [!NOTE] > **Related Documents:**
>
> - [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Standar & aturan frontend
> - [BACKEND_ISSUES.md](./BACKEND_ISSUES.md) - Bug reports & feature requests
> - [TERMINAL_GUIDE.md](./TERMINAL_GUIDE.md) - Panduan terminal command

---

## 📋 Ringkasan

| Area                 | Jumlah Endpoint | Status |
| -------------------- | --------------- | ------ |
| **🔓 Public**        | 2               | ✅     |
| **👤 User App**      | 36              | ✅     |
| **🔧 Admin Console** | 6               | ✅     |
| **Total**            | **44**          |        |

---

# 🔓 PUBLIC ENDPOINTS

Tidak butuh authentication.

| Method | Endpoint    | Frontend Service      | Komponen UI                         |
| ------ | ----------- | --------------------- | ----------------------------------- |
| POST   | `/login`    | `api.auth.login()`    | `Auth/Login.tsx` → Form Login       |
| POST   | `/register` | `api.auth.register()` | `Auth/Register.tsx` → Form Register |

---

# 👤 USER APP ENDPOINTS

Endpoint yang digunakan oleh aplikasi utama (dashboard user).

## Header & Global Filter

| Method | Endpoint                  | Frontend Service        | Komponen UI                             |
| ------ | ------------------------- | ----------------------- | --------------------------------------- |
| POST   | `/admin/store/page`       | `api.store.getAll()`    | **Header** → Dropdown "Pilih Toko"      |
| GET    | `/admin/marketplaces/lov` | `api.marketplace.lov()` | **FilterContext** → Marketplace mapping |

---

## Dashboard Overview

**Halaman:** `pages/Dashboard/Overview/index.tsx`

### Metric Cards (6 cards)

| Method | Endpoint                                     | Frontend Service                  | Card Title                          |
| ------ | -------------------------------------------- | --------------------------------- | ----------------------------------- |
| POST   | `/admin/dashboard-tinjauan/total-penjualan`  | `api.dashboard.totalPenjualan()`  | 💰 **Total Penjualan** + Sparkline  |
| POST   | `/admin/dashboard-tinjauan/total-pesanan`    | `api.dashboard.totalPesanan()`    | 🛒 **Total Pesanan** + Sparkline    |
| POST   | `/admin/dashboard-tinjauan/total-pengunjung` | `api.dashboard.totalPengunjung()` | 👥 **Total Pengunjung** + Sparkline |
| POST   | `/admin/dashboard-tinjauan/convertion-rate`  | `api.dashboard.conversionRate()`  | 🎯 **Convertion Rate** + Sparkline  |
| POST   | `/admin/dashboard-tinjauan/basket-size`      | `api.dashboard.basketSize()`      | 🧺 **Basket Size** + Sparkline      |
| -      | -                                            | -                                 | 📦 **Produk Terjual** (Dummy)       |

### Charts

| Method | Endpoint                                          | Frontend Service                     | Chart                                               |
| ------ | ------------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| POST   | `/admin/dashboard-tinjauan/tren-penjualan`        | `api.dashboard.trenPenjualan()`      | 📈 **AreaChart "Analisa Tren"** - Monthly/Quarterly |
| POST   | `/admin/dashboard-tinjauan/total-pesanan/in-week` | `api.dashboard.totalPesananInWeek()` | 📊 **BarChart "Analisa Operasional"** - Per Hari    |

---

## Dashboard Ads (Iklan)

**Halaman:** `pages/Dashboard/Ads/index.tsx`

### Metric Cards (6 cards)

| Method | Endpoint                                 | Frontend Service           | Card Title                           |
| ------ | ---------------------------------------- | -------------------------- | ------------------------------------ |
| POST   | `/admin/dashboard-iklan/penjualan-iklan` | `api.ads.penjualan()`      | 💵 **Total Penjualan** + Sparkline   |
| POST   | `/admin/dashboard-iklan/biaya-iklan`     | `api.ads.biaya()`          | 💸 **Total Biaya Iklan** + Sparkline |
| POST   | `/admin/dashboard-iklan/roas`            | `api.ads.roas()`           | 📈 **ROAS** + Sparkline              |
| POST   | `/admin/dashboard-iklan/dilihat`         | `api.ads.impressions()`    | 👁️ **Total Dilihat** + Sparkline     |
| POST   | `/admin/dashboard-iklan/presentase-klik` | `api.ads.ctr()`            | 🖱️ **Persentase Klik (CTR)**         |
| POST   | `/admin/dashboard-iklan/convertion-rate` | `api.ads.conversionRate()` | 🎯 **Convertion Rate** (Dummy)       |

### Charts & Tables

| Method | Endpoint                                     | Frontend Service              | Komponen                                |
| ------ | -------------------------------------------- | ----------------------------- | --------------------------------------- |
| POST   | `/admin/dashboard-iklan/penjualan-dan-biaya` | `api.ads.penjualanDanBiaya()` | 📊 **ComposedChart** - Sales vs Cost    |
| POST   | `/admin/dashboard-iklan/total-roas`          | `api.ads.totalRoas()`         | 📈 **AreaChart** - Trend ROAS Monthly   |
| POST   | `/admin/dashboard-iklan/top-product`         | `api.ads.topProduct()`        | 📋 **Table "Top 10 Produk"** - Sortable |

---

## Dashboard Chat

**Halaman:** `pages/Dashboard/Chat/index.tsx`

### Metric Cards (6 cards)

| Method | Endpoint                                | Frontend Service            | Card Title                         |
| ------ | --------------------------------------- | --------------------------- | ---------------------------------- |
| POST   | `/admin/dashboard-chat/jumlah-chat`     | `api.chat.jumlahChat()`     | 💬 **Jumlah Chat** + Sparkline     |
| POST   | `/admin/dashboard-chat/chat-dibalas`    | `api.chat.chatDibalas()`    | ✅ **Chat Dibalas** + Sparkline    |
| POST   | `/admin/dashboard-chat/persentase-chat` | `api.chat.persentaseChat()` | 📊 **% Chat Dibalas** + Sparkline  |
| POST   | `/admin/dashboard-chat/total-pembeli`   | `api.chat.totalPembeli()`   | 🛍️ **Total Pembeli** + Sparkline   |
| POST   | `/admin/dashboard-chat/penjualan`       | `api.chat.penjualan()`      | 💰 **Est. Penjualan** + Sparkline  |
| POST   | `/admin/dashboard-chat/convertion-rate` | `api.chat.conversionRate()` | 🎯 **Convertion Rate** + Sparkline |

### Charts (Highlight Card)

| Method | Endpoint                                         | Frontend Service                  | Komponen                                              |
| ------ | ------------------------------------------------ | --------------------------------- | ----------------------------------------------------- |
| POST   | `/admin/dashboard-chat/avg-waktu-respon`         | `api.chat.avgWaktuRespon()`       | ⏱️ **Highlight Card "Rata-rata Waktu Respon"**        |
| POST   | `/admin/dashboard-chat/total-jumlah-chat`        | `api.chat.totalJumlahChat()`      | 📈 **AreaChart "Trend Volume Chat"** - Monthly        |
| POST   | `/admin/dashboard-chat/avg-waktu-respon/in-week` | `api.chat.avgWaktuResponInWeek()` | 📊 **BarChart "Response Time"** - Per Hari + KPI Line |

---

## Upload Data

**Halaman:** `pages/Data/Upload.tsx`

| Method | Endpoint                     | Frontend Service              | Komponen UI                                       |
| ------ | ---------------------------- | ----------------------------- | ------------------------------------------------- |
| POST   | `/admin/upload/tinjauan/:id` | `api.upload.uploadTinjauan()` | 📤 **FileUpload "Shopee Tinjauan"** → Drag & Drop |
| POST   | `/admin/upload/iklan/:id`    | `api.upload.uploadIklan()`    | 📤 **FileUpload "Shopee Iklan"** → Drag & Drop    |
| POST   | `/admin/upload/chat/:id`     | `api.upload.uploadChat()`     | 📤 **FileUpload "Shopee Chat"** → Drag & Drop     |
| GET    | `/admin/history-data-upload` | `api.upload.getHistory()`     | 📋 **Table "Riwayat Upload"**                     |

---

## Store Management (User)

**Halaman:** `pages/Store/Management/index.tsx`

| Method | Endpoint            | Frontend Service     | Komponen UI                                    |
| ------ | ------------------- | -------------------- | ---------------------------------------------- |
| POST   | `/admin/store/page` | `api.store.getAll()` | 🏪 **Store Card Grid** - List toko             |
| POST   | `/admin/store`      | `api.store.create()` | ➕ **Dialog "Hubungkan Toko"** → Button Submit |
| PUT    | `/admin/store`      | `api.store.update()` | ✏️ **Dialog "Edit Toko"** → Button Simpan      |
| DELETE | `/admin/store/:id`  | `api.store.delete()` | 🗑️ **Button "Hapus"** pada Store Card          |

---

# 🔧 ADMIN CONSOLE ENDPOINTS

Endpoint khusus untuk Admin Console (`/admin-console/*`).

## Admin Store Management

**Halaman:** `pages/Admin/StoreManagement.tsx`

| Method | Endpoint                          | Frontend Service     | Komponen UI                                      |
| ------ | --------------------------------- | -------------------- | ------------------------------------------------ |
| POST   | `/admin/store/page`               | `api.store.list()`   | 🏪 **Store Card Grid** + Pagination              |
| DELETE | `/admin/store/:id`                | `api.store.delete()` | 🗑️ **Button "Delete"** pada Card                 |
| POST   | `/admin/store/:id/status/:status` | `api.store.status()` | 🔘 **Badge "Active/Inactive"** → Click to toggle |

## Admin Marketplace Management

**Halaman:** Belum ada UI

| Method | Endpoint                                 | Frontend Service           | Status   |
| ------ | ---------------------------------------- | -------------------------- | -------- |
| POST   | `/admin/marketplaces`                    | `api.marketplace.create()` | ⚪ No UI |
| PUT    | `/admin/marketplaces`                    | `api.marketplace.update()` | ⚪ No UI |
| GET    | `/admin/marketplaces/:id`                | `api.marketplace.get()`    | ⚪ No UI |
| POST   | `/admin/marketplaces/page`               | `api.marketplace.list()`   | ⚪ No UI |
| DELETE | `/admin/marketplaces/:id`                | `api.marketplace.delete()` | ⚪ No UI |
| POST   | `/admin/marketplaces/:id/status/:status` | `api.marketplace.status()` | ⚪ No UI |

## Admin LOV (Dropdowns)

| Method | Endpoint                  | Frontend Service        | Dipakai Oleh  |
| ------ | ------------------------- | ----------------------- | ------------- |
| GET    | `/admin/store/lov`        | `api.store.lov()`       | (Reserved)    |
| GET    | `/admin/marketplaces/lov` | `api.marketplace.lov()` | FilterContext |

---

# 🔄 Changelog

| Tanggal    | Perubahan                                    |
| ---------- | -------------------------------------------- |
| 2024-12-15 | Pindah ke folder /docs, lengkapi Chat Charts |
| 2024-12-15 | Rename BACKEND_BUG_REPORT ke BACKEND_ISSUES  |
| 2024-12-15 | Reorganisasi: User App vs Admin Console      |
| 2024-12-15 | Detail komponen UI ditambahkan               |
| 2024-12-15 | Store & Marketplace CRUD tersedia            |
| 2024-12-15 | Katalog API dibuat                           |

---

> **📌 KONTEKS DOKUMEN INI:**
>
> - ✅ Daftar endpoint yang SUDAH ADA di backend
> - ✅ Mapping ke komponen UI frontend
> - ✅ Status integrasi (terintegrasi / belum ada UI)
>
> **❌ BUKAN untuk:**
>
> - Bug reports → gunakan [BACKEND_ISSUES.md](./BACKEND_ISSUES.md)
> - Feature requests → gunakan [BACKEND_ISSUES.md](./BACKEND_ISSUES.md)
> - API yang belum dibuat backend → gunakan [BACKEND_ISSUES.md](./BACKEND_ISSUES.md)
