/**
 * Dashboard Overview
 * ------------------
 * Halaman utama dashboard dengan ringkasan performa toko.
 *
 * Metrik Utama (6 cards):
 * - Total Penjualan, Total Pesanan, Convertion Rate
 * - Basket Size, Total Pengunjung, Pembeli Baru
 *
 * Charts:
 * - Analisa Tren (Area Chart) - Monthly/Quarterly toggle
 * - Analisa Operasional (Bar Chart) - Orders by day of week
 *
 * Data Flow (React Query Pattern):
 * 1. useDashboardMetrics() - Auto fetch metrics dengan caching
 * 2. useOverviewChartData() - Auto fetch chart data (full year)
 * 3. Error handling otomatis dengan toast notifications
 * 4. Skeleton loading untuk better UX
 * 5. Multi-store aggregation via hooks
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
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ChartTooltip from "@/components/common/ChartTooltip";
import { aggregateByQuarter, formatAxisValue } from "@/utils/chartUtils";
import { chartColors, chartUI, chartGradients } from "@/config/chartTheme";
import TabToggle from "@/components/ui/TabToggle";

// React Query hooks
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useOverviewChartData } from "@/hooks/useOverviewChartData";

// Skeleton components
import MetricCardSkeleton from "@/components/dashboard/MetricCardSkeleton";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";

// Shared Components
import {
  MetricCard,
  InsightBanner,
  ChartEmptyState,
} from "@/components/dashboard";
import DateRangePicker from "@/components/common/DateRangePicker";
import type {
  DashboardMetric,
  SalesDataPoint,
  OrdersDayDataPoint,
  StoreItem, // Keep StoreItem just in case used elsewhere, though seemingly not needed directly anymore? Checking usage: getTargetStores is gone.
} from "@/types/dashboard.types";
import { semanticStatusThemes } from "@/types/dashboard.types";
import {
  staggerContainerVariants,
  fadeInUpVariants,
  chartContentVariants,
} from "@/config/animationConfig";
import { useOperationalChartData } from "@/hooks/useOperationalChartData";

// Chart data key type
type ChartDataKey = "sales" | "orders" | "basketSize";

// === MAIN COMPONENT ===

const DashboardOverview: React.FC = () => {
  const { store, stores, dateRange } = useFilter();

  const navigate = useNavigate();

  // React Query hook untuk metrics (replaces 205 baris manual fetch!)
  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics();

  // React Query hook untuk chart data (replaces ~100 baris manual fetch!)
  const {
    data: chartData,
    isLoading: chartLoading,
    error: chartError,
  } = useOverviewChartData();

  // Chart state
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [salesViewMode, setSalesViewMode] = useState<"monthly" | "quarterly">(
    "monthly"
  );
  const [activeChartTab, setActiveChartTab] = useState<ChartDataKey>("sales");
  const [monthlyChartData, setMonthlyChartData] = useState<SalesDataPoint[]>(
    []
  );

  // New Hook: Operational Chart Data
  const { data: ordersDayData = [] } = useOperationalChartData();

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

  // Update metrics state when metricsData changes
  useEffect(() => {
    if (!metricsData) return;

    // Helper: Calculate previous value from current and percent if API doesn't provide it
    const calculatePreviousValue = (
      current: number,
      percent: number,
      apiPrevious?: number
    ) => {
      if (apiPrevious !== undefined) return apiPrevious;
      if (percent === 0) return undefined;
      return current / (1 + percent / 100);
    };

    setMetrics((prev) => {
      const newMetrics = [...prev];

      // Update dari metricsData (React Query result)
      if (metricsData.sales) {
        const calculatedPrevious = calculatePreviousValue(
          metricsData.sales.current,
          metricsData.sales.percent || 0,
          metricsData.sales.previous
        );

        newMetrics[0] = {
          ...newMetrics[0],
          value: metricsData.sales.current,
          previousValue: calculatedPrevious,
          trend: `${metricsData.sales.percent?.toFixed(1) || 0}%`,
          trendUp: (metricsData.sales.percent || 0) >= 0,
          data: metricsData.sales.sparkline?.map((d) => Number(d.total)) || [
            0, 0, 0, 0, 0, 0, 0,
          ],
          isDummy: false,
        };
      }

      if (metricsData.orders) {
        newMetrics[1] = {
          ...newMetrics[1],
          value: metricsData.orders.current,
          previousValue: calculatePreviousValue(
            metricsData.orders.current,
            metricsData.orders.percent || 0,
            metricsData.orders.previous
          ),
          trend: `${metricsData.orders.percent?.toFixed(1) || 0}%`,
          trendUp: (metricsData.orders.percent || 0) >= 0,
          data: metricsData.orders.sparkline?.map((d) => Number(d.total)) || [
            0, 0, 0, 0, 0, 0, 0,
          ],
          isDummy: false,
        };
      }

      if (metricsData.cr) {
        newMetrics[2] = {
          ...newMetrics[2],
          value: metricsData.cr.current,
          previousValue: calculatePreviousValue(
            metricsData.cr.current,
            metricsData.cr.percent || 0,
            metricsData.cr.previous
          ),
          trend: `${metricsData.cr.percent?.toFixed(1) || 0}%`,
          trendUp: (metricsData.cr.percent || 0) >= 0,
          data: [0, 0, 0, 0, 0, 0, 0],
          isDummy: false,
        };
      }

      if (metricsData.bs) {
        newMetrics[3] = {
          ...newMetrics[3],
          value: metricsData.bs.current,
          previousValue: calculatePreviousValue(
            metricsData.bs.current,
            metricsData.bs.percent || 0,
            metricsData.bs.previous
          ),
          trend: `${metricsData.bs.percent?.toFixed(1) || 0}%`,
          trendUp: (metricsData.bs.percent || 0) >= 0,
          data: [0, 0, 0, 0, 0, 0, 0],
          isDummy: false,
        };
      }

      if (metricsData.visitors) {
        newMetrics[4] = {
          ...newMetrics[4],
          value: metricsData.visitors.current,
          previousValue: calculatePreviousValue(
            metricsData.visitors.current,
            metricsData.visitors.percent || 0,
            metricsData.visitors.previous
          ),
          trend: `${metricsData.visitors.percent?.toFixed(1) || 0}%`,
          trendUp: (metricsData.visitors.percent || 0) >= 0,
          data: metricsData.visitors.sparkline?.map((d) => Number(d.total)) || [
            0, 0, 0, 0, 0, 0, 0,
          ],
          isDummy: false,
        };
      }

      return newMetrics;
    });
  }, [metricsData, dateRange]);

  // Error handling untuk metrics
  useEffect(() => {
    if (metricsError) {
      toast.error("Gagal memuat data metrik. Silakan coba lagi.", {
        duration: 4000,
        position: "top-right",
      });
    }
  }, [metricsError]);
  // Error handling untuk charts
  useEffect(() => {
    if (chartError) {
      toast.error("Gagal memuat data chart. Silakan coba lagi.", {
        duration: 4000,
        position: "top-right",
      });
    }
  }, [chartError]);

  // Update chart state dari React Query hook data
  useEffect(() => {
    if (!chartData || chartData.length === 0) {
      return;
    }

    // Set raw monthly data
    setMonthlyChartData(chartData);

    // Set sales data (monthly mode by default)
    setSalesData(chartData);
  }, [chartData]);

  // 4. Handle Sales View Mode Toggle
  useEffect(() => {
    if (monthlyChartData.length === 0) return;
    if (salesViewMode === "quarterly") {
      const quarterlyData = aggregateByQuarter(monthlyChartData);
      setSalesData(quarterlyData);
    } else {
      setSalesData(monthlyChartData);
    }
  }, [salesViewMode, monthlyChartData]);

  return (
    <motion.div
      className="flex flex-col h-full gap-4 overflow-hidden pb-4"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-none pt-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Tinjauan Bisnis
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau kesehatan dan pertumbuhan toko secara komprehensif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Tanggal */}
          <DateRangePicker
            minDate={new Date(2024, 0, 1)}
            maxDate={new Date()}
          />

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
      {/* Quick Insight Banner */}
      <motion.div variants={fadeInUpVariants}>
        <InsightBanner
          metrics={metrics}
          ordersDayData={ordersDayData}
          loading={metricsLoading}
        />
      </motion.div>

      {/* Metrics Row */}
      {/* Metrics Row */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 flex-none"
        variants={fadeInUpVariants}
      >
        {metricsLoading
          ? // Skeleton loading state
            Array.from({ length: 6 }).map((_, index) => (
              <MetricCardSkeleton key={index} highlight={index < 2} />
            ))
          : // Actual metrics cards
            metrics.map((metric, index) => (
              <MetricCard
                key={index}
                metric={metric}
                loading={metricsLoading}
                staggerIndex={index}
              />
            ))}
      </motion.div>

      {/* Charts Area */}
      {/* Charts Area */}
      <motion.div
        className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={fadeInUpVariants}
      >
        {/* Main Chart - Analisa Tren */}
        <div className="lg:col-span-2 h-full min-h-0">
          {chartLoading ? (
            <ChartSkeleton />
          ) : (
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
                <AnimatePresence mode="wait">
                  {salesData.length === 0 ? (
                    <motion.div
                      key="empty"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      <ChartEmptyState
                        title="Data Belum Tersedia"
                        message="Upload data penjualan untuk melihat analisa tren."
                        action={{
                          label: "Upload Data",
                          onClick: () => navigate("/upload"),
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeChartTab}
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={salesData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorSales"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset={chartGradients.primary.start.offset}
                                stopColor={chartGradients.primary.start.color}
                                stopOpacity={
                                  chartGradients.primary.start.opacity
                                }
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
                            tick={{
                              fontSize: 10,
                              fill: "hsl(var(--muted-foreground))",
                              fontWeight: 500,
                            }}
                            tickMargin={10}
                            dy={10}
                            interval={0}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAxisValue}
                            tick={{
                              fontSize: 10,
                              fill: "hsl(var(--muted-foreground))",
                              fontWeight: 500,
                            }}
                            tickMargin={8}
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
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            animationDuration={500}
                            animationEasing="ease-out"
                            activeDot={{
                              r: 6,
                              fill: chartColors.primary,
                              stroke: "#fff",
                              strokeWidth: 3,
                              style: {
                                filter:
                                  "drop-shadow(0 2px 4px rgba(249, 115, 22, 0.3))",
                              },
                            }}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Side Chart - Analisa Operasional */}
        <div className="h-full min-h-0">
          {chartLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card h-full flex flex-col">
              <CardHeader className="flex-none pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Analisa Operasional
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rata-rata pesanan per hari
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
                <AnimatePresence mode="wait">
                  {ordersDayData.length === 0 ? (
                    <motion.div
                      key="empty-ops"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      <ChartEmptyState
                        title="Data Operasional Kosong"
                        message="Upload data untuk melihat pola pesanan harian."
                        action={{
                          label: "Upload Data",
                          onClick: () => navigate("/upload"),
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="ops-chart"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={ordersDayData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
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
                            animationEasing="ease-out"
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
export default DashboardOverview;
