/**
 * Enhanced Trend Chart Hook
 * -------------------------
 * Custom React Query hook untuk fetch sparkline data dari SEMUA indikator.
 * Digunakan oleh Enhanced Trend Chart dengan multi-indicator support.
 *
 * Features:
 * - 5 metrics sparklines (Penjualan, Pesanan, Pengunjung, CR, Basket Size)
 * - Daily granularity dari API
 * - Frontend aggregation ke weekly/monthly/quarterly
 * - Auto caching (5 menit)
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import { getTargetStores, buildPayload } from "@/utils/dashboardHelpers";
import type { TimeDataPoint } from "@/utils/timeAggregation";

// Tipe indikator yang tersedia
export type TrendIndicator =
  | "sales"
  | "orders"
  | "visitors"
  | "conversionRate"
  | "basketSize";

// Label untuk dropdown
export const indicatorLabels: Record<TrendIndicator, string> = {
  sales: "Penjualan",
  orders: "Pesanan",
  visitors: "Pengunjung",
  conversionRate: "Conversion Rate",
  basketSize: "Basket Size",
};

// Format untuk display value
export const indicatorFormats: Record<
  TrendIndicator,
  "currency" | "number" | "percent"
> = {
  sales: "currency",
  orders: "number",
  visitors: "number",
  conversionRate: "percent",
  basketSize: "currency",
};

// Return type
export interface EnhancedTrendData {
  sales: TimeDataPoint[];
  orders: TimeDataPoint[];
  visitors: TimeDataPoint[];
  conversionRate: TimeDataPoint[];
  basketSize: TimeDataPoint[];
}

/**
 * Fetch sparklines untuk single store
 */
async function fetchStoreSparklines(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
): Promise<EnhancedTrendData> {
  const payload = buildPayload(String(storeId), marketplaceId, dates);

  // Fetch all sparklines in parallel
  const [salesRes, ordersRes, visitorsRes, crRes, bsRes] = await Promise.all([
    api.dashboard.totalPenjualan(payload),
    api.dashboard.totalPesanan(payload),
    api.dashboard.totalPengunjung(payload),
    api.dashboard.conversionRate(payload),
    api.dashboard.basketSize(payload),
  ]);

  // Extract sparkline dari masing-masing response
  return {
    sales: salesRes.data?.data?.sparkline || [],
    orders: ordersRes.data?.data?.sparkline || [],
    visitors: visitorsRes.data?.data?.sparkline || [],
    conversionRate: crRes.data?.data?.sparkline || [],
    basketSize: bsRes.data?.data?.sparkline || [],
  };
}

/**
 * Aggregate multiple store sparklines
 */
function aggregateSparklines(results: EnhancedTrendData[]): EnhancedTrendData {
  if (results.length === 0) {
    return {
      sales: [],
      orders: [],
      visitors: [],
      conversionRate: [],
      basketSize: [],
    };
  }

  if (results.length === 1 && results[0]) {
    return results[0];
  }

  // Aggregate by date for each indicator
  const aggregateByDate = (datasets: TimeDataPoint[][]): TimeDataPoint[] => {
    const dateMap = new Map<string, number>();

    datasets.forEach((dataset) => {
      dataset.forEach((item) => {
        dateMap.set(
          item.tanggal,
          (dateMap.get(item.tanggal) || 0) + item.total
        );
      });
    });

    return Array.from(dateMap.entries())
      .map(([tanggal, total]) => ({ tanggal, total }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  };

  // Special aggregation for rate-based metrics (CR, BS) - use weighted average
  const aggregateRates = (
    datasets: TimeDataPoint[][],
    weightDatasets: TimeDataPoint[][]
  ): TimeDataPoint[] => {
    const dateMap = new Map<string, { sum: number; weight: number }>();

    datasets.forEach((dataset, idx) => {
      const weights = weightDatasets[idx] || [];
      dataset.forEach((item) => {
        const weight =
          weights.find((w) => w.tanggal === item.tanggal)?.total || 1;
        const existing = dateMap.get(item.tanggal) || { sum: 0, weight: 0 };
        existing.sum += item.total * weight;
        existing.weight += weight;
        dateMap.set(item.tanggal, existing);
      });
    });

    return Array.from(dateMap.entries())
      .map(([tanggal, { sum, weight }]) => ({
        tanggal,
        total: weight > 0 ? sum / weight : 0,
      }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  };

  return {
    sales: aggregateByDate(results.map((r) => r.sales)),
    orders: aggregateByDate(results.map((r) => r.orders)),
    visitors: aggregateByDate(results.map((r) => r.visitors)),
    // CR weighted by visitors
    conversionRate: aggregateRates(
      results.map((r) => r.conversionRate),
      results.map((r) => r.visitors)
    ),
    // BS weighted by orders
    basketSize: aggregateRates(
      results.map((r) => r.basketSize),
      results.map((r) => r.orders)
    ),
  };
}

/**
 * Custom hook untuk Enhanced Trend Chart
 */
export function useEnhancedTrendChart() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "enhanced-trend", store, dateRange, stores],

    queryFn: async (): Promise<EnhancedTrendData | null> => {
      const targetStores = getTargetStores(store, stores);

      if (targetStores.length === 0) {
        // Return empty data structure instead of null
        return {
          sales: [],
          orders: [],
          visitors: [],
          conversionRate: [],
          basketSize: [],
        };
      }

      const dates = {
        fromDate: dateRange?.startDate
          ? new Date(dateRange.startDate).toISOString().split("T")[0]
          : "",
        toDate: dateRange?.endDate
          ? new Date(dateRange.endDate).toISOString().split("T")[0]
          : "",
      };

      console.log(
        "DEBUG: Enhanced Trend Chart - fetching for stores:",
        targetStores.length,
        "dates:",
        dates
      );

      // Fetch all stores in parallel
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreSparklines(
            s.id!,
            s.marketplace_id || 1,
            dates as { fromDate: string; toDate: string }
          )
        )
      );

      // Aggregate if multi-store
      return aggregateSparklines(results);
    },

    enabled: !!dateRange?.startDate,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
