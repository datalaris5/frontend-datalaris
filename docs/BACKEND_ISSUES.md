# 🔧 Backend Issues - Datalaris

> **Tujuan:** Jembatan komunikasi Frontend ↔ Backend untuk bug reports & feature requests.  
> **Maintainer:** Tim Frontend  
> **Last Updated:** 2024-12-15

> [!NOTE] > **Related Documents:**
>
> - [API_CATALOG.md](./API_CATALOG.md) - Daftar endpoint & UI mapping
> - [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Standar & aturan frontend
> - [TERMINAL_GUIDE.md](./TERMINAL_GUIDE.md) - Panduan terminal command

---

## 📊 Status Overview

| Status          | Jumlah | Keterangan           |
| --------------- | ------ | -------------------- |
| 🔴 **Critical** | 2      | Blocking fitur utama |
| 🟠 **High**     | 3      | Dibutuhkan segera    |
| 🟡 **Medium**   | 2      | Nice to have         |
| ✅ **Resolved** | 0      | Sudah diperbaiki     |

---

# 🔴 CRITICAL ISSUES

Issue yang **memblokir fitur utama**. Prioritas tertinggi.

---

## CRIT-003: Dashboard Data Shopee Hilang (Case Sensitivity)

| Field            | Detail                             |
| ---------------- | ---------------------------------- |
| **Status**       | 🔴 Open                            |
| **Komponen**     | Dashboard Tinjauan                 |
| **File Backend** | `dashboard_tinjauan_controller.go` |
| **Dilaporkan**   | 2024-12-16                         |

### 🐛 Masalah

Backend menggunakan validasi nama marketplace yang **Case Sensitive** (`== "Shopee"`).
Data di database user kadang tersimpan sebagai `"shopee"` (huruf kecil).
Akibatnya, query data di-skip dan dashboard mengembalikan 0.

### 💡 Rekomendasi Solusi

Ubah logic backend menjadi **Case Insensitive**:

```go
if strings.EqualFold(marketplace.Name, constant.ShopeeConst) { ... }
```

---

## CRIT-001: Role "USER" Tidak Ada di Database

| Field            | Detail               |
| ---------------- | -------------------- |
| **Status**       | 🔴 Open              |
| **Komponen**     | Authentication       |
| **File Backend** | `auth_controller.go` |
| **Endpoint**     | `POST /register`     |
| **Dilaporkan**   | 2024-12-13           |

### 🐛 Masalah

Saat user baru mencoba mendaftar, endpoint `/register` mengembalikan error:

```
Transaction failed: record not found
```

**Query yang gagal:**

```sql
SELECT * FROM "roles" WHERE name = 'USER' ORDER BY "roles"."id" LIMIT 1
-- Result: [rows:0]
```

### 💥 Dampak

- ❌ User baru **TIDAK BISA mendaftar** sama sekali
- ❌ Fitur registrasi completely broken

### 💡 Rekomendasi Solusi

**Opsi A: Database Seed (Recommended)**

Tambahkan seed data di migration atau startup:

```sql
INSERT INTO roles (name, created_at, updated_at)
VALUES ('USER', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
```

**Opsi B: Auto-create di Controller**

```go
// Di auth_controller.go, sebelum assign role
role, err := services.GetWhereFirst[models.Role]("name = ?", "USER")
if err != nil {
    // Create role if not exists
    role = &models.Role{Name: "USER"}
    role, _ = services.Save(role, tx)
}
```

---

## CRIT-002: Status Toko Tidak Bisa Diubah

| Field            | Detail                |
| ---------------- | --------------------- |
| **Status**       | 🔴 Open               |
| **Komponen**     | Store Management      |
| **File Backend** | `store_controller.go` |
| **Endpoint**     | `PUT /admin/store`    |
| **Dilaporkan**   | 2024-12-14            |

### 🐛 Masalah

Saat Admin meng-update toko, field `is_active` selalu di-reset ke `true`, mengabaikan input dari Frontend.

**Suspek:** Ada hardcode di backend:

```go
input.IsActive = true  // ← Ini yang harus dihapus
```

### 💥 Dampak

- ❌ Admin tidak bisa **menonaktifkan toko**
- ❌ Toggle status di UI tidak berfungsi dengan benar

### 💡 Rekomendasi Solusi

Hapus baris hardcode dan gunakan value dari request:

```go
// BEFORE (Salah)
func UpdateStore(c *gin.Context) {
    ...
    input.IsActive = true  // ❌ Remove this
    ...
}

// AFTER (Benar)
func UpdateStore(c *gin.Context) {
    ...
    // Biarkan is_active sesuai input dari frontend
    // Tidak perlu set manual
    ...
}
```

---

# 🟠 HIGH PRIORITY

Fitur penting yang dibutuhkan untuk pengalaman user yang lengkap.

---

## HIGH-001: API Upload Data Pesanan Belum Ada

| Field                   | Detail                          |
| ----------------------- | ------------------------------- |
| **Status**              | 🟠 Open                         |
| **Tipe**                | Feature Request                 |
| **Komponen**            | Upload Data                     |
| **Endpoint Dibutuhkan** | `POST /admin/upload/orders/:id` |
| **Dilaporkan**          | 2024-12-14                      |

### 📋 Kebutuhan

Frontend sudah memiliki menu **"Shopee Pesanan"** di halaman Upload, namun endpoint backend belum tersedia.

**Endpoint yang sudah ada:**

- ✅ `/admin/upload/tinjauan/:id` - Upload Tinjauan
- ✅ `/admin/upload/iklan/:id` - Upload Iklan
- ✅ `/admin/upload/chat/:id` - Upload Chat
- ❌ `/admin/upload/orders/:id` - **BELUM ADA**

### 💥 Dampak

- ❌ User tidak bisa upload data **detail pesanan**
- ❌ Analisis per-produk tidak akurat tanpa data order

### 💡 Rekomendasi Solusi

**1. Buat Controller:**

```go
// file_controller.go
func UploadExcelShopeeOrders(c *gin.Context) {
    // Similar pattern dengan UploadExcelShopeeTinjauan
    // Parse Excel dengan kolom: Order ID, Product, Qty, Price, Status, Date
}
```

**2. Register Route:**

```go
// routes.go
auth.POST("/upload/orders/:id", controllers.UploadExcelShopeeOrders)
```

**3. Expected Excel Columns:**

| Column Name  | Data Type | Required |
| ------------ | --------- | -------- |
| Order ID     | String    | ✅       |
| Product Name | String    | ✅       |
| SKU          | String    | ❌       |
| Quantity     | Integer   | ✅       |
| Price        | Decimal   | ✅       |
| Status       | String    | ✅       |
| Order Date   | DateTime  | ✅       |

---

## HIGH-002: API CPA & AOV Iklan Belum Ada

| Field                   | Detail                                                               |
| ----------------------- | -------------------------------------------------------------------- |
| **Status**              | 🟠 Open                                                              |
| **Tipe**                | Feature Request                                                      |
| **Komponen**            | Dashboard Iklan                                                      |
| **Endpoint Dibutuhkan** | `POST /admin/dashboard-iklan/cpa`, `POST /admin/dashboard-iklan/aov` |
| **Dilaporkan**          | 2024-12-14                                                           |

### 📋 Kebutuhan

User ingin melihat metrik **CPA (Cost Per Acquisition)** dan **AOV (Average Order Value)** khusus dari iklan.

**Formula:**

- **CPA** = Total Biaya Iklan / Total Konversi
- **AOV** = Total Penjualan / Total Pesanan

### 💥 Dampak

- ❌ MetricCard "CPA" dan "AOV" di Dashboard Iklan menampilkan **data dummy**
- ❌ User tidak bisa mengukur efektivitas iklan secara lengkap

### 💡 Rekomendasi Solusi

**Opsi A: Buat Endpoint Baru**

```go
func GetDashboardIklanCPA(c *gin.Context) {
    // Calculate: SUM(cost) / COUNT(conversions)
}

func GetDashboardIklanAOV(c *gin.Context) {
    // Calculate: SUM(sales) / COUNT(orders)
}
```

**Opsi B: Extend Response Existing**

Tambahkan field di response endpoint yang sudah ada:

```json
{
  "data": {
    "total": 1500000,
    "percent": 12.5,
    "total_conversions": 150,
    "total_orders": 200
  }
}
```

Dengan ini, Frontend bisa kalkulasi sendiri.

---

## HIGH-003: API Pembeli Baru Belum Ada

| Field                   | Detail                                        |
| ----------------------- | --------------------------------------------- |
| **Status**              | 🟠 Open                                       |
| **Tipe**                | Feature Request                               |
| **Komponen**            | Dashboard Tinjauan                            |
| **Endpoint Dibutuhkan** | `POST /admin/dashboard-tinjauan/pembeli-baru` |
| **Dilaporkan**          | 2024-12-16                                    |

### 📋 Kebutuhan

Frontend membutuhkan metric **"Pembeli Baru"** di Dashboard Tinjauan menggunakan field `total_pembeli_baru` yang sudah ada di database.

**Field di Database:**

```sql
-- shopee_data_upload_details table
total_pembeli_baru int
```

**Endpoint yang dibutuhkan:**

- ❌ `POST /admin/dashboard-tinjauan/pembeli-baru` - **BELUM ADA**

### 💥 Dampak

- ❌ MetricCard "Pembeli Baru" di Dashboard Tinjauan menampilkan **data dummy**
- ❌ User tidak bisa tracking pertumbuhan customer baru

### 💡 Rekomendasi Solusi

**Buat Endpoint Baru:**

```go
// dashboard_tinjauan_controller.go
func GetDashboardTinjauanPembeliBaru(c *gin.Context) {
    // Query: SUM(total_pembeli_baru) dengan filter store_id, date range
    // Return format sama dengan endpoint lain:
    // { total, percent, trend, sparkline }
}
```

**Register Route:**

```go
// routes.go
auth.POST("/admin/dashboard-tinjauan/pembeli-baru", controllers.GetDashboardTinjauanPembeliBaru)
```

**Expected Response:**

```json
{
  "data": {
    "total": 250,
    "percent": 15.5,
    "trend": "Up",
    "sparkline": [10, 15, 12, 18, 20, 25, 22]
  }
}
```

---

## HIGH-004: Data Tanggal Akhir Hilang (Last Date Missing)

| Field            | Detail                                                   |
| ---------------- | -------------------------------------------------------- |
| **Status**       | � Confirmed Bug                                          |
| **Komponen**     | Semua Dashboard Endpoint                                 |
| **File Backend** | `dashboard_tinjauan_controller.go`, `file_controller.go` |
| **Dilaporkan**   | 2024-12-19                                               |
| **Dikonfirmasi** | 2024-12-19 (Deep Investigation)                          |

### 🐛 Masalah

Saat user melakukan filter tanggal (misal: **10 Mar - 16 Mar**), data pada tanggal akhir (**16 Mar**) **SELALU HILANG**.
User mendapatkan data: **10 Mar - 15 Mar** (kurang 1 hari).

### 🔍 Deep Investigation Results

**1. Database Schema (DDL.sql):**

```sql
tanggal date  -- Kolom adalah tipe DATE, bukan TIMESTAMP
```

**2. Go Model (Mismatch):**

```go
Tanggal time.Time `gorm:"column:tanggal"`  // Go uses time.Time (includes time component)
```

**3. Data Upload Parsing (`file_controller.go`):**

```go
func parseTanggalShopee(s string) (time.Time, error) {
    // time.Parse TANPA timezone = UTC!
    return time.Parse(format, s)  // Returns 2024-03-16 00:00:00 UTC
}
```

**4. Query Execution (`dashboard_tinjauan_controller.go`):**

```go
// INKONSISTEN!
currentArgs := []interface{}{
    input.DateFrom,  // STRING "2024-03-16"
    input.DateTo,    // STRING "2024-03-16"
}
previousArgs := []interface{}{
    periodBeforeFrom,  // time.Time (Go object)
    periodBeforeTo,    // time.Time (Go object)
}
```

### 💥 Root Cause Analysis - **CONFIRMED BY USER TESTING**

**DEFINITIVE EVIDENCE:**
| Filter | Hasil Chart | Data 16 Mar |
|--------|-------------|-------------|
| 10-16 Mar | 10-15 Mar | ❌ Tidak muncul |
| 10-17 Mar | 10-16 Mar | ✅ MUNCUL! |

**→ Data 16 Mar PASTI ADA di database, tapi TIDAK dikembalikan saat jadi `dateTo`.**
**→ Query `BETWEEN` memperlakukan END DATE sebagai EXCLUSIVE (padahal seharusnya inclusive).**

**Penyebab Teknis (Kemungkinan):**

1. **Timezone Shift** - `time.Parse` Go returns UTC. Saat dikirim ke PostgreSQL dengan timezone Asia/Jakarta, ada offset yang "memundurkan" tanggal.
2. **Implicit Type Casting** - STRING `'2024-03-16'` di-cast berbeda dengan DATE stored di DB.
3. **GORM Driver Behavior** - Driver PostgreSQL Go mungkin mengirim timestamp bukan date.

### 💡 Rekomendasi Fix (Backend)

**Opsi 1: Tambah 1 Hari pada dateTo**

```go
dateTo = dateTo.AddDate(0, 0, 1)
// Query: WHERE tanggal >= ? AND tanggal < ?
```

**Opsi 2: Cast Explicit ke DATE**

```sql
WHERE tanggal BETWEEN ?::date AND ?::date
```

**Opsi 3: Gunakan time.Time konsisten (bukan STRING)**

```go
currentArgs := []interface{}{
    dateFrom,  // time.Time
    dateTo,    // time.Time
}
```

---

## HIGH-005: Field Comparison (Previous Total) Hilang dari API

| Field            | Detail                   |
| ---------------- | ------------------------ |
| **Status**       | 🟠 Open                  |
| **Komponen**     | Semua Dashboard Endpoint |
| **File Backend** | `dto/response_dto.go`    |
| **Dilaporkan**   | 2024-12-19               |

### 🐛 Masalah

Frontend tidak bisa menampilkan nilai pembanding (misal: "vs 1.500.000 bulan lalu") dengan akurat karena field tersebut **TIDAK DIKIRIM** oleh backend. Frontend terpaksa melakukan "Reverse Calculation" dari persentase, yang tidak akurat jika persentase 0%.

**Code Audit (`response_dto.go`):**
Struct `ResponseHeaderDashboardTinjauan` hanya memiliki `Total`, `Percent`, `Trend`. Tidak ada field `Previous`.

### 💥 Dampak

- ❌ Jika Percent 0% (Stable atau New Item), frontend tidak tahu nilai sebelumnya (dianggap sama dengan Current).
- ❌ Tooltip Comparison menjadi tidak informatif.

### 💡 Rekomendasi Solusi

Tambahkan field `previous_total` di struct response:

```go
type ResponseHeaderDashboardTinjauan struct {
    Total         any                 `json:"total"`
    PreviousTotal any                 `json:"previous_total"` // <--- ADD THIS
    Percent       float64             `json:"percent"`
    Trend         string              `json:"trend"`
    Sparkline     []ResponseSparkline `json:"sparkline"`
}
```

Dan populate nilainya di Controller.

---

# 🟡 MEDIUM PRIORITY

Optimasi dan improvement untuk pengalaman yang lebih baik.

---

## MED-001: Dynamic Sort untuk Top Produk

| Field          | Detail                                    |
| -------------- | ----------------------------------------- |
| **Status**     | 🟡 Open                                   |
| **Tipe**       | Enhancement                               |
| **Komponen**   | Dashboard Iklan                           |
| **Endpoint**   | `POST /admin/dashboard-iklan/top-product` |
| **Dilaporkan** | 2024-12-14                                |

### 📋 Kebutuhan

User ingin sorting tabel **Top Produk** berdasarkan kolom header (Biaya, Penjualan, ROAS).

**Current behavior:** Backend hardcode `LIMIT 10` random, Frontend tidak bisa sort akurat.

### 💡 Rekomendasi Solusi

Tambahkan query parameters:

```go
// Request
{
  "store_id": 1,
  "date_from": "2024-01-01",
  "date_to": "2024-12-31",
  "sort_by": "sales",     // enum: sales, cost, roas
  "order": "desc",        // enum: asc, desc
  "limit": 10
}
```

---

## MED-002: Backend Aggregation untuk Multi-Store

| Field          | Detail                  |
| -------------- | ----------------------- |
| **Status**     | 🟡 Open                 |
| **Tipe**       | Optimization            |
| **Komponen**   | All Dashboard Endpoints |
| **Dilaporkan** | 2024-12-14              |

### 📋 Kebutuhan

Saat user pilih filter **"Semua Toko"**, Frontend harus:

1. Loop request ke setiap toko (N requests)
2. Aggregate data di client-side

Ini **tidak efisien** dan growth calculation bisa tidak akurat.

### 💡 Rekomendasi Solusi

Support `store_id: "all"` di backend:

```go
// Jika store_id == "all", aggregate dari semua toko tenant
if storeID == "all" {
    // SELECT SUM(...) FROM ... WHERE tenant_id = ?
}
```

---

# 💭 IDEAS & SUGGESTIONS

Ide-ide untuk pengembangan masa depan.

---

## IDEA-001: OAuth Login (Google/Clerk)

Pertimbangkan implementasi **Google OAuth** atau **Clerk** untuk:

- Kemudahan registrasi/login user
- Mengurangi friction onboarding
- Security yang lebih baik (2FA built-in)

---

# 🆕 FEATURE REQUESTS

Request fitur baru yang dibutuhkan oleh Frontend.

---

## FEAT-001: Year-over-Year (YoY) Growth API

| Field            | Detail                             |
| ---------------- | ---------------------------------- |
| **Status**       | 🟡 Requested                       |
| **Komponen**     | Dashboard Tinjauan                 |
| **File Backend** | `dashboard_tinjauan_controller.go` |
| **Requested**    | 2024-12-19                         |
| **Priority**     | Medium                             |

### 📋 Deskripsi

Frontend membutuhkan API untuk menampilkan **Diverging Bar Chart** yang membandingkan performa bulan ini vs bulan yang sama di tahun lalu.

### 🔌 Endpoint Spec

**Endpoint:** `POST /admin/dashboard-tinjauan/yoy-growth`

**Request Body:**

```json
{
  "store_id": 1,
  "marketplace_id": 1,
  "year": 2024
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "current_year": 2024,
    "previous_year": 2023,
    "has_previous_year_data": true,
    "metrics": [
      {
        "month": "Jan",
        "current_value": 15000000,
        "previous_value": 12000000,
        "growth_percent": 25.0
      }
    ],
    "summary": {
      "total_current": 180000000,
      "total_previous": 150000000,
      "overall_growth_percent": 20.0
    }
  }
}
```

### 💡 Backend Query Guide

```sql
-- Current Year
SELECT TO_CHAR(tanggal, 'Mon') AS month,
       EXTRACT(MONTH FROM tanggal) AS month_num,
       COALESCE(SUM(total_penjualan), 0) AS total
FROM shopee_data_upload_details
WHERE EXTRACT(YEAR FROM tanggal) = 2024 AND store_id = ?
GROUP BY month, month_num ORDER BY month_num;

-- Previous Year (same query with year - 1)
```

### ⚠️ Edge Cases

- **No Previous Year Data:** Return `has_previous_year_data: false`
- **Division by Zero:** If previous = 0, set `growth_percent = 100`

---

# ✅ RESOLVED

Issue yang sudah diperbaiki oleh tim Backend. _Arsipkan/hapus setelah 30 hari._

| ID  | Issue                           | Resolved | Solved By | Notes |
| --- | ------------------------------- | -------- | --------- | ----- |
| -   | _Belum ada issue yang resolved_ | -        | -         | -     |

---

# 📝 Cara Menggunakan Dokumen Ini

## Untuk Tim Backend

1. Cek section **CRITICAL** terlebih dahulu
2. Lihat **Rekomendasi Solusi** sebagai referensi
3. Setelah fix, kabari Tim Frontend untuk pindahkan ke **RESOLVED**

## Untuk Tim Frontend / AI

1. Tambahkan issue baru dengan format yang konsisten
2. Sertakan **dampak** dan **rekomendasi solusi**
3. Update **Status Overview** setiap ada perubahan
4. Pindahkan resolved issue ke tabel RESOLVED (format ringkas)
5. Hapus dari tabel RESOLVED setelah 30 hari

---

> **📌 ATURAN UPDATE (WAJIB untuk AI):**
>
> Setiap kali bersinggungan dengan API, AI **WAJIB** cek dan update:
>
> - `API_CATALOG.md` → Daftar endpoint & UI mapping
> - `BACKEND_ISSUES.md` → Bug & feature requests
> - `FRONTEND_GUIDE.md` → Standar & dokumentasi
>
> **Trigger untuk update dokumen ini:**
>
> - Menemukan bug/issue saat integrasi API
> - Backend memberitahu issue sudah resolved
> - Ada kebutuhan fitur baru yang butuh backend
> - Perubahan struktur response API
