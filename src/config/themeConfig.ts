/**
 * Theme Configuration
 * -------------------
 * Konfigurasi tema terpusat untuk mendukung theme customization.
 * Semua warna semantic dan brand didefinisikan di sini.
 *
 * Arsitektur:
 * - semantic: Warna berdasarkan makna/fungsi (positive, negative, dll)
 * - brand: Warna identitas brand (primary, secondary)
 * - chart: Warna untuk visualisasi chart
 *
 * Untuk theme switching di masa depan:
 * - Override nilai di CSS variables
 * - Atau ganti object theme ini secara runtime
 */

// ============================================
// SEMANTIC COLORS
// ============================================

/**
 * Warna berdasarkan makna/fungsi
 * Digunakan untuk status, feedback, dan indikator
 */
export const semanticColors = {
  // Positive - Untuk trend naik, sukses, growth
  positive: {
    base: "#10b981", // emerald-500
    light: "#34d399", // emerald-400
    dark: "#059669", // emerald-600
    bg: "bg-emerald-500/5",
    bgStrong: "bg-emerald-500/10",
    border: "border-emerald-500/70",
    text: "text-emerald-600",
    textDark: "text-emerald-400",
  },

  // Negative - Untuk trend turun, error, warning kritis
  negative: {
    base: "#f43f5e", // rose-500
    light: "#fb7185", // rose-400
    dark: "#e11d48", // rose-600
    bg: "bg-rose-500/5",
    bgStrong: "bg-rose-500/10",
    border: "border-rose-500/70",
    text: "text-rose-600",
    textDark: "text-rose-400",
  },

  // Highlight - Untuk best day, featured items, achievements
  highlight: {
    base: "#f97316", // orange-500 (brand primary)
    light: "#fb923c", // orange-400
    dark: "#ea580c", // orange-600
    bg: "bg-orange-500/5",
    bgStrong: "bg-orange-500/10",
    border: "border-orange-500/50",
    text: "text-orange-600",
    textDark: "text-orange-400",
  },

  // Neutral - Untuk empty state, disabled, placeholder
  neutral: {
    base: "#6b7280", // gray-500
    light: "#9ca3af", // gray-400
    dark: "#4b5563", // gray-600
    bg: "bg-gray-500/5",
    bgStrong: "bg-gray-500/10",
    border: "border-gray-500/50",
    text: "text-gray-600",
    textDark: "text-gray-400",
  },
} as const;

// ============================================
// BRAND COLORS
// ============================================

/**
 * Warna identitas brand
 * Primary: Orange - Warna utama Datalaris
 * Secondary: Blue - Warna pendukung
 */
export const brandColors = {
  primary: {
    base: "#f97316", // orange-500
    light: "#fb923c", // orange-400
    dark: "#ea580c", // orange-600
    50: "#fff7ed",
    100: "#ffedd5",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
  },

  secondary: {
    base: "#3b82f6", // blue-500
    light: "#60a5fa", // blue-400
    dark: "#2563eb", // blue-600
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
} as const;

// ============================================
// STATUS THEME PRESETS
// ============================================

/**
 * Preset styling untuk status indicators
 * Digunakan oleh InsightBanner, badges, alerts
 */
export interface StatusThemePreset {
  border: string;
  bg: string;
  iconBg: string;
  iconText: string;
  text: string;
  textDark: string;
}

export const statusThemes: Record<
  "positive" | "negative" | "highlight" | "neutral",
  StatusThemePreset
> = {
  positive: {
    border: semanticColors.positive.border,
    bg: semanticColors.positive.bg,
    iconBg: semanticColors.positive.bgStrong,
    iconText: "text-emerald-500",
    text: semanticColors.positive.text,
    textDark: semanticColors.positive.textDark,
  },
  negative: {
    border: semanticColors.negative.border,
    bg: semanticColors.negative.bg,
    iconBg: semanticColors.negative.bgStrong,
    iconText: "text-rose-500",
    text: semanticColors.negative.text,
    textDark: semanticColors.negative.textDark,
  },
  highlight: {
    border: semanticColors.highlight.border,
    bg: semanticColors.highlight.bg,
    iconBg: semanticColors.highlight.bgStrong,
    iconText: "text-orange-500",
    text: semanticColors.highlight.text,
    textDark: semanticColors.highlight.textDark,
  },
  neutral: {
    border: semanticColors.neutral.border,
    bg: semanticColors.neutral.bg,
    iconBg: semanticColors.neutral.bgStrong,
    iconText: "text-gray-500",
    text: semanticColors.neutral.text,
    textDark: semanticColors.neutral.textDark,
  },
};

// ============================================
// TREND BADGE STYLES (for MetricCard)
// ============================================

/**
 * Styling terpusat untuk trend badges di MetricCard
 * Digunakan untuk menampilkan trend naik/turun
 */
export const trendBadgeStyles = {
  up: {
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    arrow: "↑",
  },
  down: {
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    arrow: "↓",
  },
} as const;

// ============================================
// CHART COLORS (Re-export for convenience)
// ============================================

/**
 * Warna untuk chart visualizations
 * Dikonsistenkan dengan brand colors
 */
export const themeChartColors = {
  primary: brandColors.primary.base,
  primaryLight: brandColors.primary.light,
  primaryDark: brandColors.primary.dark,

  secondary: brandColors.secondary.base,
  secondaryLight: brandColors.secondary.light,
  secondaryDark: brandColors.secondary.dark,

  // Accent colors for multi-series charts
  tertiary: semanticColors.positive.base,
  purple: "#a855f7",
  cyan: "#06b6d4",
  pink: "#ec4899",
  yellow: "#eab308",
} as const;

// ============================================
// AI INSIGHT BANNER CONFIG
// ============================================

/**
 * Konfigurasi terpusat untuk InsightBanner (AI-style)
 * Mencakup styling, labels, dan icon config
 */
export const aiInsightConfig = {
  // Labels & Text
  labels: {
    badge: "AI",
    separator: "—",
    peakDayPrefix: "Peak Day:",
    peakDaySuffix: "pesanan/hari",
  },

  // Container Styling
  container: {
    base: "relative overflow-hidden rounded-xl py-2 px-3 mb-4",
    gradient: {
      light:
        "bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
      dark: "dark:from-violet-500/20 dark:via-purple-500/10 dark:to-fuchsia-500/20",
    },
    border: "border border-violet-500/20 dark:border-violet-400/30",
    shadow: "shadow-sm shadow-violet-500/5",
    hover: "hover:shadow-md hover:shadow-violet-500/10",
    transition: "transition-all duration-300",
  },

  // Icon Styling
  icon: {
    size: "w-4 h-4",
    color: "text-violet-500 dark:text-violet-400",
  },

  // Badge Styling
  badge: {
    text: "text-[10px] font-bold uppercase tracking-wider",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    padding: "px-1.5 py-0.5 rounded",
  },

  // Text Styling
  text: {
    title: "text-xs font-semibold text-foreground whitespace-nowrap",
    separator: "text-muted-foreground dark:text-slate-500 text-xs",
    message: "text-xs text-muted-foreground dark:text-slate-300 truncate",
  },

  // Shimmer Effect
  shimmer:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none",
} as const;

// ============================================
// EXPORT DEFAULT THEME
// ============================================

export const defaultTheme = {
  semantic: semanticColors,
  brand: brandColors,
  status: statusThemes,
  chart: themeChartColors,
  aiInsight: aiInsightConfig,
} as const;

export type ThemeConfig = typeof defaultTheme;
