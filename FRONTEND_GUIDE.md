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

8. **Standard Chart Tooltips & Logic:**
   - **Component:** `src/components/common/ChartTooltip.jsx`
     - **Generic:** Gunakan untuk SEMUA chart.
     - **Fitur:** Otomatis mendeteksi format (Rupiah/Angka/Persen) dan Growth Badge.
     - **Growth Logic:** Mencari field `${dataKey}Growth` secara dinamis.
       - _Contoh:_ Data `sales` -> mencari `salesGrowth`.
   - **Helper Logic:** `src/utils/chartUtils.js`
     - Gunakan `calculateMoMGrowth(data, keys)` untuk menghitung growth otomatis.
     - Gunakan `calculateBasketSize(sales, orders)` untuk hitungan akurat.
     - Gunakan `aggregateByQuarter(monthlyData)` untuk view kuartalan dengan QoQ growth.
     - Gunakan `aggregateByDayOfWeek(dailyData)` untuk analisis per hari (rata-rata).
   - **Rich Tooltip (Hidden Series):**
     - Jika ingin menampilkan data tambahan di tooltip (misal Basket Size) tapi tidak mau digambar di grafik:
       - Tambahkan `<Area dataKey="basketSize" stroke="transparent" fill="transparent" />`.
       - Data akan masuk ke payload tooltip dan otomatis ter-render.
   - **Growth Indicators:**
     - **Januari/Awal:** Wajib `null` (Hidden).
     - **Stagnan:** Wajib `0` (Neutral Badge).
     - **Naik/Turun:** Hijau/Merah Badge.

---

9. **Centralized Chart Theme:**
   - **File:** `src/config/chartTheme.js`
   - **Wajib digunakan** untuk semua chart colors, bukan hardcoded.
   - **Exports:**
     | Export | Fungsi |
     |--------|--------|
     | `chartColors` | Warna chart (primary, secondary, tertiary) |
     | `chartUI` | Grid, cursor, axis styles |
     | `chartGradients` | Gradient definitions untuk Area charts |
     | `areaStyles` | Style preset untuk Area chart |
     | `barStyles` | Style preset untuk Bar chart |
   - **Contoh Penggunaan:**

     ```jsx
     import { chartColors, chartUI, chartGradients } from "@/config/chartTheme";

     <Area stroke={chartColors.primary} fill="url(#colorSales)" />
     <Tooltip cursor={{ stroke: chartUI.cursor.stroke }} />
     ```

---

10. **Centralized Tooltip Styles (CSS Utilities):**
    - **File:** `src/index.css` (dalam `@layer utilities`)
    - **Container:**
      | Class | Fungsi |
      |-------|--------|
      | `glass-tooltip` | Container utama tooltip (glass effect, blur, shadow) |
      | `glass-tooltip-card` | Card biasa di dalam tooltip |
      | `glass-tooltip-card-highlight` | Card dengan highlight primary color |
    - **Typography:**
      | Class | Fungsi |
      |-------|--------|
      | `tooltip-label` | Label kecil uppercase (PERIODE, HARI) |
      | `tooltip-value` | Nilai besar (nama bulan/hari) |
      | `tooltip-metric-label` | Label metric (Total Penjualan) |
      | `tooltip-metric-value` | Nilai metric (Rp 45.000.000) |
    - **Growth Badges:**
      | Class | Fungsi |
      |-------|--------|
      | `badge-growth` | Base badge style |
      | `badge-growth-positive` | Warna hijau (↑) |
      | `badge-growth-negative` | Warna merah (↓) |
      | `badge-growth-neutral` | Warna abu (•) |

---

11. **Chart Tooltip Types:**
    - **`type="auto"`** (Default)
      - Untuk time-series charts (Sales, Orders trend).
      - Menampilkan growth badges.
      - Header: "Periode" + bulan/kuartal.
    - **`type="dayOfWeek"`**
      - Untuk kategori (Day of Week Analysis).
      - TIDAK menampilkan growth (tidak relevan).
      - Header: "Hari" + nama hari.
      - Stats: Rata-rata, Total, Sample.
    - **Contoh:**
      ```jsx
      <Tooltip content={<ChartTooltip type="auto" />} />
      <Tooltip content={<ChartTooltip type="dayOfWeek" />} />
      ```

---

12. **Dashboard Overview Chart Standards:**
    - **Chart Tren (Kiri - 2/3 width):**
      - Tipe: `AreaChart`
      - Data: Bulanan (default) atau Kuartalan (toggle)
      - Warna: `chartColors.primary` (orange)
      - Tooltip: `type="auto"` dengan growth
    - **Chart Operasional (Kanan - 1/3 width):**
      - Tipe: `BarChart`
      - Data: Rata-rata pesanan per hari (mengikuti filter tanggal)
      - Warna: `chartColors.secondary` (blue)
      - Tooltip: `type="dayOfWeek"` tanpa growth

---

_Gunakan dokumen ini sebagai acuan pengembangan dan maintenance frontend._
