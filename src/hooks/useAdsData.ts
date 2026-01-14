import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/services/api";
import { useFilter } from "@/context/FilterContext";
import { DashboardMetric } from "@/types/dashboard.types";
import {
  getTargetStores,
  buildPayload,
  mergeSparklines,
} from "@/utils/dashboardHelpers";
import {
  TrendingUp,
  DollarSign,
  Target,
  Eye,
  MousePointer,
} from "lucide-react";

// === TYPES ===
export interface TimeDataPoint {
  tanggal: string;
  total: number;
}

export interface AdsChartData {
  sales: TimeDataPoint[];
  cost: TimeDataPoint[];
  roas: TimeDataPoint[];
  impressions: TimeDataPoint[];
  ctr: TimeDataPoint[];
  cr: TimeDataPoint[];
}

// Initial Metrics Configuration
const initialMetricsConfig: DashboardMetric[] = [
  {
    title: "Total Penjualan",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: TrendingUp,
    highlight: false,
    isDummy: false,
    color: "blue",
  },
  {
    title: "Total Biaya Iklan",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: DollarSign,
    highlight: false,
    isDummy: false,
    color: "orange",
  },
  {
    title: "ROAS",
    value: 0,
    format: "number",
    suffix: "x",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Target,
    isDummy: false,
    color: "purple",
  },
  {
    title: "AOV Iklan",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Target,
    isDummy: true,
    color: "blue",
  },
  {
    title: "Total Dilihat",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Eye,
    isDummy: false,
    color: "pink",
  },
  {
    title: "Persentase Klik (CTR)",
    value: 0,
    format: "percent",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: MousePointer,
    isDummy: false,
    color: "cyan",
  },
  {
    title: "Convertion Rate",
    value: 0,
    format: "percent",
    trend: "0%",
    trendUp: false,
    data: [],
    icon: MousePointer,
    isDummy: false,
    color: "emerald",
  },
  {
    title: "CPA (Cost/Conv)",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: DollarSign,
    isDummy: true,
    color: "orange",
  },
];

interface AdsMetricResult {
  sales: { total: number; sparkline: TimeDataPoint[] };
  cost: { total: number; sparkline: TimeDataPoint[] };
  roas: { total: number; sparkline: TimeDataPoint[] };
  impressions: { total: number; sparkline: TimeDataPoint[] };
  ctr: { total: number; sparkline: TimeDataPoint[] };
  cr: { total: number; sparkline: TimeDataPoint[] };
}

/**
 * Fetch Ads metrics for a single store
 */
async function fetchStoreAdsMetrics(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
): Promise<AdsMetricResult> {
  const payload = buildPayload(storeId, marketplaceId, dates);

  const [salesRes, costRes, roasRes, impRes, ctrRes, crRes] = await Promise.all(
    [
      api.ads.sparkline({ ...payload, metric: "gross_sales" }),
      api.ads.sparkline({ ...payload, metric: "cost" }),
      api.ads.sparkline({ ...payload, metric: "roas" }),
      api.ads.sparkline({ ...payload, metric: "impression" }),
      api.ads.sparkline({ ...payload, metric: "ctr" }),
      api.ads.sparkline({ ...payload, metric: "conversation_rate" }),
    ]
  );

  return {
    sales: salesRes.data?.data || { total: 0, sparkline: [] },
    cost: costRes.data?.data || { total: 0, sparkline: [] },
    roas: roasRes.data?.data || { total: 0, sparkline: [] },
    impressions: impRes.data?.data || { total: 0, sparkline: [] },
    ctr: ctrRes.data?.data || { total: 0, sparkline: [] },
    cr: crRes.data?.data || { total: 0, sparkline: [] },
  };
}

export const useAdsData = () => {
  const { store, stores, dateRange } = useFilter();

  const query = useQuery({
    queryKey: ["dashboard", "ads", "strict", store, dateRange],
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

      // 2. Fetch All Stores
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreAdsMetrics(s.id!, s.marketplace_id || 1, dates)
        )
      );

      // 3. Aggregate Data (Sum/Avg)
      // Helper specific for Ads aggregation
      const salesSparklines = results.map((r) => r.sales.sparkline);
      const costSparklines = results.map((r) => r.cost.sparkline);
      const roasSparklines = results.map((r) => r.roas.sparkline);
      const impSparklines = results.map((r) => r.impressions.sparkline);
      const ctrSparklines = results.map((r) => r.ctr.sparkline);
      const crSparklines = results.map((r) => r.cr.sparkline);

      const aggregatedData: AdsChartData = {
        sales: mergeSparklines(salesSparklines),
        cost: mergeSparklines(costSparklines),
        roas: mergeSparklines(roasSparklines, "average"),
        impressions: mergeSparklines(impSparklines),
        ctr: mergeSparklines(ctrSparklines, "average"),
        cr: mergeSparklines(crSparklines, "average"),
      };

      // Calculate Totals
      const totals = {
        sales: results.reduce((acc, curr) => acc + Number(curr.sales.total), 0),
        cost: results.reduce((acc, curr) => acc + Number(curr.cost.total), 0),
        impressions: results.reduce(
          (acc, curr) => acc + Number(curr.impressions.total),
          0
        ),
        // Weighted Averages/Direct Avg for rates (Simplified for now)
        // Ideally should be recalculated from totals but following API "total" property pattern
        roas:
          results.length > 0
            ? results.reduce((acc, curr) => acc + Number(curr.roas.total), 0) /
              results.length
            : 0,
        ctr:
          results.length > 0
            ? results.reduce((acc, curr) => acc + Number(curr.ctr.total), 0) /
              results.length
            : 0,
        cr:
          results.length > 0
            ? results.reduce((acc, curr) => acc + Number(curr.cr.total), 0) /
              results.length
            : 0,
      };

      // 4. Transform to DashboardMetrics
      const metrics = [...initialMetricsConfig];
      const mapToMetric = (idx: number, val: number, sl: TimeDataPoint[]) => {
        if (metrics[idx]) {
          metrics[idx] = {
            ...metrics[idx],
            value: val,
            data: sl.map((d) => Number(d.total)),
          };
        }
      };

      mapToMetric(0, totals.sales, aggregatedData.sales);
      mapToMetric(1, totals.cost, aggregatedData.cost);
      mapToMetric(2, totals.roas, aggregatedData.roas);
      // Skip AOV (idx 3)
      mapToMetric(4, totals.impressions, aggregatedData.impressions);
      mapToMetric(5, totals.ctr, aggregatedData.ctr);
      mapToMetric(6, totals.cr, aggregatedData.cr);

      return {
        metrics,
        chartData: aggregatedData,
      };
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: query.data?.metrics || initialMetricsConfig,
    chartData: query.data?.chartData,
    loading: query.isLoading,
  };
};
