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
2. [Struktur Folder](#-struktur-folder)
3. [Aturan Terpusat (WAJIB!)](#-aturan-terpusat-wajib)
4. [Styling & Design System](#-styling--design-system)
5. [TypeScript Standards](#-typescript-standards)
6. [API & Backend Connection](#-api--backend-connection)
7. [Environment Variables](#-environment-variables)
8. [Deployment](#-deployment)
9. [Dashboard Standards](#-dashboard-standards)
10. [Dokumentasi & Komentar](#-dokumentasi--komentar)
11. [Scope Protection Rules](#-scope-protection-rules-wajib-untuk-ai)
12. [AI Communication Protocol](#-ai-communication-protocol)
13. [Document Update Strategy](#-document-update-strategy)
14. [Workflow Commands](#-workflow-commands)
15. [Changelog](#-changelog)

---

## 🛠️ Tech Stack

| Kategori          | Teknologi             | Versi    | Catatan             |
| ----------------- | --------------------- | -------- | ------------------- |
| **Framework**     | React                 | 19.x     | Dengan Hooks        |
| **Language**      | TypeScript            | 5.x      | Strict mode enabled |
| **Build Tool**    | Vite                  | 7.x      | Fast HMR            |
| **Styling**       | Tailwind CSS          | 3.x      | + Custom utilities  |
| **UI Components** | shadcn/ui             | Latest   | Di `components/ui/` |
| **Icons**         | Lucide React          | Latest   | WAJIB pakai ini     |
| **Charts**        | Recharts              | 2.x      | + Custom theme      |
| **Routing**       | React Router DOM      | 7.x      | v7 data APIs        |
| **HTTP Client**   | Axios                 | 1.x      | Instance terpusat   |
| **Forms**         | React Hook Form + Zod | Latest   | Validasi schema     |
| **State**         | React Context         | Built-in | Auth, Filter, Theme |
| **Notifications** | React Hot Toast       | 2.x      | Toast notifications |

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

| Kebutuhan         | File/Lokasi            | Contoh                                |
| ----------------- | ---------------------- | ------------------------------------- |
| **Glass Effect**  | `index.css`            | `.glass-card`, `.glass-bar`           |
| **Tooltip Chart** | `index.css`            | `.glass-tooltip`, `.tooltip-label`    |
| **Growth Badge**  | `index.css`            | `.badge-growth-positive`              |
| **Background**    | `index.css`            | `.mesh-gradient`                      |
| **Chart Colors**  | `config/chartTheme.ts` | `chartColors.primary`                 |
| **Chart Styles**  | `config/chartTheme.ts` | `areaStyles.primary`                  |
| **Icons**         | `lucide-react`         | `<Store size={20} />`                 |
| **UI Components** | `components/ui/`       | `<Button>`, `<Card>`                  |
| **Class Merging** | `lib/utils.ts`         | `cn("class1", condition && "class2")` |

---

## 🎨 Styling & Design System

### iOS Glassmorphism (Wajib untuk Container)

```tsx
// ✅ BENAR - Pakai utility class
<div className="glass-card p-6">...</div>
<header className="glass-bar border-b">...</header>

// ❌ SALAH - Hardcode manual
<div className="bg-white/70 backdrop-blur-xl border...">...</div>
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

### Charts

- **Wajib** import dari `@/config/chartTheme`
- **Tooltip:** Gunakan `<ChartTooltip />` dari `common/`
- **Grid:** `strokeDasharray="3 3"` opacity rendah

### Page Header

- Kiri: Title (H1) + Subtitle
- Kanan: Action Button (Upload, etc.)

### Feature Not Ready

Gunakan wrapper `<FeatureNotReady>` untuk fitur yang belum siap.

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

| Tanggal    | Perubahan                                             |
| ---------- | ----------------------------------------------------- |
| 2024-12-15 | Reorganisasi docs ke folder /docs                     |
| 2024-12-15 | AI Communication Protocol & Document Update Strategy  |
| 2024-12-15 | Scope Protection Rules ditambahkan                    |
| 2024-12-15 | Format header distandardisasi                         |
| 2024-12-15 | API Catalog dibuat, API Update Protocol ditambahkan   |
| 2024-12-15 | Store & Marketplace Service terintegrasi              |
| 2024-12-14 | Migrasi TypeScript 100% complete                      |
| 2024-12-14 | Tambah deployment configs (vercel.json, netlify.toml) |
| 2024-12-14 | Dokumentasi aturan terpusat dan design system         |

---

> **📌 REMINDER:** Update dokumen ini setiap ada perubahan aturan atau standar!  
> **Responsible:** Developer yang melakukan perubahan.
