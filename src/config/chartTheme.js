/**
 * Centralized Chart Theme Configuration
 * All chart colors and styles should be imported from here
 * for consistency across all dashboards.
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
};

// ============================================
// CHART UI ELEMENTS
// ============================================
export const chartUI = {
  // Grid Lines
  grid: {
    stroke: "#e5e7eb", // Light mode
    strokeDark: "#374151", // Dark mode
    strokeDasharray: "3 3",
  },

  // Cursor (hover line/area)
  cursor: {
    stroke: "rgba(255, 255, 255, 0.1)",
    fill: "rgba(255, 255, 255, 0.02)",
  },

  // Axis
  axis: {
    stroke: "#9ca3af",
    fontSize: 10,
    tickLine: false,
    axisLine: false,
  },

  // Reference Line
  referenceLine: {
    stroke: "#9ca3af",
    strokeDasharray: "5 5",
  },
};

// ============================================
// GRADIENT DEFINITIONS
// ============================================
export const chartGradients = {
  primary: {
    id: "primaryGradient",
    start: { offset: "5%", color: chartColors.primary, opacity: 0.3 },
    end: { offset: "95%", color: chartColors.primary, opacity: 0 },
  },
  secondary: {
    id: "secondaryGradient",
    start: { offset: "5%", color: chartColors.secondary, opacity: 0.3 },
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
};

// ============================================
// BAR CHART STYLES
// ============================================
export const barStyles = {
  primary: {
    fill: chartColors.primary,
    radius: [4, 4, 0, 0],
  },
  secondary: {
    fill: chartColors.secondary,
    radius: [4, 4, 0, 0],
  },
};

// ============================================
// HELPER: Render Gradient Definition for SVG
// ============================================
export const renderGradient = (gradient) =>
  `<linearGradient id="${gradient.id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="${gradient.start.offset}" stopColor="${gradient.start.color}" stopOpacity="${gradient.start.opacity}" />
    <stop offset="${gradient.end.offset}" stopColor="${gradient.end.color}" stopOpacity="${gradient.end.opacity}" />
  </linearGradient>`;

export default {
  colors: chartColors,
  ui: chartUI,
  gradients: chartGradients,
  areaStyles,
  barStyles,
};
