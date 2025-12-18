/**
 * Operational Chart Data Hook
 * ---------------------------
 * Custom React Query hook untuk fetch data Analisa Operasional (Orders by Day of Week).
 *
 * Features:
 * - Auto caching (5 menit)
 * - Auto retry on error
 * - Multi-store aggregation
 * - Aggregates daily sparkline data into Day of Week (Mon-Sun)
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import { getTargetStores, buildPayload } from "@/utils/dashboardHelpers";
import { aggregateByDayOfWeek } from "@/utils/chartUtils";
import { format } from "date-fns";
import { SparklineItem } from "@/types/dashboard.types";

export function useOperationalChartData() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "overview", "operational-chart", store, dateRange],
    queryFn: async () => {
      const targetStores = getTargetStores(store, stores);
      if (targetStores.length === 0) return [];

      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";

      if (!fromDate || !toDate) return [];

      // Fetch daily orders for each store
      const results = await Promise.all(
        targetStores.map(async (s) => {
          const payload = buildPayload(s.id!, s.marketplace_id || 1, {
            fromDate,
            toDate,
          });
          const ordersRes = await api.dashboard.totalPesanan(payload);
          return (ordersRes.data?.data?.sparkline as SparklineItem[]) || [];
        })
      );

      // Merge all daily sparkline data from all stores
      let allDailyOrders: SparklineItem[] = [];
      results.forEach((sparkline) => {
        if (sparkline && sparkline.length > 0) {
          allDailyOrders = [...allDailyOrders, ...sparkline];
        }
      });

      // Aggregate by day of week
      return aggregateByDayOfWeek(allDailyOrders);
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
