/**
 * Centralized Chart Theme Configuration
 * --------------------------------------
 * Konfigurasi warna dan style chart yang konsisten.
 * Semua dashboard harus import dari sini.
 */

// ============================================
// CHART COLORS
// ============================================
export const chartColors = {
  // Primary - Brand Orange (Main Charts)
  primary: "#f97316",
  primaryLight: "#fb923c",
  primaryDark: "#ea580c",

  // Secondary - Blue (Secondary Charts)
  secondary: "#3b82f6",
  secondaryLight: "#60a5fa",
  secondaryDark: "#2563eb",

  // Tertiary - Green (Success/Positive)
  tertiary: "#10b981",
  tertiaryLight: "#34d399",
  tertiaryDark: "#059669",

  // Accent Colors for Multi-Series
  purple: "#a855f7",
  cyan: "#06b6d4",
  pink: "#ec4899",
  yellow: "#eab308",
} as const;

// ============================================
// CHART UI ELEMENTS
// ============================================
export const chartUI = {
  grid: {
    stroke: "#e5e7eb",
    strokeDark: "#374151",
    strokeDasharray: "3 3",
  },
  cursor: {
    stroke: "rgba(255, 255, 255, 0.1)",
    fill: "rgba(255, 255, 255, 0.02)",
  },
  axis: {
    stroke: "#9ca3af",
    fontSize: 10,
    tickLine: false,
    axisLine: false,
  },
  referenceLine: {
    stroke: "#9ca3af",
    strokeDasharray: "5 5",
  },
  // Cartesian Grid options
  cartesianGrid: {
    strokeDasharray: "3 3",
    vertical: false,
    opacity: 0.1,
  },
  // Bar radius presets
  barRadius: {
    top: [4, 4, 0, 0] as [number, number, number, number],
    right: [0, 4, 4, 0] as [number, number, number, number],
    all: [4, 4, 4, 4] as [number, number, number, number],
  },
  // Active dot for Area/Line charts
  activeDot: {
    r: 6,
    fill: chartColors.primary,
    stroke: "#fff",
    strokeWidth: 3,
    filter: "drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))",
  },
} as const;

// ============================================
// ANIMATION SETTINGS
// ============================================
export const chartAnimation = {
  duration: 500,
  easing: "ease-out" as const,
} as const;

// ============================================
// SEMANTIC GROWTH COLORS
// ============================================
/**
 * Warna semantik untuk indikator pertumbuhan (positif/negatif).
 * Digunakan di YoY chart, trend badges, dan komponen serupa.
 */
export const chartGrowthColors = {
  positive: {
    fill: "#10b981", // Emerald
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  negative: {
    fill: "#ef4444", // Red
    bg: "bg-red-500/10",
    text: "text-red-500",
  },
} as const;

// ============================================
// GRADIENT DEFINITIONS
// ============================================
export interface GradientConfig {
  id: string;
  start: { offset: string; color: string; opacity: number };
  end: { offset: string; color: string; opacity: number };
}

export const chartGradients = {
  primary: {
    id: "primaryGradient",
    start: { offset: "5%", color: chartColors.primary, opacity: 0.2 },
    end: { offset: "95%", color: chartColors.primary, opacity: 0 },
  },
  secondary: {
    id: "secondaryGradient",
    start: { offset: "5%", color: chartColors.secondary, opacity: 0.2 },
    end: { offset: "95%", color: chartColors.secondary, opacity: 0 },
  },
};

// ============================================
// AREA CHART STYLES
// ============================================
export const areaStyles = {
  primary: {
    stroke: chartColors.primary,
    fill: `url(#${chartGradients.primary.id})`,
    strokeWidth: 2,
    activeDot: {
      r: 6,
      strokeWidth: 2,
      stroke: "#fff",
      fill: chartColors.primary,
    },
  },
  secondary: {
    stroke: chartColors.secondary,
    fill: `url(#${chartGradients.secondary.id})`,
    strokeWidth: 2,
    activeDot: {
      r: 6,
      strokeWidth: 2,
      stroke: "#fff",
      fill: chartColors.secondary,
    },
  },
} as const;

// ============================================
// BAR CHART STYLES
// ============================================
export const barStyles = {
  primary: {
    fill: chartColors.primary,
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
  secondary: {
    fill: chartColors.secondary,
    radius: [4, 4, 0, 0] as [number, number, number, number],
  },
} as const;

// ============================================
// HELPER: Render Gradient Definition for SVG
// ============================================
export const renderGradient = (gradient: GradientConfig): string =>
  `<linearGradient id="${gradient.id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="${gradient.start.offset}" stopColor="${gradient.start.color}" stopOpacity="${gradient.start.opacity}" />
    <stop offset="${gradient.end.offset}" stopColor="${gradient.end.color}" stopOpacity="${gradient.end.opacity}" />
  </linearGradient>`;

// ============================================
// CHART LAYOUT PRESETS
// ============================================
/**
 * Layout presets untuk berbagai ukuran chart.
 * - large: Chart utama (2/3 width, full height)
 * - compact: Chart kecil/stacked (1/3 width)
 * - horizontal: Horizontal bar chart (YoY style)
 */
export const chartLayout = {
  // Untuk chart besar (Analisa Tren)
  large: {
    margin: { top: 20, right: 20, left: 0, bottom: 30 },
    yAxisWidth: 45,
    contentPadding: "pt-4 pb-6 px-6",
    headerPadding: "py-4 px-6",
  },
  // Untuk chart compact/stacked (Analisa Operasional)
  compact: {
    margin: { top: 10, right: 15, left: 0, bottom: 20 },
    yAxisWidth: 35,
    contentPadding: "pt-4 pb-6 px-6",
    headerPadding: "pb-3",
  },
  // Untuk horizontal bar chart (YoY Growth)
  horizontal: {
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    yAxisWidth: 40,
    contentPadding: "pt-2 pb-4 px-4",
    headerPadding: "pb-3",
  },
} as const;

// ============================================
// CHART TYPOGRAPHY HIERARCHY
// ============================================
/**
 * Typography presets untuk konsistensi hierarki visual.
 * - titleLarge: Chart utama (text-lg)
 * - titleCompact: Chart kecil (text-base)
 * - subtitle: Deskripsi chart
 * - axisLabel: Label sumbu X/Y
 */
export const chartTypography = {
  titleLarge: "text-lg font-bold",
  titleCompact: "text-base font-bold",
  subtitle: "text-sm text-muted-foreground",
  subtitleCompact: "text-xs text-muted-foreground",
  axisLabel: {
    fontSize: 10,
    fill: "hsl(var(--muted-foreground))",
    fontWeight: 500,
  },
} as const;

// ============================================
// CHART HEADER ICON STYLES
// ============================================
/**
 * Icon presets untuk header chart.
 * Warna: text-primary (orange brand)
 * Size: Proporsional dengan ukuran chart
 */
export const chartHeaderIcons = {
  large: "w-5 h-5 text-primary",
  compact: "w-4 h-4 text-primary",
} as const;

// ============================================
// CHART CONTENT DEFINITIONS (CENTRALIZED)
// ============================================
/**
 * Definisi konten chart yang terpusat.
 * Setiap chart memiliki:
 * - title: Judul chart (statis)
 * - subtitle: Deskripsi chart (statis, tidak berubah berdasarkan state)
 * - size: Ukuran chart ("large" atau "compact")
 */
export const chartContent = {
  tren: {
    title: "Analisa Tren",
    // Subtitle dinamis berdasarkan selectedIndicator, didefinisikan di komponen
    size: "large" as const,
  },
  operasional: {
    title: "Analisa Operasional",
    subtitle: "Total pesanan per hari",
    size: "compact" as const,
  },
  yoyGrowth: {
    title: "Pertumbuhan Tahunan (YoY)",
    // Subtitle menggunakan template: "Perbandingan tahun {currentYear} vs {previousYear}"
    getSubtitle: (currentYear: number, previousYear: number) =>
      `Perbandingan tahun ${currentYear} vs ${previousYear}`,
    size: "compact" as const,
  },
} as const;

// ============================================
// METRIC CARD SPECIFIC
// ============================================
export const chartMetricCard = {
  typography: {
    title: "text-[11px] font-medium text-muted-foreground",
    value: "text-xl font-bold tracking-tight",
    badge: "text-[10px] font-bold",
    comparison: "text-[9px]",
  },
  sparkline: {
    strokeWidth: 1.5,
    colors: {
      default: "#94a3b8",
      highlight: "#ffffff",
    },
  },
  animation: {
    countUpDuration: 1.8,
    staggerDelay: 0.06,
    cardDuration: 0.4,
    sparklineDelay: 0.3,
  },
} as const;

export default {
  colors: chartColors,
  ui: chartUI,
  gradients: chartGradients,
  areaStyles,
  barStyles,
  layout: chartLayout,
  typography: chartTypography,
  headerIcons: chartHeaderIcons,
  content: chartContent,
  animation: chartAnimation,
  growthColors: chartGrowthColors,
};
