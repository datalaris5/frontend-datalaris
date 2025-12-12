# Datalaris - Frontend Guide

**Status:** ✅ 100% Ready (Production Grade UI)

## 📂 Struktur Folder

```
frontend/src/
├── components/     # Reusable UI components
│   ├── common/     # Buttons, Inputs, Cards
│   └── layout/     # AdminLayout, DashboardLayout
├── context/        # React Context (Auth, Theme, Filter)
├── pages/          # Page components
│   ├── admin/      # Admin Console pages (Dashboard, Users, Stores)
│   └── ...         # User Dashboard pages
├── services/       # API integration (api.js)
└── App.jsx         # Main routing configuration
```

## 🔌 Koneksi Backend

Semua request ke backend terpusat di `src/services/api.js`.

### API Service Structure

- **`api.auth`**: Login/Register
- **`api.stores`**: Store management
- **`api.upload`**: File upload handling
- **`api.analytics`**: Dashboard data fetching
- **`api.admin`**: Admin console operations

## 🛠️ Catatan Pengembangan

1. **Mock Data Fallback:**

   - Frontend dirancang untuk **tidak crash** jika backend belum ready.
   - Menggunakan `try-catch` block di setiap fetch.
   - Jika fetch gagal, otomatis menggunakan mock data untuk demo UI.

2. **Admin Console:**

   - Terletak di `/admin`.
   - Default route: `/admin/dashboard`.
   - Menu: Dashboard, User Management, Store Management, System Settings.

3. **Styling:**

   - Menggunakan Tailwind CSS.
   - Support Dark Mode (via `ThemeContext`).

4. **Data Aggregation (Multi-Store):**

   - **Rule:** Backend bersifat _Read-Only_ dan _Strict_ (`store_id` wajib).
   - **All Stores Logic:** Saat filter "Semua Toko" dipilih, Frontend **WAJIB** melakukan _Client-Side Aggregation_ (Fetching paralel ke semua toko aktif -> Sum Data).
   - **Forbidden:** Dilarang mengirim `store_id` kosong ke backend jika backend tidak mendukungnya.

5. **Standard Visual Dashboard:**

   - **Metric Cards:**
     - Menggunakan komponen `MetricCard` dengan struktur: Icon Header (Kiri) + Main Value (Tengah) + Footer (Trend & Sparkline).
     - **Gradient Theme:** Setiap kartu memiliki tema warna unik (Blue, Orange, Purple, etc).
     - **Sparkline:** Wajib `ResponsiveContainer > AreaChart/LineChart`. Jika data kosong, tampilkan garis lurus (dummy `0`).
     - **Animation:** Value menggunakan `CountUp` (duration 2s).
   - **Charts:**
     - Library: `recharts`.
     - **Tooltip:** Style wajib `white/dark` responsive.
     - **Grid:** `strokeDasharray="3 3"` opacity 0.1.
     - **XAxis/YAxis:** Font size `10px`, warna `muted-foreground`.
   - **Page Header:**
     - Kiri: Title (H1 Bold) + Subtitle (Gray text).
     - Kanan: Action Button (e.g., "Upload Data").

6. **Standard Fungsi Dashboard:**

   - **Upload Data:**
     - Mapping Tipe: Overview (`/tinjauan`), Ads (`/iklan`), Chat (`/chat`).
     - Logic: `UploadService.js` menghandle FormData dan Store ID.
   - **Data Aggregation (Frontend Side):**
     - Saat filter `store="all"`, dashboard **tidak boleh** request ke backend dengan ID kosong.
     - **Wajib:** Loop semua `stores`, request parallel (`Promise.all`), lalu sum/average manual di client.
     - **Exception:** Grafik Trend & Top Products boleh dikosongkan/disembunyikan saat mode "All Stores" jika terlalu kompleks.

7. **Handling "Segera Hadir":**
   - Gunakan komponen `<FeatureNotReady>` wrapper.
   - Jangan hapus kodingan, cukup bungkus agar UI tetap rapi tapi tidak bisa diklik.

---

_Gunakan dokumen ini sebagai acuan pengembangan dan maintenance frontend._
