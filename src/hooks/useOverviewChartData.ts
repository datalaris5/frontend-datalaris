/**
 * Overview Chart Data Hook
 * -------------------------
 * Custom React Query hook untuk fetch chart data (full year).
 *
 * Data yang di-fetch:
 * - Total Penjualan sparkline (full year)
 * - Total Pesanan sparkline (full year)
 *
 * Features:
 * - Auto caching (5 menit)
 * - Auto retry on error
 * - Single store & multi-store aggregation
 * - Month skeleton generation
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import { getTargetStores, buildPayload } from "@/utils/dashboardHelpers";
import { format, startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ChartDataPoint {
  originalDate?: Date;
  monthKey: string;
  displayMonth: string;
  sales: number;
  orders: number;
  basketSize: number;
}

/**
 * Fetch chart data untuk single store
 */
async function fetchStoreChartData(
  storeId: string | number,
  marketplaceId: number,
  startDate: string,
  endDate: string
) {
  // Use buildPayload helper untuk consistency dengan metrics
  const payload = buildPayload(storeId, marketplaceId, {
    fromDate: startDate,
    toDate: endDate,
  });

  const [salesRes, ordersRes] = await Promise.all([
    api.dashboard.totalPenjualan(payload),
    api.dashboard.totalPesanan(payload),
  ]);

  return {
    sales: salesRes.data?.data?.sparkline || [],
    orders: ordersRes.data?.data?.sparkline || [],
    // Return raw sparkline for operational chart (avoid double fetch)
    rawSalesSparkline: salesRes.data?.data?.sparkline || [],
    rawOrdersSparkline: ordersRes.data?.data?.sparkline || [],
  };
}

/**
 * Custom hook untuk Overview Chart Data
 */
export function useOverviewChartData() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "overview", "charts", store, dateRange],
    queryFn: async () => {
      const targetDate = dateRange?.endDate || new Date();
      const startOfYearDate = format(startOfYear(targetDate), "yyyy-MM-dd");
      const endOfYearDate = format(endOfYear(targetDate), "yyyy-MM-dd");

      // Generate month skeleton
      const monthsSkeleton: ChartDataPoint[] = eachMonthOfInterval({
        start: startOfYear(targetDate),
        end: endOfYear(targetDate),
      }).map((date) => ({
        originalDate: date,
        monthKey: format(date, "MMM yyyy", { locale: idLocale }),
        displayMonth: format(date, "MMM", { locale: idLocale }),
        sales: 0,
        orders: 0,
        basketSize: 0,
      }));

      const targetStores = getTargetStores(store, stores);
      if (targetStores.length === 0) {
        return monthsSkeleton; // Return empty skeleton
      }

      // Fetch all stores in parallel
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreChartData(
            s.id!,
            s.marketplace_id || 1,
            startOfYearDate,
            endOfYearDate
          )
        )
      );

      // Aggregate sparkline data ke monthly data
      results.forEach((res) => {
        res.sales.forEach((item: any) => {
          // API returns tanggal as "2024-01-15" or "Jan 2024"
          let monthKey = item.tanggal;

          // If tanggal is in date format (2024-01-15), convert to monthKey
          if (item.tanggal && item.tanggal.includes("-")) {
            try {
              const parsedDate = new Date(item.tanggal);
              monthKey = format(parsedDate, "MMM yyyy", { locale: idLocale });
            } catch {
              monthKey = item.tanggal;
            }
          }

          const monthMatch = monthsSkeleton.find(
            (m) => m.monthKey === monthKey
          );
          if (monthMatch) {
            monthMatch.sales += Number(item.total || 0);
          }
        });

        res.orders.forEach((item: any) => {
          // API returns tanggal as "2024-01-15" or "Jan 2024"
          let monthKey = item.tanggal;

          // If tanggal is in date format (2024-01-15), convert to monthKey
          if (item.tanggal && item.tanggal.includes("-")) {
            try {
              const parsedDate = new Date(item.tanggal);
              monthKey = format(parsedDate, "MMM yyyy", { locale: idLocale });
            } catch {
              monthKey = item.tanggal;
            }
          }

          const monthMatch = monthsSkeleton.find(
            (m) => m.monthKey === monthKey
          );
          if (monthMatch) {
            monthMatch.orders += Number(item.total || 0);
          }
        });
      });

      // Calculate basket size
      monthsSkeleton.forEach((month) => {
        month.basketSize = month.orders > 0 ? month.sales / month.orders : 0;
      });

      return monthsSkeleton;
    },
    enabled: !!dateRange?.endDate, // Removed stores.length check
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
