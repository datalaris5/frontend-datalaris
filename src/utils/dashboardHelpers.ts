/**
 * Dashboard Helper Functions
 * ---------------------------
 * Fungsi-fungsi reusable untuk dashboard logic.
 * Digunakan di semua dashboard (Overview, Ads, Chat, dll).
 *
 * Functions:
 * - getTargetStores: Filter stores based on selection
 * - formatDateRange: Format date untuk API payload
 * - buildPayload: Create API payload dengan marketplace_id
 * - extractMetricData: Parse API response ke MetricData
 * - mergeSparklines: Merge sparkline arrays (lodash)
 * - aggregateMetrics: Aggregate multi-store data (lodash)
 */

import { sumBy, groupBy } from "lodash";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type {
  StoreItem,
  SparklineItem,
  MetricData,
} from "@/types/dashboard.types";

/**
 * Get target stores based on filter selection
 *
 * @param store - Selected store ID or "all"
 * @param stores - Array of all available stores
 * @returns Filtered array of stores
 */
export function getTargetStores(
  store: string | number,
  stores: StoreItem[]
): StoreItem[] {
  if (store === "all") {
    return stores.filter((s) => s?.id);
  }

  const selected = stores.find((s) => s.id?.toString() === store.toString());
  return selected ? [selected] : [];
}

/**
 * Format date range untuk API payload
 *
 * @param dateRange - DateRange object dengan startDate dan endDate
 * @returns Object dengan fromDate dan toDate dalam format yyyy-MM-dd
 */
export function formatDateRange(
  dateRange: { startDate?: Date; endDate?: Date } | undefined
) {
  return {
    fromDate: dateRange?.startDate
      ? format(dateRange.startDate, "yyyy-MM-dd")
      : "",
    toDate: dateRange?.endDate ? format(dateRange.endDate, "yyyy-MM-dd") : "",
  };
}

/**
 * Build API payload dengan marketplace_id
 *
 * @param storeId - Store ID
 * @param marketplaceId - Marketplace ID (1=Shopee, 2=TikTok, dll)
 * @param dates - Object dengan fromDate dan toDate
 * @returns Payload object untuk API call
 */
export function buildPayload(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
) {
  return {
    store_id: storeId,
    marketplace_id: marketplaceId,
    date_from: dates.fromDate,
    date_to: dates.toDate,
  };
}

/**
 * Get previous period label for comparison
 * Returns formatted month-year for the previous period
 * Uses startDate to avoid month overflow issues (e.g., Jan 31 - 1 month = March 3)
 */
export function getPreviousPeriodLabel(startDate: Date, endDate: Date): string {
  // Use startDate (1st of month) to avoid overflow
  const previousMonth = new Date(startDate);
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  return format(previousMonth, "MMM yyyy", { locale: idLocale });
}

/**
 * Extract metric data dari API response
 * Handles inconsistent API response structure
 *
 * @param res - Axios response object
 * @returns MetricData object
 */
export function extractMetricData(res: any): MetricData {
  const data = res?.data?.data || {};

  return {
    current: Number(data.total || 0),
    previous: Number(data.previous_total || 0),
    percent: Number(data.percent || 0),
    trend: data.trend || "Equal",
    sparkline: data.sparkline || [],
  };
}

/**
 * Merge multiple sparkline arrays (untuk multi-store aggregation)
 * Uses lodash groupBy untuk merge by date
 *
 * @param sparklineArrays - Array of sparkline arrays
 * @returns Merged sparkline array
 */
export function mergeSparklines(
  sparklineArrays: SparklineItem[][]
): SparklineItem[] {
  // Flatten semua arrays jadi 1 array
  const flat = sparklineArrays.flat();

  if (flat.length === 0) return [];

  // Group by tanggal
  const grouped = groupBy(flat, "tanggal");

  // Sum totals untuk setiap tanggal
  return Object.entries(grouped).map(([tanggal, items]) => ({
    tanggal,
    total: sumBy(items, (item) => Number(item.total || 0)),
  }));
}

/**
 * Aggregate metrics dari multiple stores
 * Uses lodash sumBy untuk efficient aggregation
 *
 * @param results - Array of store metric results
 * @returns Aggregated metrics
 */
export function aggregateMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      sales: { current: 0, previous: 0, percent: 0, sparkline: [] },
      orders: { current: 0, previous: 0, percent: 0, sparkline: [] },
      visitors: { current: 0, previous: 0, percent: 0, sparkline: [] },
      cr: { current: 0, previous: 0, percent: 0 },
      bs: { current: 0, previous: 0, percent: 0 },
    };
  }

  // Aggregate current values
  const aggregated = {
    sales: {
      current: sumBy(results, "sales.current"),
      previous: sumBy(results, "sales.previous"),
      percent: 0, // Multi-store tidak ada percent comparison
      sparkline: mergeSparklines(results.map((r) => r.sales?.sparkline || [])),
    },
    orders: {
      current: sumBy(results, "orders.current"),
      previous: sumBy(results, "orders.previous"),
      percent: 0, // Multi-store tidak ada percent comparison
      sparkline: mergeSparklines(results.map((r) => r.orders?.sparkline || [])),
    },
    visitors: {
      current: sumBy(results, "visitors.current"),
      previous: sumBy(results, "visitors.previous"),
      percent: 0, // Multi-store tidak ada percent comparison
      sparkline: mergeSparklines(
        results.map((r) => r.visitors?.sparkline || [])
      ),
    },
  };

  // Calculate derived metrics
  const totalOrders = aggregated.orders.current;
  const totalSales = aggregated.sales.current;
  const totalVisitors = aggregated.visitors.current;

  // Previous derived metrics
  const prevOrders = aggregated.orders.previous;
  const prevSales = aggregated.sales.previous;
  const prevVisitors = aggregated.visitors.previous;

  return {
    ...aggregated,
    cr: {
      current: totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0,
      previous: prevVisitors > 0 ? (prevOrders / prevVisitors) * 100 : 0,
      percent: 0, // Multi-store tidak ada percent comparison
    },
    bs: {
      current: totalOrders > 0 ? totalSales / totalOrders : 0,
      previous: prevOrders > 0 ? prevSales / prevOrders : 0,
      percent: 0, // Multi-store tidak ada percent comparison
    },
  };
}
