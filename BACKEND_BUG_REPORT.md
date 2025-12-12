# 📋 Log Isu Backend & Feature Requests

Dokumen ini berisi daftar kendala teknis (bugs) dan permintaan fitur untuk Tim Backend, diurutkan berdasarkan **Prioritas Eksekusi**.

---

## 🟥 PRIORITAS 1: CRITICAL (Wajib Segera Diperbaiki)

### 1.1. [Bug] Status Toko Tidak Tersimpan (Persistence)

- **Komponen**: Management Toko / `store_controller.go`
- **Masalah**: Saat Admin update toko (`PUT /admin/store`), field `is_active` selalu terset menjadi `true` (Aktif) karena di-hardcode di backend, mengabaikan input Frontend.
- **Efek**: Admin tidak bisa menonaktifkan toko.
- **Saran Perbaikan**: Hapus baris manual `input.IsActive = true` di fungsi `UpdateStore`.

### 1.2. [Bug/Missing] Fitur Registrasi (Register)

- **Komponen**: Authentikasi / `auth_controller.go`
- **Masalah**: Belum ada endpoint publik `/register`. Hanya ada `/login`.
- **Efek**: User baru tidak bisa mendaftar. Tombol register di frontend saat ini dinonaktifkan.
- **Action Item**: Buat endpoint `POST /register` (Payload: Name, Email, Password).

---

## 🟨 PRIORITAS 2: HIGH (Dibutuhkan Segera)

### 2.1. [Missing] API Total Pembeli Baru

- **Komponen**: Dashboard Tinjauan
- **Masalah**: Data "Total Pembeli Baru" di dashboard masih mock/dummy karena belum ada endpoint.
- **Action Item**: Buat endpoint `POST /admin/dashboard-tinjauan/total-pembeli-baru`.
- **Target Response**: `{ total: 100, percent: 5.5, trend: "Up", sparkline: [...] }`

### 2.2. [Missing] API Tren Pesanan (Monthly)

- **Komponen**: Dashboard Tinjauan / Grafik
- **Masalah**: Belum ada endpoint khusus untuk tren pesanan bulanan 2024 vs 2025.
- **Workaround Saat Ini**: Frontend mengambil data harian (`total-pesanan`) range 1 tahun, lalu menghitung total per bulan secara manual.
- **Action Item**: Buat endpoint `POST /admin/dashboard-tinjauan/tren-pesanan` yang me-return data grouped by month untuk performa lebih baik.

---

## 🟦 PRIORITAS 3: OPTIMIZATION (Fitur Tambahan & Best Practice)

### 3.1. [Feature] Backend-side Growth Comparison (All Stores)

- **Masalah**: Saat filter "Semua Toko" dipilih, Frontend melakukan loop request ke tiap toko dan menghitung rata-rata pertumbuhan (Growth) secara manual.
- **Saran**: Pindahkan logika agregasi ini ke Backend. Endpoint dashboard sebaiknya mendukung `store_id: "all"` agar kalkulasi lebih akurat dan efisien.

### 3.2. [Feature] Registrasi + Setup Toko Otomatis

- **Ide**: Gabungkan flow Register User dengan Create Data Store pertama.
- **Manfaat**: User langsung memiliki toko siap pakai setelah mendaftar.

### 3.3. [Feature] Alternatif Auth (Google Login / Clerk)

- **Ide**: Pertimbangkan support Google OAuth login untuk kemudahan user, atau gunakan layanan seperti **Clerk** untuk menghandle seluruh flow auth.
