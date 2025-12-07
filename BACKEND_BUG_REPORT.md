# Log Isu Backend & Komunikasi

Dokumen ini berfungsi sebagai catatan berkelanjutan mengenai masalah (bug), kendala, dan permintaan fitur yang ditemukan oleh tim Frontend namun memerlukan perbaikan di sisi Backend.

---

## [07-12-2024] Request Penghapusan Data Sampah (Residu Upload)

**Status**: 🔴 Open (Belum Selesai)
**Prioritas**: Rendah
**Komponen**: Database / Data Upload

### Deskripsi Masalah

Terdapat data duplikat/residu pada dashboard tinjauan. Hal ini disebabkan karena sebelum perbaikan integrasi Upload, semua file yang diupload masuk ke **Store ID 1** secara default.

### Dampak

Saat user memilih Toko lain (misal Toko B), data dari Toko A (yang tidak sengaja masuk ke ID 1) ikut muncul atau tertukar.

### Permintaan Tindakan (Action Items)

Mohon tim backend/DBA membantu membersihkan tabel `shopee_data_upload_details` (dan summary terkait) untuk data yang **Store ID = 1** (jika memang Store ID 1 itu adalah toko testing/default yang tidak valid) atau data yang terindikasi salah mapping.

---

## [06-12-2024] Bug Status Toko Tidak Tersimpan (Persistence)

**Status**: 🔴 Open (Belum Selesai)
**Prioritas**: Menengah
**Komponen**: Manajemen Toko / `store_controller.go`

### Deskripsi Masalah

Saat melakukan update toko melalui endpoint `PUT /admin/store`, status `is_active` yang dikirim oleh Frontend diabaikan. Akibatnya, status toko selalu kembali menjadi **Aktif** (`true`), meskipun pengguna memilih **Non-Aktif** (`false`).

### Analisis Penyebab (Root Cause)

Di dalam file `backend/controllers/store_controller.go`, pada fungsi `UpdateStore`, field `IsActive` diset secara paksa (hardcode) menjadi `true`, sehingga menimpa data yang dikirim dari Frontend.

### Rekomendasi Perbaikan

Hapus baris yang melakukan hardcode nilai `IsActive` di dalam fungsi `UpdateStore`.

```go
// backend/controllers/store_controller.go

// SEBELUMNYA (Bug):
err = services.WithTransaction(db.WithContext(c.Request.Context()), func(tx *gorm.DB) error {
    input.IsActive = true // <--- HAPUS BARIS INI
    input.TenantID = tenantID.(uint)
    // ...
})

// REKOMENDASI PERBAIKAN:
err = services.WithTransaction(db.WithContext(c.Request.Context()), func(tx *gorm.DB) error {
    // Baris input.IsActive = true dihapus agar mengikuti input dari user
    input.TenantID = tenantID.(uint)
    // ...
})
```

---

## [07-12-2024] Fitur Registrasi Belum Ada Endpoint

**Status**: 🔴 Open (Belum Selesai)
**Prioritas**: Tinggi
**Komponen**: Auth / `auth_controller.go`

### Deskripsi Masalah

Frontend memiliki halaman Registrasi User (`/register`), tetapi saat ini Backend belum menyediakan endpoint publik untuk melakukan pendaftaran user baru. Endpoint Auth yang tersedia hanya `/login`.

### Dampak

Pengguna baru tidak bisa mendaftar mandiri. Saat ini tombol registrasi di frontend dimatikan (Coming Soon) untuk mencegah kebingungan user.

### Permintaan Tindakan (Action Items)

Mohon buatkan endpoint `POST /register` yang menerima payload:

```json
{
  "name": "Nama User",
  "email": "user@example.com",
  "password": "secretpassword"
}
```

---

## [07-12-2024] Bug Isolasi Data Dashboard (Data Leakage)

**Status**: 🔴 Open (Belum Selesai)
**Prioritas**: Tinggi
**Komponen**: Dashboard / `dashboard_controller.go`

### Deskripsi Masalah

Endpoint Dashboard Tinjauan (`/admin/dashboard-tinjauan/total-penjualan` dan `/total-pesanan`) tampaknya **mengabaikan parameter `store_id`** yang dikirimkan dalam JSON Body.
Frontend sudah mengirimkan payload:

```json
{
  "date_from": "...",
  "date_to": "...",
  "store_id": 2
}
```

Namun, Backend tetap mengembalikan data milik Toko lain (misal Toko ID 1). Ini menyebabkan kebocoran data antar toko (Data Leakage).

### Permintaan Tindakan (Action Items)

Mohon periksa query database pada fungsi handler dashboard. Pastikan terdapat klausa `WHERE store_id = ?` yang menggunakan nilai dari input user. Jangan melakukan query `FindAll` tanpa filter tenant/store.

---

## [07-12-2024] Feature Request: Registrasi + Setup Toko Otomatis

**Status**: 💡 Feature Request
**Prioritas**: Menengah (UX Improvement)
**Komponen**: Auth / Onboarding

### Deskripsi

Saat ini flow registrasi hanya membuat user. Karena `Starter` plan memiliki limit 1 toko, sebaiknya proses pembuatan toko pertama digabung ke dalam flow registrasi agar user langsung siap pakai setelah login.

### Usulan Endpoint

Update endpoint `/register` untuk menerima payload tambahan:

```json
{
  "name": "Nama User",
  "email": "user@example.com",
  "password": "...",
  "store_name": "Nama Toko Pertama" // Field Baru
}
```

Backend otomatis membuat User -> Membuat Tenant/Store -> Assign User sebagai Owner Store tersebut.

---

## [07-12-2024] Feature Request: Google OAuth (Login Praktis)

**Status**: 💡 Feature Request
**Prioritas**: Rendah (Nice to Have)
**Komponen**: Auth

### Deskripsi

User meminta kemudahan login/register menggunakan akun Google.

### Usulan

Implementasi endpoint `/auth/google` yang menerima ID Token dari frontend (Firebase/Google Identity) dan menukarnya dengan JWT session aplikasi.

### Opsi Alternatif: Clerk / Auth0

User juga mempertimbangkan penggunaan **Clerk** (Secure by Clerk) untuk menangani seluruh flow Auth (Login, Register, Email Verification, OAuth).

- **Pros**: Cepat diimplementasi, fitur keamanan lengkap (2FA, Session Mgmt).
- **Cons**: Biaya langganan jika user scale-up, data user tersimpan di server pihak ketiga.
- **Rekomendasi**: Diskusikan dengan tim backend apakah ingin tetap Custom Auth (Golang) atau migrasi ke Auth-as-a-Service seperti Clerk.
