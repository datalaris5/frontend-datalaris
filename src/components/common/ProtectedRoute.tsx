/**
 * ProtectedRoute
 * --------------
 * Komponen wrapper untuk melindungi route yang membutuhkan autentikasi.
 *
 * Cara kerja:
 * - Cek apakah user sudah login (dari AuthContext)
 * - Jika belum login → redirect ke /login
 * - Jika sudah login → render children (halaman yang diproteksi)
 *
 * Menyimpan lokasi asal (attempted URL) agar bisa redirect kembali
 * setelah login berhasil.
 *
 * Contoh penggunaan di App.tsx:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardLayout />
 *   </ProtectedRoute>
 * } />
 */

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Jika user belum login, redirect ke halaman login
  // Simpan lokasi saat ini untuk redirect kembali setelah login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User sudah login, render children
  return <>{children}</>;
};

export default ProtectedRoute;
