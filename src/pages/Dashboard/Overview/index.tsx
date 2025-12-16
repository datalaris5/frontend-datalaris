/**
 * Dashboard Overview
 * ------------------
 * Halaman utama dashboard dengan ringkasan performa toko.
 *
 * Metrik Utama (6 cards):
 * - Total Penjualan, Total Pesanan, Convertion Rate
 * - Basket Size, Total Pengunjung, Produk Terjual
 *
 * Charts:
 * - Analisa Tren (Area Chart) - Monthly/Quarterly toggle
 * - Analisa Operasional (Bar Chart) - Orders by day of week
 *
 * Data Flow:
 * 1. Metrics fetch berdasarkan filter (store + dateRange)
 * 2. Chart fetch untuk full year aggregation
 * 3. Multi-store aggregation jika store="all"
 */

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Banknote,
  ShoppingCart,
  Percent,
  ShoppingBasket,
  UsersRound,
  UserPlus,
  Upload,
  Trophy,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import {
  format,
  parseISO,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import ChartTooltip from "@/components/common/ChartTooltip";
import {
  calculateMoMGrowth,
  calculateBasketSize,
  aggregateByQuarter,
  aggregateByDayOfWeek,
  formatAxisValue,
} from "@/utils/chartUtils";
import { chartColors, chartUI, chartGradients } from "@/config/chartTheme";
import TabToggle from "@/components/ui/TabToggle";

// Shared Components
import { MetricCard, InsightBanner } from "@/components/dashboard";
import type {
  DashboardMetric,
  SparklineItem,
  MetricData,
  SalesDataPoint,
  OrdersDayDataPoint,
  StoreItem,
} from "@/types/dashboard.types";
import { semanticStatusThemes } from "@/types/dashboard.types";

// Chart data key type
type ChartDataKey = "sales" | "orders" | "basketSize";

// === MAIN COMPONENT ===

const DashboardOverview: React.FC = () => {
  const { store, stores, dateRange, marketplaces } = useFilter(); // markets needed for debug if any

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Chart state
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [salesViewMode, setSalesViewMode] = useState<"monthly" | "quarterly">(
    "monthly"
  );
  const [activeChartTab, setActiveChartTab] = useState<ChartDataKey>("sales");
  const [ordersDayData, setOrdersDayData] = useState<OrdersDayDataPoint[]>([]);
  const [rawMonthlyData, setRawMonthlyData] = useState<SalesDataPoint[]>([]);

  // Metrics state
  const [metrics, setMetrics] = useState<DashboardMetric[]>([
    {
      title: "Total Penjualan",
      value: 0,
      format: "currency",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: Banknote,
      highlight: false, // Unified glass - no solid highlight
      isDummy: false,
      color: "teal", // Primary KPI accent
    },
    {
      title: "Total Pesanan",
      value: 0,
      format: "number",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: UserPlus,
      isDummy: true, // API endpoint belum tersedia
      color: "pink",
    },
  ]);

  // Helper: merge sparklines untuk multi-store
  const mergeSparklines = (
    base: SparklineItem[],
    incoming: SparklineItem[]
  ): SparklineItem[] => {
    if (!incoming || incoming.length === 0) return base;
    if (!base || base.length === 0) return incoming.map((i) => ({ ...i }));
    const incomingMap = new Map(incoming.map((i) => [i.tanggal, i]));
    return base.map((b) => {
      const inc = incomingMap.get(b.tanggal) || {
        total: 0,
        tanggal: b.tanggal,
      };
      return { ...b, total: Number(b.total) + Number(inc.total) };
    });
  };

  // 1. Fetch METRICS Data
  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const fromDate = dateRange?.startDate
          ? format(dateRange.startDate, "yyyy-MM-dd")
          : "";
        const toDate = dateRange?.endDate
          ? format(dateRange.endDate, "yyyy-MM-dd")
          : "";

        let targetStores: StoreItem[] = [];
        if (store === "all") {
          targetStores = stores.filter((s: StoreItem) => s && s.id);
        } else {
          // Find full store object to get marketplace_id
          const selectedStore = stores.find(
            (s) => s.id.toString() === store.toString()
          );
          if (selectedStore) {
            targetStores = [selectedStore];
          }
        }

        if (targetStores.length === 0) {
          setLoading(false);
          return;
        }

        const fetchStoreMetrics = async (
          id: string | number,
          marketplaceId: number
        ) => {
          const payload = {
            store_id: id,
            date_from: fromDate,
            date_to: toDate,
            marketplace_id: marketplaceId,
          };
          const [salesRes, ordersRes, visitorsRes, crRes, bsRes] =
            await Promise.all([
              api.dashboard.totalPenjualan(payload),
              api.dashboard.totalPesanan(payload),
              api.dashboard.totalPengunjung(payload),
              api.dashboard.conversionRate(payload),
              api.dashboard.basketSize(payload),
            ]);

          const extract = (res: any): MetricData => ({
            current: Number(res.data?.data?.total || 0),
            percent: Number(res.data?.data?.percent || 0),
            trend: res.data?.data?.trend || "Equal",
            sparkline: res.data?.data?.sparkline || [],
          });

          return {
            sales: extract(salesRes),
            orders: extract(ordersRes),
            visitors: extract(visitorsRes),
            cr: extract(crRes),
            bs: extract(bsRes),
          };
        };

        if (store !== "all" && targetStores.length === 1) {
          const currentStore = targetStores[0];
          const res = await fetchStoreMetrics(
            currentStore.id!,
            currentStore.marketplace_id!
          );
          setMetrics((prev) => {
            const newMetrics = [...prev];
            const update = (
              idx: number,
              dataObj: MetricData,
              fmt: "currency" | "number" | "percent",
              isDummy = false
            ) => {
              newMetrics[idx] = {
                ...newMetrics[idx],
                value: dataObj.current,
                format: fmt,
                trend: isDummy ? "0%" : `${dataObj.percent.toFixed(1)}%`,
                trendUp: dataObj.percent >= 0,
                data:
                  dataObj.sparkline.length > 0
                    ? dataObj.sparkline.map((d) => Number(d.total))
                    : [0, 0, 0, 0, 0, 0, 0],
                isDummy,
              };
            };
            update(0, res.sales, "currency");
            update(1, res.orders, "number");
            update(2, res.cr, "percent");
            update(3, res.bs, "currency");
            update(4, res.visitors, "number");
            return newMetrics;
          });
        } else {
          // Multi-store aggregation
          const results = await Promise.all(
            targetStores.map((s) =>
              fetchStoreMetrics(s.id!, s.marketplace_id || 1)
            )
          );

          let aggSales: MetricData = {
            current: 0,
            percent: 0,
            trend: "",
            sparkline: [],
          };
          let aggOrders: MetricData = {
            current: 0,
            percent: 0,
            trend: "",
            sparkline: [],
          };
          let aggVisitors: MetricData = {
            current: 0,
            percent: 0,
            trend: "",
            sparkline: [],
          };
          let aggCR: MetricData = {
            current: 0,
            percent: 0,
            trend: "",
            sparkline: [],
          };
          let aggBS: MetricData = {
            current: 0,
            percent: 0,
            trend: "",
            sparkline: [],
          };

          results.forEach((res, idx) => {
            aggSales.current += res.sales.current;
            aggOrders.current += res.orders.current;
            aggVisitors.current += res.visitors.current;

            if (idx === 0) {
              aggSales.sparkline = res.sales.sparkline;
              aggOrders.sparkline = res.orders.sparkline;
              aggVisitors.sparkline = res.visitors.sparkline;
            } else {
              aggSales.sparkline = mergeSparklines(
                aggSales.sparkline,
                res.sales.sparkline
              );
              aggOrders.sparkline = mergeSparklines(
                aggOrders.sparkline,
                res.orders.sparkline
              );
              aggVisitors.sparkline = mergeSparklines(
                aggVisitors.sparkline,
                res.visitors.sparkline
              );
            }
          });

          aggBS.current =
            aggOrders.current > 0 ? aggSales.current / aggOrders.current : 0;
          aggCR.current =
            aggVisitors.current > 0
              ? (aggOrders.current / aggVisitors.current) * 100
              : 0;

          setMetrics((prev) => {
            const newMetrics = [...prev];
            const update = (
              idx: number,
              dataObj: MetricData,
              fmt: "currency" | "number" | "percent"
            ) => {
              newMetrics[idx] = {
                ...newMetrics[idx],
                value: dataObj.current,
                format: fmt,
                trend: "0%",
                trendUp: true,
                data:
                  dataObj.sparkline.length > 0
                    ? dataObj.sparkline.map((d) => Number(d.total))
                    : [0, 0, 0, 0, 0, 0, 0],
                isDummy: false,
              };
            };
            update(0, aggSales, "currency");
            update(1, aggOrders, "number");
            update(2, aggCR, "percent");
            update(3, aggBS, "currency");
            update(4, aggVisitors, "number");
            return newMetrics;
          });
        }
      } catch (error) {
        console.error("Overview Metrics Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.startDate) loadMetrics();
  }, [store, stores, dateRange]);

  // 2. Fetch CHART Data (Full Year)
  useEffect(() => {
    const loadChartData = async () => {
      const targetDate = dateRange?.endDate || new Date();
      const startOfYearDate = format(startOfYear(targetDate), "yyyy-MM-dd");
      const endOfYearDate = format(endOfYear(targetDate), "yyyy-MM-dd");

      const monthsSkeleton: SalesDataPoint[] = eachMonthOfInterval({
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

      let targetStores: StoreItem[] = [];
      if (store === "all") {
        targetStores = stores.filter((s: StoreItem) => s && s.id);
      } else {
        const selectedStore = stores.find(
          (s) => s.id.toString() === store.toString()
        );
        if (selectedStore) targetStores = [selectedStore];
      }

      if (targetStores.length === 0) return;

      const fetchStoreChart = async (
        id: string | number,
        marketplaceId: number
      ) => {
        const payload = {
          store_id: id,
          date_from: startOfYearDate,
          date_to: endOfYearDate,
          marketplace_id: marketplaceId,
        };
        const [salesRes, ordersRes] = await Promise.all([
          api.dashboard.totalPenjualan(payload),
          api.dashboard.totalPesanan(payload),
        ]);
        return {
          sales: salesRes.data?.data?.sparkline || [],
          orders: ordersRes.data?.data?.sparkline || [],
        };
      };

      try {
        const results = await Promise.all(
          targetStores.map((s) => fetchStoreChart(s.id!, s.marketplace_id!))
        );

        results.forEach((res) => {
          res.sales.forEach((item: SparklineItem) => {
            const date = parseISO(item.tanggal);
            const monthKey = format(date, "MMM yyyy", { locale: idLocale });
            const monthIndex = monthsSkeleton.findIndex(
              (m) => m.monthKey === monthKey
            );
            if (monthIndex !== -1)
              monthsSkeleton[monthIndex].sales += Number(item.total);
          });

          res.orders.forEach((item: SparklineItem) => {
            const date = parseISO(item.tanggal);
            const monthKey = format(date, "MMM yyyy", { locale: idLocale });
            const monthIndex = monthsSkeleton.findIndex(
              (m) => m.monthKey === monthKey
            );
            if (monthIndex !== -1)
              monthsSkeleton[monthIndex].orders += Number(item.total);
          });
        });

        const processedSkeleton = monthsSkeleton.map((m) => ({
          ...m,
          basketSize: calculateBasketSize(m.sales, m.orders),
        }));

        const finalData = calculateMoMGrowth(processedSkeleton, [
          "sales",
          "orders",
          "basketSize",
        ]);
        setRawMonthlyData(finalData);
        setSalesData(finalData);

        // Aggregate orders by day of week
        let allDailyOrders: SparklineItem[] = [];
        results.forEach((res) => {
          if (res.orders && res.orders.length > 0) {
            allDailyOrders = [...allDailyOrders, ...res.orders];
          }
        });
        const dayOfWeekData = aggregateByDayOfWeek(allDailyOrders);
        setOrdersDayData(dayOfWeekData);

        const totalOrders = finalData.reduce(
          (acc, curr) => acc + curr.orders,
          0
        );
        setAvgMonthlyOrders(Math.round(totalOrders / 12));
      } catch (error) {
        console.error("Chart Data Fetch Error:", error);
      }
    };

    if (stores.length > 0) loadChartData();
  }, [store, stores, dateRange?.endDate]);

  // 3. Fetch Operational Data (follows filter)
  useEffect(() => {
    const loadOperationalData = async () => {
      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";
      if (!fromDate || !toDate) return;

      let targetStores: StoreItem[] = [];
      if (store === "all") {
        targetStores = stores.filter((s: StoreItem) => s && s.id);
      } else {
        const selectedStore = stores.find(
          (s) => s.id.toString() === store.toString()
        );
        if (selectedStore) targetStores = [selectedStore];
      }

      if (targetStores.length === 0) return;

      try {
        const results = await Promise.all(
          targetStores.map(async (s) => {
            const payload = {
              store_id: s.id!,
              date_from: fromDate,
              date_to: toDate,
              marketplace_id: s.marketplace_id!,
            };
            const ordersRes = await api.dashboard.totalPesanan(payload);
            return ordersRes.data?.data?.sparkline || [];
          })
        );

        let allDailyOrders: SparklineItem[] = [];
        results.forEach((sparkline) => {
          if (sparkline && sparkline.length > 0)
            allDailyOrders = [...allDailyOrders, ...sparkline];
        });

        const dayOfWeekData = aggregateByDayOfWeek(allDailyOrders);
        setOrdersDayData(dayOfWeekData);
      } catch (error) {
        console.error("Operational Chart Fetch Error:", error);
      }
    };

    if (stores.length > 0 && dateRange?.startDate) loadOperationalData();
  }, [store, stores, dateRange]);

  // 4. Handle Sales View Mode Toggle
  useEffect(() => {
    if (rawMonthlyData.length === 0) return;
    if (salesViewMode === "quarterly") {
      const quarterlyData = aggregateByQuarter(rawMonthlyData);
      setSalesData(quarterlyData);
    } else {
      setSalesData(rawMonthlyData);
    }
  }, [salesViewMode, rawMonthlyData]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in pb-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-none pt-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard Tinjauan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan performa toko Anda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 mr-2"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Upload Data</span>
          </button>
        </div>
      </div>

      {/* Quick Insight Banner */}
      <InsightBanner
        metrics={metrics}
        ordersDayData={ordersDayData}
        loading={loading}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            metric={metric}
            loading={loading}
            staggerIndex={index}
          />
        ))}
      </div>

      {/* Charts Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart - Analisa Tren */}
        <div className="lg:col-span-2 h-full min-h-0">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Analisa Tren
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeChartTab === "sales" && "Tren total penjualan"}
                    {activeChartTab === "orders" && "Tren jumlah pesanan"}
                    {activeChartTab === "basketSize" &&
                      "Tren rata-rata nilai keranjang"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Data Tabs */}
                  <TabToggle
                    items={[
                      { value: "sales", label: "Penjualan" },
                      { value: "orders", label: "Pesanan" },
                      { value: "basketSize", label: "Basket Size" },
                    ]}
                    activeValue={activeChartTab}
                    onChange={setActiveChartTab}
                    variant="primary"
                  />
                  {/* Period Toggle */}
                  <TabToggle
                    items={[
                      { value: "monthly", label: "Bulanan" },
                      { value: "quarterly", label: "Kuartal" },
                    ]}
                    activeValue={salesViewMode}
                    onChange={setSalesViewMode}
                    variant="secondary"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset={chartGradients.primary.start.offset}
                        stopColor={chartGradients.primary.start.color}
                        stopOpacity={chartGradients.primary.start.opacity}
                      />
                      <stop
                        offset={chartGradients.primary.end.offset}
                        stopColor={chartGradients.primary.end.color}
                        stopOpacity={chartGradients.primary.end.opacity}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    dy={10}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatAxisValue}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={<ChartTooltip type="auto" />}
                    cursor={{ stroke: chartUI.cursor.stroke }}
                  />
                  {/* Dynamic Area based on activeChartTab */}
                  <Area
                    type="monotone"
                    dataKey={activeChartTab}
                    name={
                      activeChartTab === "sales"
                        ? "Total Penjualan"
                        : activeChartTab === "orders"
                        ? "Total Pesanan"
                        : "Basket Size"
                    }
                    stroke={chartColors.primary}
                    fill="url(#colorSales)"
                    strokeWidth={3}
                    animationDuration={500}
                  />
                  {/* Hidden areas for tooltip data */}
                  {activeChartTab !== "sales" && (
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Total Penjualan"
                      stroke="transparent"
                      fill="transparent"
                      strokeWidth={0}
                    />
                  )}
                  {activeChartTab !== "orders" && (
                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Total Pesanan"
                      stroke="transparent"
                      fill="transparent"
                      strokeWidth={0}
                    />
                  )}
                  {activeChartTab !== "basketSize" && (
                    <Area
                      type="monotone"
                      dataKey="basketSize"
                      name="Basket Size"
                      stroke="transparent"
                      fill="transparent"
                      strokeWidth={0}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side Chart - Analisa Operasional */}
        <div className="h-full min-h-0">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Analisa Operasional
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rata-rata pesanan per hari (sesuai filter)
                  </p>
                </div>
                {/* Best Day Badge */}
                {ordersDayData.length > 0 &&
                  (() => {
                    const bestDay = ordersDayData.reduce((max, day) =>
                      day.orders > max.orders ? day : max
                    );
                    const highlightTheme = semanticStatusThemes.highlight;
                    return bestDay.orders > 0 ? (
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 ${highlightTheme.bg} border ${highlightTheme.border} rounded-full`}
                      >
                        <Trophy
                          className={`w-4 h-4 ${highlightTheme.iconText}`}
                        />
                        <span
                          className={`text-xs font-semibold ${highlightTheme.text} dark:${highlightTheme.textDark}`}
                        >
                          Best: {bestDay.full || bestDay.displayMonth}
                        </span>
                      </div>
                    ) : null;
                  })()}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ordersDayData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.1}
                  />
                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    dy={10}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={<ChartTooltip type="dayOfWeek" />}
                    cursor={{ fill: chartUI.cursor.fill }}
                  />
                  <Bar
                    dataKey="orders"
                    name="Rata-rata Pesanan"
                    radius={[4, 4, 0, 0]}
                    animationDuration={500}
                  >
                    {ordersDayData.map((entry, index) => {
                      const maxOrders = Math.max(
                        ...ordersDayData.map((d) => d.orders)
                      );
                      const isBestDay =
                        entry.orders === maxOrders && entry.orders > 0;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            isBestDay
                              ? chartColors.primary
                              : chartColors.secondary
                          }
                          className={isBestDay ? "animate-pulse" : ""}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DashboardOverview;
