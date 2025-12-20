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
import { format, eachDayOfInterval } from "date-fns";

interface DayOfWeekData {
  day: string;
  dayLabel: string; // Renamed from displayMonth for clarity
  full: string;
  orders: number;
  average: number;
  count: number;
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

      // Calculate sample size (counts of each day in date range)
      const startDateObj = dateRange?.startDate;
      const endDateObj = dateRange?.endDate;
      const dayCounts: Record<string, number> = {};

      if (startDateObj && endDateObj) {
        const _interval = { start: startDateObj, end: endDateObj };
        try {
          const daysInInterval = eachDayOfInterval(_interval);
          daysInInterval.forEach((date) => {
            // date-fns format 'eeee' returns 'Monday', 'Tuesday' etc in English locale usually,
            // but we need to match backend 'Senin', 'Selasa'.
            // Simplest way: use backend mapping logic or standard JS Day Index.
            // Backend output seems to be 'Senin', 'Selasa' etc.
            // Let's rely on standard JS getDay() and map to our keys.
            const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday
            const dayNames = [
              "Minggu",
              "Senin",
              "Selasa",
              "Rabu",
              "Kamis",
              "Jumat",
              "Sabtu",
            ];
            const dayName = dayNames[dayIndex];
            dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
          });
        } catch (e) {
          console.error("Error calculating day counts", e);
        }
      }

      // Convert ke format yang dibutuhkan chart
      const chartData: DayOfWeekData[] = dayOrder.map((day) => {
        const total = dayTotals[day] || 0;
        const count = dayCounts[day] || 1; // Avoid div by zero, though unlikely if range is valid
        const average = count > 0 ? Math.round(total / count) : 0;

        return {
          day,
          dayLabel: dayMapping[day]?.short || day.substring(0, 3),
          full: dayMapping[day]?.full || day,
          orders: total, // Revert to TOTAL (Sum)
          average: average, // Keep average as secondary data
          count: count,
        };
      });

      return chartData;
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
