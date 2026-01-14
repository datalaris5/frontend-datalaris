import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import {
  getTargetStores,
  buildPayload,
  extractMetricData,
  aggregateMetrics,
} from "@/utils/dashboardHelpers";
import {
  Banknote,
  ShoppingCart,
  Percent,
  ShoppingBasket,
  UsersRound,
  UserPlus,
} from "lucide-react";
import { DashboardMetric } from "@/types/dashboard.types";
import { TimeDataPoint } from "@/utils/timeAggregation";

// === TYPES ===

export type OverviewTrendIndicator =
  | "sales"
  | "orders"
  | "visitors"
  | "conversionRate"
  | "basketSize";

export interface OverviewTrendData {
  sales: TimeDataPoint[];
  orders: TimeDataPoint[];
  visitors: TimeDataPoint[];
  conversionRate: TimeDataPoint[];
  basketSize: TimeDataPoint[];
}

export const indicatorLabels: Record<OverviewTrendIndicator, string> = {
  sales: "Penjualan",
  orders: "Pesanan",
  visitors: "Pengunjung",
  conversionRate: "Conversion Rate",
  basketSize: "Basket Size",
};

// Initial Metrics Config
const initialMetricsConfig: DashboardMetric[] = [
  {
    title: "Total Penjualan",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: Banknote,
    highlight: false,
    isDummy: false,
    color: "orange",
  },
  {
    title: "Total Pesanan",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: ShoppingCart,
    isDummy: false,
    color: "blue",
  },
  {
    title: "Convertion Rate",
    value: 0,
    format: "percent",
    trend: "0%",
    trendUp: false,
    data: [],
    icon: Percent,
    isDummy: false,
    color: "purple",
  },
  {
    title: "Basket Size",
    value: 0,
    format: "currency",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: ShoppingBasket,
    isDummy: false,
    color: "emerald",
  },
  {
    title: "Total Pengunjung",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: false,
    data: [],
    icon: UsersRound,
    isDummy: false,
    color: "cyan",
  },
  {
    title: "Pembeli Baru",
    value: 0,
    format: "number",
    trend: "0%",
    trendUp: true,
    data: [],
    icon: UserPlus,
    isDummy: true, // Not implemented yet
    color: "pink",
  },
];

/**
 * Helper to aggregate sparklines from multiple stores by date
 */
function aggregateSparklines(
  results: { [key in OverviewTrendIndicator]: TimeDataPoint[] }[]
): OverviewTrendData {
  if (results.length === 0) {
    return {
      sales: [],
      orders: [],
      visitors: [],
      conversionRate: [],
      basketSize: [],
    };
  }

  // Helper common aggregation
  const aggregateByDate = (datasets: TimeDataPoint[][]) => {
    const map = new Map<string, number>();
    datasets.flat().forEach((d) => {
      map.set(d.tanggal, (map.get(d.tanggal) || 0) + d.total);
    });
    return Array.from(map.entries())
      .map(([tanggal, total]) => ({ tanggal, total }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  };

  // Helper weighted average for rates
  const aggregateWeighted = (
    datasets: TimeDataPoint[][],
    weights: TimeDataPoint[][]
  ) => {
    const map = new Map<string, { sum: number; weight: number }>();
    datasets.forEach((ds, idx) => {
      const wDs = weights[idx] || [];
      ds.forEach((d) => {
        const w = wDs.find((x) => x.tanggal === d.tanggal)?.total || 1; // Default weight 1 if missing
        const entry = map.get(d.tanggal) || { sum: 0, weight: 0 };
        entry.sum += d.total * w;
        entry.weight += w;
        map.set(d.tanggal, entry);
      });
    });
    return Array.from(map.entries())
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
    conversionRate: aggregateWeighted(
      results.map((r) => r.conversionRate),
      results.map((r) => r.visitors)
    ),
    basketSize: aggregateWeighted(
      results.map((r) => r.basketSize),
      results.map((r) => r.orders)
    ),
  };
}

/**
 * Fetch data for a single store
 */
async function fetchStoreData(
  storeId: string | number,
  marketplaceId: number,
  dates: { fromDate: string; toDate: string }
) {
  const payload = buildPayload(storeId, marketplaceId, dates);

  // Parallel fetch ALL dashboard metrics
  const [salesRes, ordersRes, visitorsRes, crRes, bsRes] = await Promise.all([
    api.dashboard.totalPenjualan(payload),
    api.dashboard.totalPesanan(payload),
    api.dashboard.totalPengunjung(payload),
    api.dashboard.conversionRate(payload),
    api.dashboard.basketSize(payload),
  ]);

  const sales = extractMetricData(salesRes);
  const orders = extractMetricData(ordersRes);
  const visitors = extractMetricData(visitorsRes);
  const cr = extractMetricData(crRes);
  const bs = extractMetricData(bsRes);

  return {
    metrics: { sales, orders, visitors, cr, bs },
    sparklines: {
      sales: sales.sparkline,
      orders: orders.sparkline,
      visitors: visitors.sparkline,
      conversionRate: cr.sparkline,
      basketSize: bs.sparkline,
    },
  };
}

export const useOverviewData = () => {
  const { store, stores, dateRange } = useFilter();

  const query = useQuery({
    queryKey: ["dashboard", "overview", "consolidated", store, dateRange],
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
          trendData: {
            sales: [],
            orders: [],
            visitors: [],
            conversionRate: [],
            basketSize: [],
          },
        };
      }

      // 2. Fetch All Stores
      const results = await Promise.all(
        targetStores.map((s) =>
          fetchStoreData(s.id!, s.marketplace_id || 1, dates)
        )
      );

      // 3. Aggregate Metrics (Summary Cards)
      let aggregatedMetrics;
      if (results.length === 1) {
        aggregatedMetrics = results[0].metrics;
      } else {
        aggregatedMetrics = aggregateMetrics(results.map((r) => r.metrics));
      }

      // 4. Aggregate Trend Data (Chart)
      const trendData: OverviewTrendData = aggregateSparklines(
        results.map((r) => r.sparklines)
      );

      // 5. Map to DashboardMetric (Display)
      const newMetrics = [...initialMetricsConfig];

      const updateMetric = (idx: number, metricData: any, isRatio = false) => {
        if (newMetrics[idx]) {
          newMetrics[idx] = {
            ...newMetrics[idx],
            value: metricData.current,
            previousValue: metricData.previous,
            trend: `${(metricData.percent || 0).toFixed(1)}%`,
            trendUp: (metricData.percent || 0) >= 0,
            data: metricData.sparkline?.map((d: any) => Number(d.total)) || [],
            isDummy: false,
          };
        }
      };

      if (aggregatedMetrics.sales) updateMetric(0, aggregatedMetrics.sales);
      if (aggregatedMetrics.orders) updateMetric(1, aggregatedMetrics.orders);
      if (aggregatedMetrics.cr) updateMetric(2, aggregatedMetrics.cr, true);
      if (aggregatedMetrics.bs) updateMetric(3, aggregatedMetrics.bs);
      if (aggregatedMetrics.visitors)
        updateMetric(4, aggregatedMetrics.visitors);
      // Pembeli Baru (idx 5) remains dummy

      return {
        metrics: newMetrics,
        trendData,
      };
    },
    enabled: !!dateRange?.startDate && !!dateRange?.endDate,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: query.data?.metrics || initialMetricsConfig,
    trendData: query.data?.trendData,
    loading: query.isLoading,
    error: query.error,
  };
};
