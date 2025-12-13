# 📋 Log Isu Backend & Feature Requests

Dokumen ini berisi daftar kendala teknis (bugs) dan permintaan fitur untuk Tim Backend, diurutkan berdasarkan **Prioritas Eksekusi**.

---

## 🟥 PRIORITAS 1: CRITICAL (Wajib Segera Diperbaiki)

### 1.1. [Bug] Role "USER" Tidak Ada di Database (BLOCKING REGISTRASI)

- **Komponen**: Registrasi / `auth_controller.go`
- **Masalah**: Endpoint `POST /register` error "Transaction failed" karena query `SELECT * FROM roles WHERE name = 'USER'` return 0 rows.
- **Log Error**:
  ```
  SELECT * FROM "roles" WHERE name = 'USER' ORDER BY "roles"."id" LIMIT 1
  [rows:0] record not found
  ```
- **Efek**: User baru TIDAK BISA mendaftar sama sekali.
- **Saran Perbaikan**: Jalankan seed atau insert manual:
  ```sql
  INSERT INTO roles (name, created_at, updated_at)
  VALUES ('USER', NOW(), NOW());
  ```

### 1.2. [Bug] Status Toko Tidak Tersimpan (Persistence)

- **Komponen**: Management Toko / `store_controller.go`
- **Masalah**: Saat Admin update toko (`PUT /admin/store`), field `is_active` selalu terset menjadi `true` (Aktif) karena di-hardcode di backend, mengabaikan input Frontend.
- **Efek**: Admin tidak bisa menonaktifkan toko.
- **Saran Perbaikan**: Hapus baris manual `input.IsActive = true` di fungsi `UpdateStore`.

### 1.3. [Feature Request] Dynamic Sort Top Produk

- **Komponen**: Dashboard Iklan / `dashboard_iklan_controller.go`
- **Kebutuhan**: User ingin bisa mengurutkan (Sort) tabel Top Produk berdasarkan header kolom (Biaya, Penjualan, ROAS).
- **Masalah**: Saat ini endpoint hardcode `LIMIT 10` acak. Frontend tidak bisa sorting akurat jika data dari DB cuma 10 sampel random.
- **Action Item**: Tambahkan parameter `sort_by` (enum: `cost`, `sales`, `roas`) dan `order` (`asc`, `desc`) pada endpoint `top-product`.

### 1.4. [Missing] API Upload Data Pesanan

- **Komponen**: Upload Data / `file_controller.go`
- **Masalah**: Frontend memiliki menu "Shopee Pesanan" (Orders), tapi Endpoint backend `/upload/orders` belum ada.
- **Efek**: User tidak bisa upload data detail pesanan, hanya Tinjauan, Iklan, dan Chat.
- **Action Item**: Buat endpoint `POST /admin/upload/orders/:id` dan logic parsing Excel pesanan.

---

## 🟨 PRIORITAS 2: HIGH (Dibutuhkan Segera)

### 2.1. [Missing] API CPA & AOV Iklan

- **Komponen**: Dashboard Iklan
- **Kebutuhan**: User ingin melihat metrik **CPA (Cost Per Acquisition)** dan **AOV (Average Order Value)** khusus dari iklan.
- **Masalah**: Belum ada endpoint untuk ini, dan frontend tidak punya data mentah `Total Conversions` untuk menghitungnya sendiri.
- **Action Item**: Buat endpoint `/cpa` dan `/aov-iklan` atau return field `total_conversions` di endpoint yang ada.

---

## 🟦 PRIORITAS 3: OPTIMIZATION (Fitur Tambahan & Best Practice)

### 3.1. [Feature] Backend-side Growth Comparison (All Stores)

- **Masalah**: Saat filter "Semua Toko" dipilih, Frontend melakukan loop request ke tiap toko dan menghitung rata-rata pertumbuhan (Growth) secara manual.
- **Saran**: Pindahkan logika agregasi ini ke Backend. Endpoint dashboard sebaiknya mendukung `store_id: "all"` agar kalkulasi lebih akurat dan efisien.

### 3.2. [Feature] Alternatif Auth (Google Login / Clerk)

- **Ide**: Pertimbangkan support Google OAuth login untuk kemudahan user, atau gunakan layanan seperti **Clerk** untuk menghandle seluruh flow auth.
