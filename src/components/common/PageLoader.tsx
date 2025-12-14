/**
 * PageLoader
 * ----------
 * Komponen loading yang ditampilkan saat aplikasi pertama kali dimuat.
 * Menampilkan animasi spinner dengan efek glass morphism.
 */

import React from "react";
import { Loader2 } from "lucide-react";

const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Container spinner dengan efek glow */}
      <div className="relative">
        {/* Background glow effect */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 opacity-20 animate-pulse absolute inset-0 blur-xl"></div>
        {/* Spinner container dengan glass effect */}
        <div className="glass-card relative p-4 rounded-2xl shadow-xl">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      </div>
      {/* Teks loading */}
      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
        Memuat aplikasi...
      </p>
    </div>
  );
};

export default PageLoader;
