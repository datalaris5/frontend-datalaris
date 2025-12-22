/**
 * YoY Growth Hook
 * ---------------
 * Custom React Query hook untuk fetch Year-over-Year growth data.
 *
 * CATATAN: Backend API belum diimplementasi.
 * Endpoint: POST /admin/dashboard-tinjauan/yoy-growth
 * Lihat BACKEND_ISSUES.md -> FEAT-001 untuk spec lengkap.
 *
 * Features:
 * - Graceful error handling (return empty state)
 * - Auto caching (5 menit)
 * - Ready for backend implementation
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import { getTargetStores } from "@/utils/dashboardHelpers";

export interface YoYMetric {
  month: string;
  monthNum: number;
  currentValue: number;
  previousValue: number;
  growthPercent: number;
}

export interface YoYGrowthData {
  currentYear: number;
  previousYear: number;
  hasPreviousYearData: boolean;
  metrics: YoYMetric[];
  summary: {
    totalCurrent: number;
    totalPrevious: number;
    overallGrowthPercent: number;
  };
}

export function useYoYGrowth() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "overview", "yoy-growth", store, dateRange],
    queryFn: async (): Promise<YoYGrowthData | null> => {
      const targetStores = getTargetStores(store, stores);
      if (targetStores.length === 0) return null;

      // Get current year from dateRange
      const currentYear = dateRange?.endDate
        ? new Date(dateRange.endDate).getFullYear()
        : new Date().getFullYear();

      try {
        // Attempt to call the API (will fail until backend implements it)
        const firstStore = targetStores[0];
        if (!firstStore) return null;

        const payload = {
          store_id: Number(firstStore.id),
          marketplace_id: firstStore.marketplace_id || 1,
          year: currentYear,
        };

        const response = await api.dashboard.yoyGrowth(payload);
        const data = response.data?.data;

        if (!data) return null;

        return {
          currentYear: data.current_year,
          previousYear: data.previous_year,
          hasPreviousYearData: data.has_previous_year_data ?? false,
          metrics: (data.metrics || []).map((m: any, idx: number) => ({
            month: m.month,
            monthNum: idx + 1,
            currentValue: m.current_value || 0,
            previousValue: m.previous_value || 0,
            growthPercent: m.growth_percent || 0,
          })),
          summary: {
            totalCurrent: data.summary?.total_current || 0,
            totalPrevious: data.summary?.total_previous || 0,
            overallGrowthPercent: data.summary?.overall_growth_percent || 0,
          },
        };
      } catch (error) {
        // API not implemented yet - return null for empty state
        console.log("YoY Growth API not implemented yet:", error);
        return null;
      }
    },
    enabled: !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if API doesn't exist
  });
}
