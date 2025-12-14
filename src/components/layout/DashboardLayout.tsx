/**
 * DashboardLayout
 * ---------------
 * Layout utama untuk halaman dashboard pengguna.
 * Mengatur struktur: Sidebar (kiri) + Header (atas) + Konten (tengah)
 *
 * Fitur:
 * - Sidebar yang bisa di-toggle (buka/tutup)
 * - Responsif terhadap perubahan lebar sidebar
 * - Menampilkan ComingSoon jika platform belum didukung
 * - Menggunakan React Router Outlet untuk nested routing
 */

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useFilter } from "@/context/FilterContext";
import ComingSoon from "../common/ComingSoon";
import { Outlet } from "react-router-dom";

const DashboardLayout: React.FC = () => {
  // State untuk toggle sidebar (buka/tutup)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { platform } = useFilter();

  // Cek apakah platform masih dalam pengembangan
  const isComingSoon = platform === "tiktok-tokopedia";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar dengan toggle */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Area konten utama - margin berubah sesuai status sidebar */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Header />
        {/* Main content area dengan mesh gradient background */}
        <main className="flex-1 overflow-hidden p-6 relative mesh-gradient">
          {/* Tampilkan ComingSoon jika platform belum didukung */}
          {isComingSoon ? <ComingSoon /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
