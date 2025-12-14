/**
 * ThemeToggle
 * -----------
 * Tombol untuk mengganti tema aplikasi (Light/Dark/System).
 *
 * Cara kerja:
 * - Klik berulang untuk rotate antara 3 mode: light → dark → system
 * - Icon berubah sesuai mode aktif
 * - State disimpan di localStorage via ThemeContext
 */

import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {/* Icon berdasarkan tema aktif */}
      {theme === "dark" ? (
        <Moon size={20} className="text-blue-400" />
      ) : theme === "light" ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Monitor size={20} className="text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
