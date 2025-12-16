/**
 * Dashboard Components
 * --------------------
 * Barrel export untuk komponen-komponen Dashboard.
 */

export { default as MetricCard } from "./MetricCard";
export { default as MetricCardSkeleton } from "./MetricCardSkeleton";
export { default as InsightBanner } from "./InsightBanner";

// Re-export types untuk convenience
export type {
  DashboardMetric,
  MetricColor,
  MetricFormat,
  SparklineItem,
  MetricData,
} from "@/types/dashboard.types";
