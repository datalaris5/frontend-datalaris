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
    store_id: Number(storeId),
    marketplace_id: marketplaceId,
    date_from: dates.fromDate, // Backend DTO expects date_from
    date_to: dates.toDate, // Backend DTO expects date_to
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

  const current = Number(data.total || 0);
  const percent = Number(data.percent || 0);

  // Fix: Default ke 0 jika field tidak ada (Missing API treated as 0 value)
  // User Request: "Biarkan seakan ada API, tuliskan 0 saja"
  const previous = Number(data.previous_total || 0);

  // REVERTED: Reverse Calculation dihapus atas request user.
  // Biarkan kosong jika API belum siap.

  return {
    current,
    previous,
    percent,
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
  sparklineArrays: SparklineItem[][],
  type: "sum" | "average" = "sum"
): SparklineItem[] {
  // Flatten semua arrays jadi 1 array
  const flat = sparklineArrays.flat();

  if (flat.length === 0) return [];

  // Group by tanggal (support date/tanggal keys)
  const grouped = groupBy(flat, (item: any) => item.tanggal || item.date);

  // Sum/Avg totals untuk setiap tanggal & Sort by date
  return Object.entries(grouped)
    .map(([dateKey, items]) => {
      // Filter out undefined/null keys
      if (!dateKey || dateKey === "undefined") return null;

      const sum = sumBy(items, (item) => Number(item.total || 0));
      const value = type === "average" ? sum / items.length : sum;

      return {
        tanggal: dateKey, // Normalized to 'tanggal'
        total: value,
      };
    })
    .filter((item) => item !== null) // Remove failed groups
    .sort(
      (a, b) => new Date(a!.tanggal).getTime() - new Date(b!.tanggal).getTime()
    ) as SparklineItem[];
}

/**
 * Aggregate metrics dari multiple stores
 * Uses lodash sumBy untuk efficient aggregation
 *
 * @param results - Array of store metric results
 * @returns Aggregated metrics
 */
/**
 * Aggregate metrics dari multiple stores
 * Updated: Computes totals from sparklines for robustness (like aggregateChatMetrics)
 *
 * @param results - Array of store metric results
 * @returns Aggregated metrics
 */
export function aggregateOverviewMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      sales: { current: 0, previous: 0, percent: 0, sparkline: [] },
      orders: { current: 0, previous: 0, percent: 0, sparkline: [] },
      visitors: { current: 0, previous: 0, percent: 0, sparkline: [] },
      cr: { current: 0, previous: 0, percent: 0 },
      bs: { current: 0, previous: 0, percent: 0 },
    };
  }

  // Helper to process metric with sparkline sum
  const processMetric = (metricKey: string) => {
    const rawSparklines = results.map((r) => r[metricKey]?.sparkline || []);

    const sparklines = mergeSparklines(rawSparklines);
    // Sum from sparklines for safety
    const current = sumBy(sparklines, "total");
    const previous = sumBy(results, `${metricKey}.previous`);

    return {
      current,
      previous,
      percent: 0,
      sparkline: sparklines,
    };
  };

  const aggregated = {
    sales: processMetric("sales"),
    orders: processMetric("orders"),
    visitors: processMetric("visitors"),
  };

  // Calculate derived metrics
  const totalOrders = aggregated.orders.current;
  const totalSales = aggregated.sales.current;
  const totalVisitors = aggregated.visitors.current;

  // Previous derived metrics
  const prevOrders = aggregated.orders.previous;
  const prevSales = aggregated.sales.previous;
  const prevVisitors = aggregated.visitors.previous;

  // For CR and BS, we aggregate sparklines using Average or Re-derive?
  // Use mergeSparklines 'average' for trend visualization
  return {
    ...aggregated,
    cr: {
      current: totalVisitors > 0 ? (totalOrders / totalVisitors) * 100 : 0,
      previous: prevVisitors > 0 ? (prevOrders / prevVisitors) * 100 : 0,
      percent: 0,
      sparkline: mergeSparklines(
        results.map((r) => r.cr?.sparkline || []),
        "average"
      ),
    },
    bs: {
      current: totalOrders > 0 ? totalSales / totalOrders : 0,
      previous: prevOrders > 0 ? prevSales / prevOrders : 0,
      percent: 0,
      sparkline: mergeSparklines(
        results.map((r) => r.bs?.sparkline || []),
        "average"
      ),
    },
  };
}

/**
 * Aggregate Chat Metrics from multiple stores
 */
/**
 * Aggregate Chat Metrics from multiple stores
 */
export function aggregateChatMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      total: { total: 0, sparkline: [] },
      replied: { total: 0, sparkline: [] },
      percent: { total: 0, sparkline: [] },
      buyers: { total: 0, sparkline: [] },
      sales: { total: 0, sparkline: [] },
      cr: { total: 0, sparkline: [] },
    };
  }

  // Helper to merge and sum from sparklines (More Robust than API total)
  const processMetric = (
    metricKey: string,
    type: "sum" | "average" = "sum"
  ) => {
    const sparklines = mergeSparklines(
      results.map((r) => r[metricKey]?.sparkline || []),
      type
    );

    // Calculate total from sparklines instead of trusting API "total" field
    // This fixes the issue where API returns 0 total but data exists in sparkline
    let total = 0;
    if (type === "sum") {
      total = sumBy(sparklines, "total");
    } else {
      // For average, we'll recalculate later or use avg of sparklines
      total =
        sparklines.length > 0
          ? sumBy(sparklines, "total") / sparklines.length
          : 0;
    }

    return { total, sparkline: sparklines };
  };

  const aggregated = {
    total: processMetric("total"),
    replied: processMetric("replied"),
    buyers: processMetric("buyers"),
    sales: processMetric("sales"),
    percent: processMetric("percent", "average"),
    cr: processMetric("cr", "average"),
  };

  // Recalculate Derived Metrics (Percent & CR) from Aggregated Totals
  // This ensures 100% accuracy: (Sum Replied / Sum Total) * 100
  const sumTotal = aggregated.total.total;
  const sumReplied = aggregated.replied.total;
  const sumBuyers = aggregated.buyers.total;

  const avgPercent = sumTotal > 0 ? (sumReplied / sumTotal) * 100 : 0;
  const avgCr = sumTotal > 0 ? (sumBuyers / sumTotal) * 100 : 0;

  return {
    ...aggregated,
    percent: {
      ...aggregated.percent,
      total: avgPercent,
    },
    cr: {
      ...aggregated.cr,
      total: avgCr,
    },
  };
}

/**
 * Aggregate Ads Metrics from multiple stores
 */
export function aggregateAdsMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      sales: { total: 0, sparkline: [] },
      cost: { total: 0, sparkline: [] },
      roas: { total: 0, sparkline: [] },
      impressions: { total: 0, sparkline: [] },
      ctr: { total: 0, sparkline: [] },
      cr: { total: 0, sparkline: [] },
    };
  }

  // Helper with robust sum from sparklines
  const processMetric = (
    metricKey: string,
    type: "sum" | "average" = "sum"
  ) => {
    const sparklines = mergeSparklines(
      results.map((r) => r[metricKey]?.sparkline || []),
      type
    );
    let total = 0;
    if (type === "sum") {
      total = sumBy(sparklines, "total");
    } else {
      total =
        sparklines.length > 0
          ? sumBy(sparklines, "total") / sparklines.length
          : 0;
    }
    return { total, sparkline: sparklines };
  };

  const aggregated = {
    sales: processMetric("sales"),
    cost: processMetric("cost"),
    impressions: processMetric("impressions"),
    roas: processMetric("roas", "average"),
    ctr: processMetric("ctr", "average"),
    cr: processMetric("cr", "average"),
  };

  return aggregated;
}
