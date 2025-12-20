/**
 * Dashboard Types
 * ----------------
 * Type definitions terpusat untuk Dashboard.
 * Digunakan oleh Dashboard Tinjauan dan komponen terkait.
 */

import type { LucideIcon } from "lucide-react";

// === SPARKLINE & METRIC DATA ===

export interface SparklineItem {
  tanggal: string;
  total: number;
}

export interface MetricData {
  current: number;
  previous?: number; // Previous period value for comparison tooltip
  percent: number;
  trend: string;
  sparkline: SparklineItem[];
}

// === METRIC CARD TYPES ===

export type MetricColor =
  | "blue"
  | "emerald"
  | "purple"
  | "orange"
  | "cyan"
  | "green"
  | "pink";

export type MetricFormat = "currency" | "number" | "percent";

export interface DashboardMetric {
  title: string;
  value: number;
  previousValue?: number; // Previous period value for tooltip
  periodLabel?: string; // e.g., "Des 2024" for comparison label
  format: MetricFormat;
  suffix?: string;
  trend: string;
  trendUp: boolean;
  data: number[];
  icon: LucideIcon;
  highlight?: boolean;
  isDummy: boolean;
  color: MetricColor;
}

// === COLOR THEMES ===

export interface MetricColorTheme {
  iconBg: string;
  iconText: string;
  accent: string;
  accentClass: string;
}

export const metricColorThemes: Record<MetricColor, MetricColorTheme> = {
  blue: {
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    iconText: "text-white",
    accent: "#3b82f6",
    accentClass: "from-blue-500 to-blue-500/80",
  },
  emerald: {
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    iconText: "text-white",
    accent: "#10b981",
    accentClass: "from-emerald-500 to-emerald-500/80",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    iconText: "text-white",
    accent: "#a855f7",
    accentClass: "from-purple-500 to-purple-500/80",
  },
  orange: {
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    iconText: "text-white",
    accent: "#f97316",
    accentClass: "from-orange-500 to-orange-500/80",
  },
  cyan: {
    iconBg: "bg-gradient-to-br from-cyan-500 to-sky-500",
    iconText: "text-white",
    accent: "#06b6d4",
    accentClass: "from-cyan-500 to-cyan-500/80",
  },
  green: {
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    iconText: "text-white",
    accent: "#22c55e",
    accentClass: "from-green-500 to-green-500/80",
  },
  pink: {
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    iconText: "text-white",
    accent: "#ec4899",
    accentClass: "from-pink-500 to-pink-500/80",
  },
};

// === HIGHLIGHT THEMES ===

export const metricHighlightThemes: Record<string, string> = {
  blue: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-blue-500/40",
  orange:
    "bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 shadow-orange-500/40",
  purple:
    "bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-800 shadow-purple-500/40",
};

// === SEMANTIC STATUS THEMES ===
// Re-exported from themeConfig for backward compatibility

import { statusThemes, type StatusThemePreset } from "@/config/themeConfig";

/**
 * @deprecated Gunakan import langsung dari '@/config/themeConfig'
 * Ini di-export untuk backward compatibility
 */
export type StatusTheme = StatusThemePreset;

/**
 * Status themes untuk komponen yang membutuhkan semantic colors
 * Re-exported dari themeConfig.ts
 *
 * Keys: positive, negative, highlight, neutral
 */
export const semanticStatusThemes = statusThemes;

// === CHART DATA TYPES ===

export interface SalesDataPoint {
  originalDate?: Date;
  monthKey: string;
  displayMonth: string;
  sales: number;
  orders: number;
  basketSize: number;
  salesGrowth?: number;
  ordersGrowth?: number;
  basketSizeGrowth?: number;
}

export interface OrdersDayDataPoint {
  displayMonth: string;
  orders: number;
  dayName?: string;
  avgSales?: number;
  full?: string;
  average?: number;
  count?: number;
}

export interface StoreItem {
  id?: string | number;
  marketplace_id?: number;
}
