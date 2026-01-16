import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/services/api";
import { useFilter } from "@/context/FilterContext";
import { DashboardMetric } from "@/types/dashboard.types";
import {
  getTargetStores,
  buildPayload,
  mergeSparklines,
  aggregateChatMetrics,
} from "@/utils/dashboardHelpers";
import {
  MessageSquare,
  CheckCircle2,
  Percent,
  Clock,
  ShoppingCart,
  Users,
  UserCheck,
} from "lucide-react";

// === TYPES ===
export interface TimeDataPoint {
  tanggal: string;
  total: number;
}

export interface VolumeChartData {
  date: string;
  incoming: number;
  replied: number;
}

export interface ResponseTimeData {
  date: string;
  time: number;
}

export interface ChatMetricResult {
  total: { total: number; sparkline: TimeDataPoint[] };
  replied: { total: number; sparkline: TimeDataPoint[] };
  percent: { total: number; sparkline: TimeDataPoint[] };
  buyers: { total: number; sparkline: TimeDataPoint[] };
  sales: { total: number; sparkline: TimeDataPoint[] };
  cr: { total: number; sparkline: TimeDataPoint[] };
}

// Initial Metrics Configuration
const initialMetricsConfig: DashboardMetric[] = [
  {
    title: "Jumlah Chat",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: MessageSquare,
    color: "blue",
    highlight: true,
    isDummy: false,
  },
  {
    title: "Chat Dibalas",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: CheckCircle2,
    color: "emerald",
    isDummy: false,
  },
  {
    title: "Persentase Dibalas",
    value: 0,
    format: "percent",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Percent,
    color: "purple",
    isDummy: false,
  },
  {
    title: "Rata - Rata Waktu Respon",
    value: 0,
    format: "number",
    suffix: "m",
    trend: "0%",
    trendUp: false,
    data: [],
    icon: Clock,
    color: "orange",
    isDummy: false,
  },
  {
    title: "Conversion Rate",
    value: 0,
    format: "percent",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: ShoppingCart,
    color: "cyan",
    isDummy: false,
  },
  {
    title: "Estimasi Penjualan",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Users,
    color: "green",
    isDummy: false,
  },
  {
    title: "Total Pembeli",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: UserCheck,
    color: "pink",
    isDummy: false,
  },
];

/**
 * Fetch Chat metrics for a single store
 */
async function fetchStoreChatMetrics(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
): Promise<ChatMetricResult> {
  const payload = buildPayload(storeId, marketplaceId, dates);

  const [totalRes, repliedRes, percentRes, buyersRes, salesRes, crRes] =
    await Promise.all([
      api.chat.jumlahChat(payload),
      api.chat.chatDibalas(payload),
      api.chat.persentaseChat(payload),
      api.chat.totalPembeli(payload),
      api.chat.penjualan(payload),
      api.chat.conversionRate(payload),
    ]);

  return {
    total: totalRes.data?.data || { total: 0, sparkline: [] },
    replied: repliedRes.data?.data || { total: 0, sparkline: [] },
    percent: percentRes.data?.data || { total: 0, sparkline: [] },
    buyers: buyersRes.data?.data || { total: 0, sparkline: [] },
    sales: salesRes.data?.data || { total: 0, sparkline: [] },
    cr: crRes.data?.data || { total: 0, sparkline: [] },
  };
}

export const useChatData = () => {
  const { store, stores, dateRange } = useFilter();

  const query = useQuery({
    queryKey: ["dashboard", "chat", "consolidated", store, dateRange],
    queryFn: async () => {
      // 1. Target Stores & Dates
      const targetStores = getTargetStores(store, stores);
      const dates = {
        fromDate: dateRange?.startDate
          ? format(dateRange.startDate, "yyyy-MM-dd")
          : "",
        toDate: dateRange?.endDate
          ? format(dateRange.endDate, "yyyy-MM-dd")
          : "",
      };

      if (!dates.fromDate || !dates.toDate) {
        throw new Error("Invalid date range");
      }

      if (targetStores.length === 0) {
        return {
          metrics: initialMetricsConfig,
          volumeChartData: [],
        };
      }

      // 2. Fetch All Stores
      const results = await Promise.all(
        targetStores.map(async (s) => {
          try {
            return await fetchStoreChatMetrics(
              s.id!,
              s.marketplace_id || 1,
              dates
            );
          } catch (error) {
            console.warn(
              `Failed to fetch chat metrics for store ${s.id}:`,
              error
            );
            // Return empty result structure on error to prevent total failure
            return {
              total: { total: 0, sparkline: [] },
              replied: { total: 0, sparkline: [] },
              percent: { total: 0, sparkline: [] },
              buyers: { total: 0, sparkline: [] },
              sales: { total: 0, sparkline: [] },
              cr: { total: 0, sparkline: [] },
            };
          }
        })
      );

      // 3. Aggregate Data
      // Use standard helper for robust calculation (Total = Sum of Sparklines)
      const aggregatedData = aggregateChatMetrics(results);

      // 4. Update Metrics Config
      const metrics = [...initialMetricsConfig];
      const mapToMetric = (
        idx: number,
        val: number,
        sl: { tanggal: string; total: number }[]
      ) => {
        if (metrics[idx]) {
          metrics[idx] = {
            ...metrics[idx],
            value: val,
            data: sl.map((d) => d.total),
          };
        }
      };

      mapToMetric(
        0,
        aggregatedData.total.total,
        aggregatedData.total.sparkline
      );
      mapToMetric(
        1,
        aggregatedData.replied.total,
        aggregatedData.replied.sparkline
      );
      mapToMetric(
        2,
        aggregatedData.percent.total,
        aggregatedData.percent.sparkline
      );
      // idx 3 (Waktu Respon) dummy -> skip
      mapToMetric(
        3,
        aggregatedData.buyers.total,
        aggregatedData.buyers.sparkline
      );
      mapToMetric(
        4,
        aggregatedData.sales.total,
        aggregatedData.sales.sparkline
      );
      mapToMetric(5, aggregatedData.cr.total, aggregatedData.cr.sparkline);

      // 5. Build Volume Chart Data (Formatted for Daily view)
      const volumeChartData: VolumeChartData[] =
        aggregatedData.total.sparkline.map((item, idx) => {
          const repliedItem = aggregatedData.replied.sparkline[idx];
          return {
            date: item.tanggal
              ? format(new Date(item.tanggal), "dd MMM")
              : `Hari ${idx + 1}`,
            incoming: Number(item.total),
            replied: Number(repliedItem?.total || 0),
          };
        });

      // 5b. Expose Raw Data for Granularity Aggregation (Comprehensive Trend)
      const rawTrendData = aggregatedData.total.sparkline.map((item, idx) => {
        return {
          date: item.tanggal, // ISO 2024-01-01
          incoming: Number(item.total),
          replied: Number(aggregatedData.replied.sparkline[idx]?.total || 0),
          sales: Number(aggregatedData.sales.sparkline[idx]?.total || 0),
          buyers: Number(aggregatedData.buyers.sparkline[idx]?.total || 0),
          percent: Number(aggregatedData.percent.sparkline[idx]?.total || 0),
          cr: Number(aggregatedData.cr.sparkline[idx]?.total || 0),
        };
      });

      // 6. Fetch Response Time Data (Real API)
      const responseTimeResults = await Promise.all(
        targetStores.map((s) =>
          api.chat.avgWaktuResponInWeek(
            buildPayload(s.id!, s.marketplace_id || 1, dates)
          )
        )
      );

      // Helper to parse "HH:MM:SS"
      const parseIntervalToMinutes = (interval: string): number => {
        if (!interval || interval === "0" || interval === "00:00:00") return 0;
        const timeParts = interval.match(/(\d{2}):(\d{2}):(\d{2})/);
        if (timeParts) {
          const h = parseInt(timeParts[1], 10);
          const m = parseInt(timeParts[2], 10);
          return h * 60 + m;
        }
        return 0;
      };

      // Aggregate Response Time (Average per day across stores)
      const aggregatedResponseTime: ResponseTimeData[] = [];
      const daysMap = new Map<
        string,
        { totalMinutes: number; count: number }
      >();

      // Also collect raw data for granularity aggregation
      // Since API returns Day Name (Senin, etc), strict date mapping is hard without "sparkline" API.
      // For now, we will map results to rawResponseTimeData as best effort for "Daily" view.
      // NOTE: Real implementation should use a Sparkline API for Response Time if exact dates are needed.
      const rawResponseTimeData: any[] = [];

      // Initialize map with days from first result if exists
      if (responseTimeResults.length > 0 && responseTimeResults[0].data?.data) {
        responseTimeResults[0].data.data.forEach((item: any) => {
          daysMap.set(item.day, { totalMinutes: 0, count: 0 });
        });
      }

      responseTimeResults.forEach((res) => {
        const data = res.data?.data;
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const minutes = parseIntervalToMinutes(item.total);

            // Aggregation for Bar Chart
            const current = daysMap.get(item.day) || {
              totalMinutes: 0,
              count: 0,
            };
            daysMap.set(item.day, {
              totalMinutes: current.totalMinutes + minutes,
              count: current.count + 1,
            });

            // Raw Data for Granularity Aggregation
            // Note: We map "Senin" etc to "date" here.
            // The functionality depends on aggregateData handling day names or specific dates.
            rawResponseTimeData.push({
              date: item.day,
              value: minutes,
            });
          });
        }
      });

      // Convert map back to array
      if (responseTimeResults.length > 0 && responseTimeResults[0].data?.data) {
        // Use predefined order if possible, or source order
        const sourceDays = responseTimeResults[0].data.data.map(
          (d: any) => d.day
        );
        const uniqueDays = Array.from(new Set(sourceDays)); // preserve order

        uniqueDays.forEach((day: any) => {
          const agg = daysMap.get(day);
          if (agg) {
            const avg = agg.count > 0 ? agg.totalMinutes / agg.count : 0;
            aggregatedResponseTime.push({
              date: day,
              time: Number(avg.toFixed(1)),
            });
          }
        });
      }

      return {
        metrics, // Fixed name (was newMetrics)
        volumeChartData,
        rawTrendData,
        responseTimeData: aggregatedResponseTime,
        rawResponseTimeData,
      };
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: query.data?.metrics || initialMetricsConfig,
    volumeChartData: query.data?.volumeChartData || [],
    rawTrendData: query.data?.rawTrendData || [],
    responseTimeData: query.data?.responseTimeData || [],
    rawResponseTimeData: query.data?.rawResponseTimeData || [],
    loading: query.isLoading,
    error: query.error,
  };
};
