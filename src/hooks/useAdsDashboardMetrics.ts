/**
 * Ads Dashboard Metrics Hook
 * ---------------------------
 * Custom React Query hook untuk fetch dan aggregate ads metrics.
 *
 * Metrics:
 * - Total Penjualan (adSales)
 * - Total Biaya Iklan (adCost)
 * - ROAS
 * - Total Dilihat (impressions)
 * - Persentase Klik (CTR)
 * - Conversion Rate
 *
 * Features:
 * - Auto caching (5 menit)
 * - Auto retry on error
 * - Single store & multi-store aggregation
 * - Loading & error states
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import {
  getTargetStores,
  formatDateRange,
  buildPayload,
  extractMetricData,
} from "@/utils/dashboardHelpers";
import { sumBy } from "lodash";

/**
 * Fetch ads metrics untuk single store
 */
async function fetchStoreAdsMetrics(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
) {
  const payload = buildPayload(storeId, marketplaceId, dates);

  // Fetch all ads metrics in parallel
  const [salesRes, costRes, roasRes, impressionsRes, ctrRes, crRes] =
    await Promise.all([
      api.ads.penjualanIklan(payload),
      api.ads.biayaIklan(payload),
      api.ads.totalRoas(payload),
      api.ads.dilihat(payload),
      api.ads.presentaseKlik(payload),
      api.ads.convertionRate(payload),
    ]);

  return {
    sales: extractMetricData(salesRes),
    cost: extractMetricData(costRes),
    roas: extractMetricData(roasRes),
    impressions: extractMetricData(impressionsRes),
    ctr: extractMetricData(ctrRes),
    cr: extractMetricData(crRes),
  };
}

/**
 * Aggregate ads metrics from multiple stores
 */
function aggregateAdsMetrics(results: any[]) {
  if (results.length === 0) {
    return {
      sales: { current: 0, percent: 0, sparkline: [] },
      cost: { current: 0, percent: 0, sparkline: [] },
      roas: { current: 0, percent: 0, sparkline: [] },
      impressions: { current: 0, percent: 0, sparkline: [] },
      ctr: { current: 0, percent: 0, sparkline: [] },
      cr: { current: 0, percent: 0, sparkline: [] },
    };
  }

  const totalSales = sumBy(results, "sales.current");
  const totalCost = sumBy(results, "cost.current");
  const totalImpressions = sumBy(results, "impressions.current");
  const totalCr = sumBy(results, "cr.current") / results.length; // Average
  const totalCtr = sumBy(results, "ctr.current") / results.length; // Average

  return {
    sales: {
      current: totalSales,
      percent: 0, // Multi-store tidak ada percent comparison
      sparkline: [],
    },
    cost: {
      current: totalCost,
      percent: 0,
      sparkline: [],
    },
    roas: {
      current: totalCost > 0 ? totalSales / totalCost : 0,
      percent: 0,
      sparkline: [],
    },
    impressions: {
      current: totalImpressions,
      percent: 0,
      sparkline: [],
    },
    ctr: {
      current: totalCtr,
      percent: 0,
      sparkline: [],
    },
    cr: {
      current: totalCr,
      percent: 0,
      sparkline: [],
    },
  };
}

/**
 * Custom hook untuk Ads Dashboard metrics
 */
export function useAdsDashboardMetrics() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "ads", "metrics", store, dateRange],
    queryFn: async () => {
      const targetStores = getTargetStores(store, stores);

      if (targetStores.length === 0) {
        return null;
      }

      const dates = formatDateRange(dateRange);

      // Fetch all stores in parallel
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreAdsMetrics(s.id!, s.marketplace_id || 1, dates)
        )
      );

      // Single store: return as is
      if (results.length === 1) {
        return results[0];
      }

      // Multi-store: aggregate
      return aggregateAdsMetrics(results);
    },
    enabled: !!dateRange?.startDate && stores.length > 0,
  });
}
