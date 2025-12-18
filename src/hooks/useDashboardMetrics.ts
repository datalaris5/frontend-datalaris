/**
 * Dashboard Overview Metrics Hook
 * --------------------------------
 * Custom React Query hook untuk fetch dan aggregate dashboard metrics.
 *
 * Features:
 * - Auto caching (5 menit)
 * - Auto retry on error
 * - Single store & multi-store aggregation
 * - Loading & error states
 *
 * Usage:
 * const { data, isLoading, error } = useDashboardMetrics();
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import {
  getTargetStores,
  formatDateRange,
  buildPayload,
  extractMetricData,
  aggregateMetrics,
} from "@/utils/dashboardHelpers";

/**
 * Fetch metrics untuk single store
 */
async function fetchStoreMetrics(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
) {
  const payload = buildPayload(storeId, marketplaceId, dates);

  // Fetch all metrics in parallel
  const [salesRes, ordersRes, visitorsRes, crRes, bsRes] = await Promise.all([
    api.dashboard.totalPenjualan(payload),
    api.dashboard.totalPesanan(payload),
    api.dashboard.totalPengunjung(payload),
    api.dashboard.conversionRate(payload),
    api.dashboard.basketSize(payload),
  ]);

  return {
    sales: extractMetricData(salesRes),
    orders: extractMetricData(ordersRes),
    visitors: extractMetricData(visitorsRes),
    cr: extractMetricData(crRes),
    bs: extractMetricData(bsRes),
  };
}

/**
 * Custom hook untuk Dashboard Overview metrics
 * Handles single store dan multi-store aggregation
 */
export function useDashboardMetrics() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    // Query key untuk caching (unique per store + dateRange + stores list)
    // Add stores to dependency to refetch when stores are loaded
    queryKey: ["dashboard", "overview", "metrics", store, dateRange, stores],

    // Fetch function
    queryFn: async () => {
      const targetStores = getTargetStores(store, stores);

      if (targetStores.length === 0) {
        return null;
      }

      const dates = formatDateRange(dateRange);

      // Fetch all stores in parallel
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreMetrics(s.id!, s.marketplace_id || 1, dates)
        )
      );

      // Single store: return as is
      if (results.length === 1) {
        return results[0];
      }

      // Multi-store: aggregate dengan lodash
      return aggregateMetrics(results);
    },

    // Only run if dateRange is set
    enabled: !!dateRange?.startDate,
  });
}
