import {
  LucideIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { DashboardMetric } from "@/types/dashboard.types";

export type InsightType =
  | "hazard"
  | "achievement"
  | "efficiency"
  | "neutral"
  | "standard";

export interface SmartInsight {
  type: InsightType;
  icon: LucideIcon;
  title: string;
  message: string;
  theme: {
    bg: string;
    border: string;
    iconBg: string;
    iconText: string;
    text: string;
    textDark: string;
  };
}

/**
 * Menganalisis metrik dashboard untuk menghasilkan insight prioritas.
 * Priority Logic:
 * 1. 🚨 Hazard: Sales Drop > 15%
 * 2. 🚀 Achievement: Sales Growth > 15%
 * 3. 🎯 Efficiency: CR Growth > 5% (walau Sales flat)
 * 4. 📊 Standard: Info Sales biasa
 */
export const generateSmartInsight = (
  metrics: DashboardMetric[]
): SmartInsight => {
  // 1. Ambil Metric Penting
  const sales = metrics.find((m) => m.title === "Total Penjualan");
  const cr = metrics.find((m) => m.title === "Convertion Rate");

  // Default: Neutral if no data
  if (!sales || sales.value === 0) {
    return {
      type: "neutral",
      icon: Zap,
      title: "Data Belum Tersedia",
      message:
        "Upload data penjualan untuk melihat analisis performa toko Anda.",
      theme: {
        bg: "bg-muted/30",
        border: "border-muted",
        iconBg: "bg-muted",
        iconText: "text-muted-foreground",
        text: "text-muted-foreground",
        textDark: "text-muted-foreground",
      },
    };
  }

  const salesTrendValue = parseFloat(sales.trend.replace("%", ""));
  const isSalesUp = sales.trendUp;
  const realSalesTrend = isSalesUp ? salesTrendValue : -salesTrendValue;

  // Additional Correlation Metrics
  const visitors = metrics.find((m) => m.title === "Total Pengunjung");
  const orders = metrics.find((m) => m.title === "Total Pesanan");
  const basketSize = metrics.find((m) => m.title === "Basket Size");

  // Helper to get real trend value
  const getTrend = (m?: DashboardMetric) => {
    if (!m) return 0;
    const val = parseFloat(m.trend.replace("%", ""));
    return m.trendUp ? val : -val;
  };

  const visitorsTrend = getTrend(visitors);
  const crTrend = getTrend(cr);
  const ordersTrend = getTrend(orders);
  const basketTrend = getTrend(basketSize);

  // --- LOGIC PRIORITAS ---

  // 1. 🚨 HAZARD: Penjualan Anjlok > 15% (CRITICAL)
  if (realSalesTrend < -15) {
    return {
      type: "hazard",
      icon: AlertTriangle,
      title: "Perhatian Diperlukan",
      message: `Penjualan menurun signifikan (${sales.trend}) periode ini. Evaluasi strategi harga atau stok segera.`,
      theme: {
        bg: "bg-red-500/25 dark:bg-red-900/30",
        border: "border-red-500/50",
        iconBg: "bg-red-100 dark:bg-red-900/50",
        iconText: "text-red-700 dark:text-red-200",
        text: "text-red-900",
        textDark: "text-red-100",
      },
    };
  }

  // 2. 🔍 TRAFFIC WASTE: Pengunjung Luber (>10%) TAPI yang beli makin sedikit (CR < -5%) (WARNING)
  // "Banyak yang lihat, sedikit yang checkout"
  if (visitorsTrend > 10 && crTrend < -5) {
    return {
      type: "hazard", // Masuk kategori hazard/warning tapi soft
      icon: AlertTriangle,
      title: "Pemborosan Trafik Terdeteksi",
      message: `Pengunjung naik ${visitors?.trend}, tapi Conversion Rate drop ${cr?.trend}. Pastikan harga kompetitif & web tidak lambat.`,
      theme: {
        bg: "bg-orange-500/25 dark:bg-orange-900/30",
        border: "border-orange-500/50",
        iconBg: "bg-orange-100 dark:bg-orange-900/50",
        iconText: "text-orange-700 dark:text-orange-200",
        text: "text-orange-900",
        textDark: "text-orange-100",
      },
    };
  }

  // 3. 📉 LOW VALUE ORDERS: Orderan Banyak (>10%) TAPI Rata2 Belanja Turun (< -5%) (OPPORTUNITY LOSS)
  // "Capek packing banyak tapi duitnya dikit"
  if (ordersTrend > 10 && basketTrend < -5) {
    return {
      type: "neutral", // Pakai neutral yang di-modify jadi yellow/warning
      icon: AlertTriangle,
      title: "Optimalkan Nilai Pesanan",
      message: `Total Pesanan naik ${orders?.trend}, namun Basket Size turun ${basketSize?.trend}. Coba tawarkan bundling produk.`,
      theme: {
        bg: "bg-yellow-500/25 dark:bg-yellow-900/30",
        border: "border-yellow-500/50",
        iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
        iconText: "text-yellow-700 dark:text-yellow-200",
        text: "text-yellow-900",
        textDark: "text-yellow-100",
      },
    };
  }

  // 4. 🚀 ACHIEVEMENT: Penjualan Meroket > 15%
  if (realSalesTrend > 15) {
    return {
      type: "achievement",
      icon: Zap,
      title: "Performa Luar Biasa!",
      message: `Pertumbuhan penjualan sangat agresif (${sales.trend})! Pertahankan momentum ini.`,
      theme: {
        bg: "bg-blue-500/25 dark:bg-blue-900/30",
        border: "border-blue-500/50",
        iconBg: "bg-blue-100 dark:bg-blue-900/50",
        iconText: "text-blue-700 dark:text-blue-200",
        text: "text-blue-900",
        textDark: "text-blue-100",
      },
    };
  }

  // 5. 🎯 EFFICIENCY: Sales Menengah (-5% s/d +15%) TAPI Conversion Rate Naik > 5%
  if (realSalesTrend > -5 && realSalesTrend <= 15 && crTrend > 5) {
    return {
      type: "efficiency",
      icon: CheckCircle2,
      title: "Efisiensi Meningkat",
      message: `Meski penjualan stabil, Conversion Rate naik ${cr?.trend}. Pengunjung lebih rajin belanja!`,
      theme: {
        bg: "bg-emerald-500/25 dark:bg-emerald-900/30",
        border: "border-emerald-500/50",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        iconText: "text-emerald-700 dark:text-emerald-200",
        text: "text-emerald-900",
        textDark: "text-emerald-100",
      },
    };
  }

  // 4. 📊 STANDARD: Info Sales Biasa (Default Fallback)
  // General & Professional - "Balanced Visuals"
  return {
    type: "standard",
    icon: isSalesUp ? TrendingUp : TrendingDown,
    title: isSalesUp ? "Pertumbuhan Stabil" : "Koreksi Wajar",
    message: isSalesUp
      ? `Bisnis berjalan stabil. Pertumbuhan penjualan terpantau positif ${sales.trend} dibanding periode lalu.`
      : `Terjadi fluktuasi normal. Penjualan mengalami koreksi ringan ${sales.trend} periode ini.`,
    theme: {
      bg: isSalesUp
        ? "bg-indigo-500/25 dark:bg-indigo-900/30" // Indigo lebih "Corporate/General" dibanding Green (keuangan)
        : "bg-slate-500/25 dark:bg-slate-900/30", // Slate lebih "Neutral" dibanding Orange (warning)
      border: isSalesUp
        ? "border-indigo-500/50 dark:border-indigo-500/30"
        : "border-slate-500/50 dark:border-slate-500/30",
      iconBg: isSalesUp
        ? "bg-indigo-100 dark:bg-indigo-900/50"
        : "bg-slate-100 dark:bg-slate-900/50",
      iconText: isSalesUp
        ? "text-indigo-700 dark:text-indigo-200"
        : "text-slate-700 dark:text-slate-200",
      text: isSalesUp ? "text-indigo-900" : "text-slate-900",
      textDark: isSalesUp ? "text-indigo-100" : "text-slate-100",
    },
  };
};
