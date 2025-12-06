# Log Isu Backend & Komunikasi

Dokumen ini berfungsi sebagai catatan berkelanjutan mengenai masalah (bug), kendala, dan permintaan fitur yang ditemukan oleh tim Frontend namun memerlukan perbaikan di sisi Backend.

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
