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

---
*Gunakan dokumen ini sebagai acuan pengembangan dan maintenance frontend.*
