/**
 * Operational Chart Data Hook
 * ---------------------------
 * Custom React Query hook untuk fetch data Analisa Operasional (Orders by Day of Week).
 *
 * UPDATED: Sekarang menggunakan backend API `total-pesanan/in-week` langsung
 * untuk aggregation yang lebih akurat (dilakukan di server).
 *
 * Features:
 * - Auto caching (5 menit)
 * - Auto retry on error
 * - Multi-store aggregation (handled by backend)
 */

import { useQuery } from "@tanstack/react-query";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import { getTargetStores, buildPayload } from "@/utils/dashboardHelpers";
import { format } from "date-fns";

interface DayOfWeekData {
  day: string;
  displayMonth: string;
  full: string;
  orders: number;
}

// Mapping hari dari backend ke format display
const dayMapping: Record<string, { short: string; full: string }> = {
  Senin: { short: "Sen", full: "Senin" },
  Selasa: { short: "Sel", full: "Selasa" },
  Rabu: { short: "Rab", full: "Rabu" },
  Kamis: { short: "Kam", full: "Kamis" },
  Jumat: { short: "Jum", full: "Jumat" },
  Sabtu: { short: "Sab", full: "Sabtu" },
  Minggu: { short: "Min", full: "Minggu" },
};

// Urutan hari untuk sorting
const dayOrder = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export function useOperationalChartData() {
  const { store, stores, dateRange } = useFilter();

  return useQuery({
    queryKey: ["dashboard", "overview", "operational-chart", store, dateRange],
    queryFn: async (): Promise<DayOfWeekData[]> => {
      const targetStores = getTargetStores(store, stores);
      if (targetStores.length === 0) return [];

      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";

      if (!fromDate || !toDate) return [];

      // Fetch dari backend API langsung
      // Jika multi-store, aggregate dari semua store
      const results = await Promise.all(
        targetStores.map(async (s) => {
          const payload = buildPayload(s.id!, s.marketplace_id || 1, {
            fromDate,
            toDate,
          });
          const response = await api.dashboard.totalPesananInWeek(payload);
          return (response.data?.data || []) as {
            day: string;
            total: number;
          }[];
        })
      );

      // Aggregate data dari semua stores by day
      const dayTotals: Record<string, number> = {};
      results.forEach((storeData) => {
        storeData.forEach((item) => {
          const day = item.day?.trim() || "";
          dayTotals[day] = (dayTotals[day] || 0) + (item.total || 0);
        });
      });

      // Convert ke format yang dibutuhkan chart
      const chartData: DayOfWeekData[] = dayOrder.map((day) => ({
        day,
        displayMonth: dayMapping[day]?.short || day.substring(0, 3),
        full: dayMapping[day]?.full || day,
        orders: dayTotals[day] || 0,
      }));

      return chartData;
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
