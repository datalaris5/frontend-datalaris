/**
 * AdminLayout
 * -----------
 * Layout khusus untuk halaman Admin Console (superadmin).
 * Berbeda dengan DashboardLayout, sidebar ini fixed dan tidak bisa di-toggle.
 *
 * Fitur:
 * - Navigation sidebar dengan NavLink aktif/inaktif styling
 * - Header sederhana dengan informasi admin
 * - Tombol logout di bagian bawah sidebar
 *
 * Catatan: Admin Console terpisah dari dashboard pengguna biasa
 */

import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Layout,
  Database,
  Users,
  Settings,
  LogOut,
  Shield,
  Palette,
  LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";

// Tipe untuk item navigasi
interface NavItem {
  path: string;
  name: string;
  icon: LucideIcon;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handler logout admin
   * Menampilkan toast dan redirect ke halaman login admin
   */
  const handleLogout = (): void => {
    // TODO: Di produksi, clear auth tokens di sini
    toast.success("Logged out from Admin Console");
    navigate("/admin/login");
  };

  // Konfigurasi item navigasi sidebar
  const navItems: NavItem[] = [
    { path: "/admin/dashboard", name: "Dashboard", icon: Layout },
    { path: "/admin/theme", name: "Theme Settings", icon: Palette },
    { path: "/admin/users", name: "User Management", icon: Users },
    { path: "/admin/stores", name: "Store Management", icon: Database },
    { path: "/admin/settings", name: "System Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar Admin */}
      <div className="w-64 glass-bar border-r flex flex-col shadow-lg z-20">
        {/* Header sidebar dengan logo dan judul */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Admin Console
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Superadmin Access
            </p>
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3 mt-2">
            Core Modules
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                ${
                  isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }
              `}
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer with logout button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <header className="h-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="text-sm text-gray-500">
            Welcome back,{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              Superadmin
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Avatar placeholder */}
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs">
              SA
            </div>
          </div>
        </header>

        {/* Page content dari nested routes */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
