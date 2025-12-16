/**
 * Subscription Plans
 * ------------------
 * Halaman daftar paket langganan.
 *
 * Paket:
 * - Starter: Gratis selamanya (fitur terbatas)
 * - Pro: Rp 99rb/bulan (fitur lengkap)
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * Handler untuk subscribe ke paket
   */
  const handleSubscribe = (plan: string): void => {
    if (plan === "pro") {
      navigate("/subscription/payment");
    }
  };

  const isPro = user?.subscription === "pro";

  // Fitur per paket
  const starterFeatures = [
    "1 Toko Terhubung",
    "Analisis Dasar (7 Hari Terakhir)",
    "Upload Data Manual",
    "Support via Email",
  ];

  const proFeatures = [
    "Unlimited Toko",
    "Analisis Lengkap (All Time)",
    "AI Recommendations (Smart Insights)",
    "Export Laporan PDF/Excel",
    "Prioritas Support 24/7",
    "Akses Fitur Beta",
  ];

  return (
    <div className="min-h-screen transition-colors">
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-orange-600 font-bold tracking-wide uppercase text-sm mb-2">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Pilih Paket yang Sesuai
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Mulai dari gratis, upgrade kapan saja saat bisnis Anda berkembang.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="glass-card relative p-8 rounded-3xl hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground">Starter</h3>
              <p className="text-muted-foreground mt-2">
                Untuk seller pemula yang baru merintis.
              </p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold text-foreground">
                Gratis
              </span>
              <span className="text-muted-foreground"> / selamanya</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {starterFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="secondary"
              disabled
              className="w-full h-12 font-bold opacity-100 bg-muted text-muted-foreground cursor-not-allowed"
            >
              Start Plan is Active
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-orange-500 rounded-3xl shadow-2xl scale-105 z-10 flex flex-col">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 p-3">
              <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center">
                <Star className="h-3 w-3 mr-1" fill="white" />
                Populer
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pro
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Untuk seller serius yang ingin scale-up.
              </p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">
                Rp 99rb
              </span>
              <span className="text-gray-500 dark:text-gray-400">/ bulan</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-6 w-6 text-orange-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {isPro ? (
              <button
                disabled
                className="w-full py-4 px-6 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold border border-green-200 dark:border-green-800 cursor-default"
              >
                Paket Aktif
              </button>
            ) : (
              <button
                onClick={() => handleSubscribe("pro")}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-lg shadow-lg hover:shadow-orange-500/40 transform transition-all hover:scale-[1.02] flex items-center justify-center"
              >
                <Zap className="mr-2 h-5 w-5" fill="currentColor" />
                Upgrade Sekarang
              </button>
            )}
            <p className="text-center text-xs text-gray-500 mt-4">
              Garansi uang kembali 7 hari. Batalkan kapan saja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
