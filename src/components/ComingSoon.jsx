import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { useFilter } from "../context/FilterContext";

const ComingSoon = () => {
  const { platform, setPlatform } = useFilter();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center animate-fade-in">
      <div className="glass-card p-6 rounded-full mb-6">
        <Construction size={64} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 capitalize">
        Integrasi{" "}
        {platform === "tiktok-tokopedia" ? "TikTok Shop x Tokopedia" : platform}{" "}
        Segera Hadir!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Kami sedang bekerja keras untuk menyiapkan fitur analisis data untuk{" "}
        {platform === "tiktok-tokopedia" ? "TikTok Shop & Tokopedia" : platform}
        . Saat ini, silakan fokus pada analisis toko Shopee Anda.
      </p>
      <button
        onClick={() => setPlatform("shopee")}
        className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
      >
        <ArrowLeft size={20} className="mr-2" />
        Kembali ke Shopee
      </button>
    </div>
  );
};

export default ComingSoon;
