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
| 🟠 **High**     | 2      | Dibutuhkan segera    |
| 🟡 **Medium**   | 2      | Nice to have         |
| ✅ **Resolved** | 0      | Sudah diperbaiki     |

---

# 🔴 CRITICAL ISSUES

Issue yang **memblokir fitur utama**. Prioritas tertinggi.

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
