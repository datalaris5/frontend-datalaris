# 📘 Frontend Guide - Datalaris

> **Tujuan:** Sumber kebenaran untuk standar, aturan, dan konvensi frontend.  
> **Maintainer:** Tim Frontend  
> **Last Updated:** 2024-12-15

> [!NOTE] > **Related Documents:**
>
> - [API_CATALOG.md](./API_CATALOG.md) - Daftar endpoint & UI mapping
> - [BACKEND_ISSUES.md](./BACKEND_ISSUES.md) - Bug reports & feature requests
> - [TERMINAL_GUIDE.md](./TERMINAL_GUIDE.md) - Panduan terminal command

**Status:** ✅ 100% TypeScript Migration Complete

---

## 📋 Daftar Isi

1. [Tech Stack](#-tech-stack)
2. [React Query & Data Fetching](#-react-query--data-fetching)
3. [Struktur Folder](#-struktur-folder)
4. [Aturan Terpusat (WAJIB!)](#-aturan-terpusat-wajib)
5. [Styling & Design System](#-styling--design-system)
6. [TypeScript Standards](#-typescript-standards)
7. [API & Backend Connection](#-api--backend-connection)
8. [Environment Variables](#-environment-variables)
9. [Deployment](#-deployment)
10. [Dashboard Standards](#-dashboard-standards)
11. [Data Filtering Standards](#-data-filtering-standards)
12. [Dokumentasi & Komentar](#-dokumentasi--komentar)
13. [Scope Protection Rules](#-scope-protection-rules-wajib-untuk-ai)
14. [AI Communication Protocol](#-ai-communication-protocol)
15. [Document Update Strategy](#-document-update-strategy)
16. [Workflow Commands](#-workflow-commands)
17. [Changelog](#-changelog)

---

## 🛠️ Tech Stack

| Kategori           | Teknologi               | Versi    | Catatan              |
| ------------------ | ----------------------- | -------- | -------------------- |
| **Framework**      | React                   | 19.x     | Dengan Hooks         |
| **Language**       | TypeScript              | 5.x      | Strict mode enabled  |
| **Build Tool**     | Vite                    | 7.x      | Fast HMR             |
| **Styling**        | Tailwind CSS            | 3.x      | + Custom utilities   |
| **UI Components**  | shadcn/ui               | Latest   | Di `components/ui/`  |
| **Icons**          | Lucide React            | Latest   | WAJIB pakai ini      |
| **Charts**         | Recharts                | 2.x      | + Custom theme       |
| **Routing**        | React Router DOM        | 7.x      | v7 data APIs         |
| **HTTP Client**    | Axios                   | 1.x      | Instance terpusat    |
| **Data Fetching**  | TanStack React Query    | 5.x      | Auto caching + retry |
| **Forms**          | React Hook Form + Zod   | Latest   | Validasi schema      |
| **State**          | React Context + Zustand | Built-in | Auth, Filter, Theme  |
| **Notifications**  | React Hot Toast         | 2.x      | Toast notifications  |
| **Utilities**      | Lodash                  | 4.x      | Data aggregation     |
| **Virtualization** | TanStack Virtual        | 3.x      | For large tables     |

---

## ⚡ React Query & Data Fetching

### Overview

**TanStack React Query** digunakan untuk semua data fetching di dashboard untuk mendapatkan:

- ✅ Auto caching (5 menit stale time)
- ✅ Auto retry on error (1x)
- ✅ Background refetch saat window focus
- ✅ Loading & error states otomatis
- ✅ DevTools untuk debugging

### Setup

**QueryClient** sudah dikonfigurasi di `src/lib/queryClient.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache 5 menit
      gcTime: 10 * 60 * 1000, // Keep cache 10 menit
      retry: 1, // Retry 1x on error
      refetchOnWindowFocus: true, // Refetch saat focus
      refetchOnReconnect: true, // Refetch saat reconnect
    },
  },
});
```

**App wrapped** di `src/main.tsx`:

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>;
```

### Helper Functions

**File: `utils/dashboardHelpers.ts`**

Reusable helpers untuk semua dashboard:

| Function              | Purpose                        | Usage                                         |
| --------------------- | ------------------------------ | --------------------------------------------- |
| `getTargetStores()`   | Filter stores (single/all)     | `getTargetStores(store, stores)`              |
| `formatDateRange()`   | Format date untuk API          | `formatDateRange(dateRange)`                  |
| `buildPayload()`      | Build API payload              | `buildPayload(storeId, marketplaceId, dates)` |
| `extractMetricData()` | Parse API response             | `extractMetricData(response)`                 |
| `mergeSparklines()`   | Merge sparklines (multi-store) | `mergeSparklines(arrays)`                     |
| `aggregateMetrics()`  | Aggregate multi-store data     | `aggregateMetrics(results)`                   |

**File: `utils/formatters.ts`**

Currency dan number formatters:

| Function                | Purpose       | Example Output |
| ----------------------- | ------------- | -------------- |
| `formatCurrency()`      | Format Rupiah | "Rp 1.500.000" |
| `formatShortCurrency()` | Kort format   | "Rp1.5jt"      |
| `formatNumber()`        | Format angka  | "1.500.000"    |
| `formatPercent()`       | Format persen | "15.0%"        |

### Custom Hooks Pattern

**Struktur hook untuk dashboard metrics:**

```typescript
// hooks/useDashboardMetrics.ts
import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import {
  getTargetStores,
  formatDateRange,
  buildPayload,
  extractMetricData,
  aggregateMetrics,
} from "@/utils/dashboardHelpers";

export function useDashboardMetrics() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "overview", "metrics", store, dateRange],
    queryFn: async () => {
      const targetStores = getTargetStores(store, stores);
      if (!targetStores.length) return null;

      const dates = formatDateRange(dateRange);
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreMetrics(s.id!, s.marketplace_id!, dates)
        )
      );

      return results.length === 1 ? results[0] : aggregateMetrics(results);
    },
    enabled: !!dateRange?.startDate && stores.length > 0,
  });
}
```

**Usage di component:**

```typescript
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const DashboardOverview = () => {
  // Hook handles everything: fetching, caching, loading, error
  const { data: metricsData, isLoading, error } = useDashboardMetrics();

  // Update metrics state dari hook data
  useEffect(() => {
    if (!metricsData) return;
    setMetrics((prev) => {
      // Update logic here
    });
  }, [metricsData]);
};
```

### Dashboard Migration Status

| Dashboard               | Hooks Created                     | Migration Status | Code Reduction |
| ----------------------- | --------------------------------- | ---------------- | -------------- |
| **Overview (Tinjauan)** | ✅ Metrics + Charts               | ✅ Complete      | -340 baris     |
| **Ads (Iklan)**         | ✅ useAdsDashboardMetrics (ready) | ⏳ Pending       | ~300 baris     |
| **Chat**                | ⏳ To create                      | ⏳ Pending       | ~300 baris     |
| **Orders**              | ⏳ To create                      | ⏳ Pending       | ~200 baris     |
| **Products**            | ⏳ To create                      | ⏳ Pending       | ~150 baris     |

**Overview Details:**

- Hooks: `useDashboardMetrics.ts`, `useOverviewChartData.ts`, `useOperationalChartData.ts`
- Error handling: Toast notifications
- Loading states: Skeleton components
- Code: 853 → ~470 lines (45% reduction)
- Status: Production-ready ✅

### Migration Guide untuk Dashboard Lain

**Pattern yang sudah proven (dari Overview):**

1. **Create custom hook** (`hooks/useXDashboardMetrics.ts`)

   - Copy pattern dari `useDashboardMetrics.ts` atau `useAdsDashboardMetrics.ts`
   - Update API calls untuk dashboard tersebut
   - Use helpers: `getTargetStores`, `formatDateRange`, `buildPayload`, etc.

2. **Remove local code**

   - Delete local `MetricCard` component (~150 baris)
   - Delete local `formatCurrency` helper (use from `utils/formatters.ts`)
   - Delete local `mergeSparklines` helper (use from `utils/dashboardHelpers.ts`)
   - Delete manual fetch `useEffect` logic (~150-200 baris)

3. **Integrate shared components**

   - Import `MetricCard` dari `@/components/dashboard`
   - Import hook: `import { useXDashboardMetrics } from '@/hooks/useXDashboardMetrics'`
   - Use hook: `const { data, isLoading } = useXDashboardMetrics()`

4. **Test**
   - Single store works
   - Multi-store ("Semua Toko") aggregation works
   - Date filter works
   - Check DevTools for caching

**Expected impact per dashboard:** ~200-300 baris code reduction

### DevTools Usage

Di development mode, tekan **React Query DevTools** icon untuk:

- View all cached queries
- See query status (fresh/stale/fetching)
- Manual refetch
- Inspect query data
- Debug performance issues

### Common Pitfalls

❌ **Query key tidak include dateRange:**

```typescript
queryKey: ["dashboard", store]; // WRONG!
```

✅ **Correct:**

```typescript
queryKey: ["dashboard", "overview", "metrics", store, dateRange];
```

❌ **Missing enabled condition:**

```typescript
useQuery({ queryKey, queryFn }); // Runs even without data!
```

✅ **Correct:**

```typescript
useQuery({
  queryKey,
  queryFn,
  enabled: !!dateRange?.startDate && stores.length > 0,
});
```

---

### Best Practice Improvements

**Dashboard Overview sudah mengimplementasikan semua best practices:**

1. **Error Toast Notifications**

   - Error state dari React Query hook
   - Toast notification untuk user feedback
   - Auto dismiss setelah 4 detik

   ```typescript
   useEffect(() => {
     if (metricsError) {
       toast.error("Gagal memuat data metrik. Silakan coba lagi.");
     }
   }, [metricsError]);
   ```

2. **Skeleton Loading**

   - MetricCardSkeleton component
   - Loading state shows dashboard structure
   - Better UX than spinner

   ```tsx
   {metricsLoading ? (
     Array.from({ length: 6 }).map((_, i) => (
       <MetricCardSkeleton key={i} highlight={i < 2} />
     ))
   ) : (
     metrics.map(metric => <MetricCard ... />)
   )}
   ```

3. **Complete Hook Integration**
   - `useDashboardMetrics` untuk metrics
   - `useOverviewChartData` untuk charts
   - NO manual fetch logic remaining
   - 100% centralized pattern

**Impact:** 853 → 513 lines (-340 baris, 40% reduction!)

---

## 📂 Struktur Folder

```
frontend/
├── docs/                   # 📄 Dokumentasi
│   ├── FRONTEND_GUIDE.md
│   ├── API_CATALOG.md
│   ├── BACKEND_ISSUES.md
│   └── TERMINAL_GUIDE.md
├── .env                    # Environment variables (❌ JANGAN commit)
├── .env.example            # Template (✅ boleh commit)
├── vercel.json             # Deploy config Vercel
├── netlify.toml            # Deploy config Netlify
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
├── dist/                   # Build output (untuk deploy)
│
└── src/
    ├── components/
    │   ├── common/         # ChartTooltip, Icons, ProtectedRoute, etc.
    │   ├── layout/         # AdminLayout, DashboardLayout, Header, Sidebar
    │   └── ui/             # shadcn/ui (Button, Card, Dialog, etc.)
    │
    ├── config/
    │   └── chartTheme.ts   # 🔴 WAJIB dipakai untuk chart colors
    │
    ├── constants/
    │   └── menuItems.ts    # Navigation menu config
    │
    ├── context/
    │   ├── AuthContext.tsx     # Authentication state
    │   ├── FilterContext.tsx   # Global filter (date, store, platform)
    │   └── ThemeContext.tsx    # Theme (light/dark/system)
    │
    ├── pages/              # Halaman aplikasi
    │   ├── Admin/          # Admin Console
    │   ├── Auth/           # Login, Register
    │   ├── Dashboard/      # Overview, Orders, Products, Chat, Ads
    │   ├── Data/           # Upload
    │   ├── Settings/       # Account
    │   ├── Store/          # Management
    │   └── Subscription/   # Plans, Payment
    │
    ├── services/
    │   ├── api.ts              # Main API aggregator
    │   ├── axios.ts            # Axios instance + interceptors
    │   ├── AuthService.ts
    │   ├── DashboardService.ts
    │   ├── AdsService.ts
    │   ├── ChatService.ts
    │   ├── StoreService.ts
    │   ├── MarketplaceService.ts
    │   └── UploadService.ts
    │
    ├── hooks/
    │   └── useDebounce.ts      # Debounce hook
    │
    ├── types/
    │   └── api/                # Response type definitions
    │       ├── store.types.ts
    │       └── marketplace.types.ts
    │
    ├── utils/
    │   └── chartUtils.ts       # Chart calculation helpers
    │
    ├── lib/
    │   └── utils.ts            # cn() function
    │
    ├── App.tsx                 # Routing
    ├── main.tsx                # Entry point
    └── index.css               # 🔴 WAJIB dipakai untuk utility classes
```

---

## 🚨 Aturan Terpusat (WAJIB!)

### ❌ DILARANG KERAS

| Pelanggaran                 | Alasan                                   |
| --------------------------- | ---------------------------------------- |
| Hardcode warna di JSX       | Gunakan CSS variables atau utility class |
| Hardcode chart colors       | Gunakan `chartTheme.ts`                  |
| Buat icon sendiri           | Gunakan Lucide React                     |
| Buat UI component dari 0    | Cek `components/ui/` dulu (shadcn)       |
| File `.js` atau `.jsx` baru | WAJIB TypeScript (`.ts`, `.tsx`)         |
| Hardcode API URL            | Gunakan `import.meta.env.VITE_API_URL`   |

### ✅ WAJIB PAKAI (Centralized Sources)

| Kebutuhan             | File/Lokasi                | Contoh                                |
| --------------------- | -------------------------- | ------------------------------------- |
| **Glass Effect**      | `index.css`                | `.glass-card`, `.glass-bar`           |
| **Tooltip Chart**     | `index.css`                | `.glass-tooltip`, `.tooltip-label`    |
| **Growth Badge**      | `index.css`                | `.badge-growth-positive`              |
| **Background**        | `index.css`                | `.mesh-gradient`                      |
| **Chart Colors**      | `config/chartTheme.ts`     | `chartColors.primary`                 |
| **Chart Styles**      | `config/chartTheme.ts`     | `areaStyles.primary`                  |
| **Icon Size/Stroke**  | `config/dashboardIcons.ts` | `ICON_SIZES.sm`, `ICON_STROKE_WIDTH`  |
| **Icon Mapping**      | `config/dashboardIcons.ts` | `overviewIcons.totalSales`            |
| **Semantic Colors**   | `config/themeConfig.ts`    | `semanticColors.positive`             |
| **Trend Badge Style** | `config/themeConfig.ts`    | `trendBadgeStyles.up.className`       |
| **Status Themes**     | `config/themeConfig.ts`    | `statusThemes.positive`               |
| **Icons**             | `lucide-react`             | `<Store size={20} />`                 |
| **UI Components**     | `components/ui/`           | `<Button>`, `<Card>`                  |
| **Class Merging**     | `lib/utils.ts`             | `cn("class1", condition && "class2")` |

### D. INTEGRASI API DASHBOARD (WAJIB)

Saat memanggil endpoint Dashboard (`/admin/dashboard-tinjauan/*`), **WAJIB** mengirimkan `marketplace_id` dalam payload.
Backend membutuhkannya untuk menentukan tabel mana yang akan di-query.

**Contoh Payload yang Benar:**

```typescript
{
  store_id: 1,
  marketplace_id: 1, // REQUIRED! Ambil dari store.marketplace_id
  date_from: "2025-01-01",
  date_to: "2025-01-31"
}
```

### 🚨 ATURAN KETAT: SENTRALISASI KODING (WAJIB!)

> [!CAUTION] > **DILARANG KERAS** menulis kode hardcoded di halaman/komponen jika sudah ada config terpusat!

#### Prinsip Utama

1. **Config dulu, pakai kemudian** - Jika butuh value (warna, size, style), cek dulu apakah sudah ada di config files
2. **Jangan duplikat** - Jika value dipakai di >1 tempat, WAJIB pindah ke config terpusat
3. **Konsistensi** - Semua komponen sejenis HARUS pakai config yang sama

#### Config Files yang Tersedia

| File                        | Isi                                                         | Contoh Penggunaan                                                       |
| --------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| `config/dashboardIcons.ts`  | Icon mapping, size, strokeWidth                             | `ICON_SIZES.sm`, `ICON_STROKE_WIDTH`                                    |
| `config/themeConfig.ts`     | Semantic colors, status themes, trend styles                | `trendBadgeStyles.up.className`                                         |
| `config/chartTheme.ts`      | Chart colors, gradients, styles, **layout**, **typography** | `chartColors.primary`, `chartLayout.large`, `chartTypography.axisLabel` |
| `config/animationConfig.ts` | Centralized framer-motion variants                          | `fadeInUpVariants`, `staggerContainer`                                  |
| `index.css`                 | Utility classes, animations                                 | `.glass-card-premium`                                                   |

#### Contoh Benar vs Salah

```tsx
// ❌ SALAH - Hardcode values
<Icon size={14} strokeWidth={2} />
<span className="bg-emerald-500/10 text-emerald-600">↑</span>

// ✅ BENAR - Pakai config terpusat
import { ICON_SIZES, ICON_STROKE_WIDTH } from "@/config/dashboardIcons";
import { trendBadgeStyles } from "@/config/themeConfig";

<Icon size={ICON_SIZES.sm} strokeWidth={ICON_STROKE_WIDTH} />
<span className={trendBadgeStyles.up.className}>{trendBadgeStyles.up.arrow}</span>
```

#### Kapan Menambah Config Baru

- Jika value dipakai di **≥2 tempat** → WAJIB pindah ke config
- Jika value mungkin berubah (warna, size) → WAJIB di config
- Jika value bagian dari **design system** → WAJIB di config

---

## 🎨 Styling & Design System

### iOS Glassmorphism (Wajib untuk Container)

```tsx
// ✅ BENAR - Pakai utility class
<div className="glass-card p-6">...</div>
<header className="glass-bar border-b">...</header>

// ❌ SALAH - Hardcode manual & Opaque Colors
<div className="bg-white/70 backdrop-blur-xl border...">...</div>
<div className="bg-indigo-50 ...">...</div> <!-- ❌ Opaque in light mode (menutup efek kaca) -->

// ✅ BENAR - True Glass (Alpha Channels)
// Gunakan warna level 500 dengan opacity rendah (10-25%)
// agar efek blur tetap terlihat dan menyatu di Light Mode & Dark Mode
<div className="bg-indigo-500/25 backdrop-blur-md">...</div>
```

### Utility Classes Tersedia (`index.css`)

| Class                | Fungsi                           |
| -------------------- | -------------------------------- |
| `.glass-card`        | Card dengan efek glass standar   |
| `.glass-card-strong` | Card dengan blur lebih kuat      |
| `.glass-bar`         | Header/Sidebar (tanpa rounded)   |
| `.glass-tooltip`     | Container tooltip chart          |
| `.mesh-gradient`     | Background gradient mesh         |
| `.brand-gradient`    | Gradient brand (orange → red)    |
| `.brand-icon-soft`   | Background soft untuk icon brand |
| `.animate-fade-in`   | Animasi fade in standar          |

### Chart Theme (`config/chartTheme.ts`)

```tsx
import { chartColors, areaStyles, chartUI } from "@/config/chartTheme";

// Warna
<Area stroke={chartColors.primary} fill="url(#primaryGradient)" />

// Style preset
<Area {...areaStyles.primary} />

// Grid
<CartesianGrid strokeDasharray={chartUI.grid.strokeDasharray} />
```

#### Chart Layout Presets (`chartLayout`)

Gunakan preset layout yang sesuai dengan ukuran chart:

| Preset       | Untuk Chart             | Margin       | Y-Axis Width | ContentPadding   |
| ------------ | ----------------------- | ------------ | ------------ | ---------------- |
| `large`      | Chart utama (2/3 width) | `20/20/0/30` | `45px`       | `pt-4 pb-6 px-6` |
| `compact`    | Chart kecil/stacked     | `10/15/0/20` | `35px`       | `pt-4 pb-6 px-6` |
| `horizontal` | Horizontal bar chart    | `5/30/20/5`  | `40px`       | `pt-2 pb-4 px-4` |

```tsx
import { chartLayout, chartTypography } from "@/config/chartTheme";

// Untuk chart besar (Analisa Tren)
<AreaChart margin={chartLayout.large.margin}>
  <YAxis width={chartLayout.large.yAxisWidth} tick={chartTypography.axisLabel} />
</AreaChart>

// Untuk chart compact (Analisa Operasional)
<BarChart margin={chartLayout.compact.margin}>
  <YAxis width={chartLayout.compact.yAxisWidth} tick={chartTypography.axisLabel} />
</BarChart>
```

#### Chart Typography (`chartTypography`)

| Preset         | Untuk             | Contoh Class                                             |
| -------------- | ----------------- | -------------------------------------------------------- |
| `titleLarge`   | Title chart besar | `text-lg font-bold`                                      |
| `titleCompact` | Title chart kecil | `text-base font-bold`                                    |
| `subtitle`     | Subtitle chart    | `text-sm text-muted-foreground`                          |
| `axisLabel`    | Label sumbu X/Y   | `{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }` |

#### Chart Header Icons (`chartHeaderIcons`)

| Preset    | Size  | Color          | Usage                                           |
| --------- | ----- | -------------- | ----------------------------------------------- |
| `large`   | `w-5` | `text-primary` | `<Icon className={chartHeaderIcons.large} />`   |
| `compact` | `w-4` | `text-primary` | `<Icon className={chartHeaderIcons.compact} />` |

### Tailwind Color Variables (Design Tokens)

Gunakan semantic colors dari `index.css`:

```css
/* Light & Dark mode otomatis */
--primary: orange
--secondary: gray
--muted-foreground: gray text
--destructive: red
```

```tsx
// ✅ BENAR - Pakai semantic token
<p className="text-muted-foreground">...</p>
<button className="bg-primary text-primary-foreground">...</button>

// ❌ SALAH - Hardcode warna
<p className="text-gray-500">...</p>
```

---

## 📘 TypeScript Standards

### Aturan Umum

- **Semua file baru WAJIB TypeScript** (`.ts`, `.tsx`)
- **DILARANG** membuat file `.js` atau `.jsx` baru
- Minimal penggunaan `any`, gunakan `unknown` jika tipe tidak diketahui
- Semua props, state, dan return values harus punya tipe

### Naming Conventions

| Jenis      | Format              | Contoh                    |
| ---------- | ------------------- | ------------------------- |
| Interface  | PascalCase          | `UserData`, `ApiResponse` |
| Type alias | PascalCase          | `Platform`, `StoreId`     |
| Type file  | kebab-case.types.ts | `auth.types.ts`           |
| Component  | PascalCase.tsx      | `MetricCard.tsx`          |
| Hook       | camelCase.ts        | `useAuth.ts`              |
| Utility    | camelCase.ts        | `formatCurrency.ts`       |

### Struktur Type Definitions

```
src/types/
└── api/
    ├── auth.types.ts       # LoginRequest, User, etc.
    ├── dashboard.types.ts  # DashboardData, ChartData
    ├── store.types.ts      # Store, StoreResponse
    └── ads.types.ts        # AdsData, AdsMetrics
```

---

## 🔌 API & Backend Connection

### Service Structure

| Service           | File                    | Endpoint Group                |
| ----------------- | ----------------------- | ----------------------------- |
| `api.auth`        | `AuthService.ts`        | `/login`, `/register`         |
| `api.store`       | `StoreService.ts`       | `/admin/store/*`              |
| `api.marketplace` | `MarketplaceService.ts` | `/admin/marketplaces/*`       |
| `api.dashboard`   | `DashboardService.ts`   | `/admin/dashboard-tinjauan/*` |
| `api.ads`         | `AdsService.ts`         | `/admin/dashboard-iklan/*`    |
| `api.chat`        | `ChatService.ts`        | `/admin/dashboard-chat/*`     |
| `api.upload`      | `UploadService.ts`      | `/admin/upload/*`             |

> **📌 CATATAN:** Untuk daftar lengkap semua endpoint, lihat [API_CATALOG.md](./API_CATALOG.md)

### API Update Protocol (WAJIB!)

Setiap ada perubahan API (endpoint baru, perubahan struktur, dll), AI **WAJIB**:

1. ✅ Update `API_CATALOG.md` dengan endpoint baru/perubahan
2. ✅ Update `BACKEND_ISSUES.md` jika ada issue/missing API
3. ✅ Update Service file yang terkait (`*Service.ts`)
4. ✅ Cek semua halaman yang menggunakan service tersebut

### Data Aggregation Rule (Multi-Store)

Saat filter "Semua Toko" dipilih:

1. **WAJIB** request parallel ke semua toko (`Promise.all`)
2. **WAJIB** sum/average data di frontend
3. **DILARANG** kirim `store_id` kosong ke backend

```tsx
// ✅ BENAR
const results = await Promise.all(
  stores.map((store) => api.analytics.getOverview(store.id, dateRange))
);
const aggregated = aggregateData(results);

// ❌ SALAH
api.analytics.getOverview("", dateRange); // Backend akan error
```

---

## 🔐 Environment Variables

### File Configuration

| File           | Fungsi             | Git              |
| -------------- | ------------------ | ---------------- |
| `.env`         | Konfigurasi aktual | ❌ JANGAN commit |
| `.env.example` | Template           | ✅ Boleh commit  |

### Variabel

```env
VITE_API_URL=http://localhost:8080/datalaris/v1/api
```

### Penggunaan

```typescript
// Di axios.ts - sudah ada fallback
const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/datalaris/v1/api";
```

---

## 🚀 Deployment

### Platform Configs

| File           | Platform |
| -------------- | -------- |
| `vercel.json`  | Vercel   |
| `netlify.toml` | Netlify  |

### Workflow

1. Update `.env` dengan URL backend production
2. `npm run build`
3. Upload folder `/dist`

### SPA Routing

Semua URL redirect ke `/index.html` (sudah dikonfigurasi di platform files).

---

## 📊 Dashboard Standards

### Metric Cards

- Gunakan struktur: Icon (kiri) + Value (tengah) + Footer (trend)
- Animasi value dengan `CountUp`
- Sparkline dengan `ResponsiveContainer > AreaChart`
- **Skeleton:** Gunakan `<MetricCardSkeleton />` saat loading

### Smart Insight Banner (`InsightBanner.tsx`)

- **Philosophy**: Komponen ini bertindak sebagai **"Konsultan Bisnis AI"**, bukan sekadar pelapor data statis. Memberikan saran aksi berdasarkan korelasi data.
- **Logic**: Menggunakan `generateSmartInsight` (`utils/insightUtils.ts`) untuk mendeteksi pola seperti "Traffic Waste" (Traffic naik, CR turun) atau "Efficiency" (Sales stabil, CR naik).
- **Visuals**:
  - **True Glassmorphism (WAJIB)**: Gunakan semantic alpha colors (`bg-indigo-500/25` Light / `bg-indigo-900/30` Dark) agar backdrop blur terlihat. **DILARANG** menggunakan solid `bg-indigo-50`.
  - **Balanced**: Icon indikator di kiri, pesan utama di tengah, dan badge data sekunder (e.g. "Puncak Order") di kanan.
- **Terminology**: Gunakan bahasa bisnis yang profesional dan menenangkan (e.g. "Koreksi Wajar" bukan "Penjualan Turun", "Puncak Order" bukan "Hari Rame").

### Charts

- **Wajib** import dari `@/config/chartTheme`
- **Tooltip:** Gunakan `<ChartTooltip />` dari `common/`
- **Grid:** `strokeDasharray="3 3"` opacity rendah (0.05)
- **Stroke:** `strokeWidth={2.5}`
- **Skeleton:** Gunakan `<ChartSkeleton />` saat loading

### Empty State (Chart)

Gunakan `<ChartEmptyState />` dari `@/components/dashboard` saat data kosong.

**Komponen:** `components/dashboard/ChartEmptyState.tsx`

**Props:**

| Prop      | Type         | Default                                        | Keterangan             |
| --------- | ------------ | ---------------------------------------------- | ---------------------- |
| `icon`    | `LucideIcon` | `BarChart3`                                    | Icon dari lucide-react |
| `title`   | `string`     | "Data Belum Tersedia"                          | Judul pesan            |
| `message` | `string`     | "Upload data untuk melihat visualisasi chart." | Deskripsi              |

**Aturan UX Consistency (WAJIB):**

| Aspek       | Pattern                       | Contoh                                   |
| ----------- | ----------------------------- | ---------------------------------------- |
| **Title**   | "Data [Nama] Belum Tersedia"  | "Data Tren Belum Tersedia"               |
| **Message** | "Upload data untuk [fungsi]." | "Upload data untuk melihat grafik tren." |
| **Icon**    | Sesuai konteks chart          | BarChart3, Calendar                      |

**Contoh Penggunaan:**

```tsx
import { ChartEmptyState } from "@/components/dashboard";
import { Calendar } from "lucide-react";

// Default (menggunakan BarChart3 icon)
<ChartEmptyState
  title="Data Tren Belum Tersedia"
  message="Upload data untuk melihat grafik tren."
/>

// Custom icon (untuk konteks waktu/kalender)
<ChartEmptyState
  icon={Calendar}
  title="Data YoY Belum Tersedia"
  message="Upload data tahun sebelumnya untuk perbandingan."
/>
```

**Design Principles:**

- ✅ **Horizontal Layout:** Icon kiri, teks kanan (compact)
- ✅ **Muted Colors:** Icon `text-muted-foreground/50`, text `text-muted-foreground/70`
- ✅ **No Button:** Tidak ada tombol (sudah ada Upload di header)
- ✅ **Consistency:** Semua empty state menggunakan pattern yang sama

### Animations

- **Library:** Framer Motion
- **Config:** Import variants dari `@/config/animationConfig`
- **Pattern:** Staggered entry (kontainer) + Fade Up (item)

### Page Header

- Kiri: Title (H1) + Subtitle
- Kanan: Action Button (Upload, etc.)

### Feature Not Ready

Gunakan wrapper `<FeatureNotReady>` untuk fitur yang belum siap.

---

## 🗓️ Data Filtering Standards

### Lokasi Filter

- **Local Context**: Filter tanggal WAJIB berada di halaman dashboard masing-masing (`src/pages/Dashboard/*/index.tsx`), bukan di Header global.
- **Position**: Sejajar dengan Page Title atau Action Buttons di area Header halaman.
- **Why**: Memberikan konteks yang lebih jelas dan kontrol granular per dashboard.

### Date Picker Component

- **Component**: Gunakan `<DateRangePicker />` dari `src/components/common/`.
- **Behavior Standard**:
  - **Auto-Apply**: Popover menutup dan filter aktif otomatis saat tanggal akhir dipilih (mengurangi klik).
  - **Sticky Preferences**: Menyimpan pilihan preset terakhir (e.g. "30 Hari Terakhir") di `localStorage` agar user tidak perlu atur ulang saat refresh.
  - **Linked Calendars**: Navigasi kalender ganda TERKUNCI berurutan (Bulan X dan Bulan X+1) untuk mencegah duplikasi tampilan bulan.
  - **Presets**: Wajib sediakan preset analitik ("Hari Ini", "Kemarin", "7 Hari", "30 Hari", "Bulan Ini", "Bulan Lalu").

### Styling Rules

- **Compact Size**: Gunakan tinggi `h-10` (bukan `h-12`) untuk button trigger agar seimbang dengan element header lainnya.
- **Semantic Colors (WAJIB)**:
  - **DILARANG** menggunakan hardcoded color (e.g. `bg-orange-500`).
  - **GUNAKAN** semantic tokens:
    - Background: `bg-primary` atau `bg-primary/10`
    - Text: `text-primary` atau `text-primary-foreground`
    - Border/Ring: `border-primary` atau `ring-primary/20`

---

## 📝 Dokumentasi & Komentar

### Bahasa

- **Komentar:** Bahasa Indonesia
- **Variable/Function names:** English

### Header File (WAJIB)

```typescript
/**
 * NamaKomponen
 * ------------
 * Deskripsi singkat.
 *
 * Props:
 * - propA: Penjelasan
 */
```

### JSDoc untuk Utility Functions

```typescript
/**
 * Menghitung pertumbuhan Month-over-Month
 * @param data - Array data bulanan
 * @param keys - Field yang dihitung (e.g., ['sales', 'orders'])
 * @returns Data dengan field *Growth untuk setiap key
 */
export function calculateMoMGrowth(data: ChartData[], keys: string[]) {...}
```

---

## 🛡️ Scope Protection Rules (WAJIB untuk AI)

Aturan untuk mencegah AI merubah hal di luar scope permintaan.

### Definisi Perintah

| Perintah             | Yang BOLEH Diubah                 | Yang DILARANG                    |
| -------------------- | --------------------------------- | -------------------------------- |
| **Refactor**         | Struktur kode, naming, split file | Teks UI, label, metric, layout   |
| **Polish UI**        | Styling, spacing, animasi         | Logic, data, teks konten         |
| **Perbaiki styling** | CSS/class saja                    | Komponen JSX, logic              |
| **Integrasi API**    | Service, API call, types          | Teks label, layout existing      |
| **Debug/Fix**        | Perbaiki bug spesifik             | Fitur lain yang tidak bermasalah |

### Checklist Sebelum Edit (AI WAJIB Ikuti)

Sebelum mengedit file, AI harus jawab:

1. ✅ Apakah perubahan ini sesuai dengan **scope perintah**?
2. ✅ Apakah saya akan **mengubah teks/label**? → TANYA DULU
3. ✅ Apakah saya akan **mengubah logic/metric**? → TANYA DULU
4. ✅ Apakah saya akan **mengubah layout**? → TANYA DULU
5. ✅ Apakah file ini **di luar scope**? → JANGAN SENTUH

### Aturan Wajib

- **DILARANG** mengubah teks, label, atau kalimat tanpa diminta
- **DILARANG** mengubah metric/indikator tanpa diminta
- **DILARANG** mengubah layout tanpa diminta
- **DILARANG** menyentuh file yang tidak relevan dengan perintah
- **WAJIB** tanya dulu jika ragu apakah perubahan dalam scope

### Contoh Kesalahan yang Harus Dihindari

```
❌ SALAH:
User: "Refactor kode di MetricCard"
AI: (mengubah label "Total Penjualan" jadi "Revenue")

✅ BENAR:
User: "Refactor kode di MetricCard"
AI: (hanya perbaiki struktur, naming tanpa ubah teks apapun)
```

---

## 🗣️ AI Communication Protocol

Aturan komunikasi AI dengan user untuk memastikan keselarasan.

### Kapan AI WAJIB Bertanya

- Perintah **ambigu** atau bisa diinterpretasi berbeda
- Scope tidak jelas (file mana? komponen mana?)
- Perubahan berpotensi **merusak fitur existing**
- Menggunakan istilah teknis yang mungkin user tidak familiar

### Format Klarifikasi

```
🤔 **Klarifikasi Sebelum Eksekusi**

Saya memahami perintah sebagai: [interpretasi AI]

Pertanyaan:
1. [Pertanyaan spesifik]
2. [Pertanyaan lain jika ada]

Analisa saya:
- Jika opsi A: [dampak]
- Jika opsi B: [alternatif]

Silakan konfirmasi sebelum saya lanjutkan.
```

### Tujuan

- Membantu user **mengembangkan aplikasi tanpa sentuh kode**
- Membantu user **belajar koding** melalui penjelasan
- Mencegah **kesalahan akibat miskomunikasi**

---

## 📄 Document Update Strategy

Strategi update 3 dokumen utama (API_CATALOG, BACKEND_ISSUES, FRONTEND_GUIDE).

### Prinsip: Efisien & Tidak Mengganggu

| Strategi             | Penjelasan                                   |
| -------------------- | -------------------------------------------- |
| **🔇 Silent Update** | Update **tanpa notify** kecuali significant  |
| **📦 Batch Update**  | Kumpulkan perubahan, update di akhir session |
| **🎯 Trigger-Based** | Update **HANYA** jika ada trigger spesifik   |

### Trigger untuk Update

| Dokumen          | Kapan Update                          | Kapan TIDAK Update           |
| ---------------- | ------------------------------------- | ---------------------------- |
| `API_CATALOG`    | Integrasi API baru, endpoint berubah  | Task styling, refactor kecil |
| `BACKEND_ISSUES` | Bug backend ditemukan, issue resolved | Bug frontend, fix typo       |
| `FRONTEND_GUIDE` | Aturan/standar berubah, service baru  | Perubahan minor              |

### Prioritas Update

1. **Immediate** - Bug critical, breaking change
2. **End of Task** - Setelah task selesai, batch update
3. **Skip** - Task kecil yang tidak relevan

---

## 🔄 Workflow Commands

Ketik command di chat, lalu jelaskan kebutuhan spesifik.

### Daftar Command

| Command              | Fungsi                          | Contoh Penggunaan                   |
| -------------------- | ------------------------------- | ----------------------------------- |
| `/buat-fitur`        | Bikin halaman/fitur baru        | _"Saya mau bikin halaman laporan"_  |
| `/debug-error`       | Debug error yang membingungkan  | _"Ada error di halaman login"_      |
| `/polish`            | Refactor UI dan logic           | _"Polish file ini"_                 |
| `/integrasi-api`     | Integrasi endpoint backend baru | _"Integrasikan endpoint /products"_ |
| `/deploy`            | Deploy ke production            | _"Deploy ke Vercel"_                |
| `/audit-komentar`    | Audit komentar dan dokumentasi  | _"Audit folder pages"_              |
| `/tambah-chart`      | Bikin chart/visualisasi baru    | _"Visualisasi penjualan vs biaya"_  |
| `/optimasi-performa` | Optimasi performa aplikasi      | _"Halaman overview lambat"_         |
| `/pre-commit`        | Cek sebelum commit/push/merge   | _"Cek sebelum saya commit"_         |

### Lokasi File

Semua workflow tersimpan di: `.agent/workflows/`

---

## 📜 Changelog

| Tanggal    | Perubahan                                                   |
| ---------- | ----------------------------------------------------------- |
| 2024-12-17 | React Query integration guide & Dashboard migration status  |
| 2024-12-16 | Aturan ketat sentralisasi koding ditambahkan                |
| 2024-12-16 | Config files ditambahkan: dashboardIcons.ts, themeConfig.ts |
| 2024-12-15 | Reorganisasi docs ke folder /docs                           |
| 2024-12-15 | AI Communication Protocol & Document Update Strategy        |
| 2024-12-15 | Scope Protection Rules ditambahkan                          |
| 2024-12-15 | Format header distandardisasi                               |
| 2024-12-15 | API Catalog dibuat, API Update Protocol ditambahkan         |
| 2024-12-15 | Store & Marketplace Service terintegrasi                    |
| 2024-12-14 | Migrasi TypeScript 100% complete                            |
| 2024-12-14 | Tambah deployment configs (vercel.json, netlify.toml)       |
| 2024-12-14 | Dokumentasi aturan terpusat dan design system               |

---

> **📌 REMINDER:** Update dokumen ini setiap ada perubahan aturan atau standar!  
> **Responsible:** Developer yang melakukan perubahan.
