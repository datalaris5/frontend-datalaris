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
 * 1. useOverviewData() - Consolidated hook for metrics & charts
 * 2. Error handling otomatis dengan toast notifications
 * 3. Skeleton loading untuk better UX
 * 4. Multi-store aggregation via hooks
 */

import React, { useState, useEffect, useMemo } from "react";
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
  TrendingUp,
  BarChart3,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ChartTooltip from "@/components/common/ChartTooltip";
import { aggregateByQuarter, formatAxisValue } from "@/utils/chartUtils";
import {
  chartColors,
  chartUI,
  chartGradients,
  chartLayout,
  chartTypography,
  chartHeaderIcons,
  chartContent,
  chartAnimation,
} from "@/config/chartTheme";
import TabToggle from "@/components/ui/TabToggle";
import {
  MetricSelector,
  ChartSkeleton,
  ChartEmptyState,
  MetricCard,
  InsightBanner,
  MetricCardSkeleton,
} from "@/components/dashboard";

// React Query hooks
// Custom Hook
import {
  useOverviewData,
  OverviewTrendIndicator,
  indicatorLabels,
} from "@/hooks/useOverviewData";
// Removed legacy imports

// Skeleton components

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
import { YoYGrowthChart } from "@/components/dashboard/YoYGrowthChart";
import {
  aggregateData,
  getAutoGranularity,
  getAvailableGranularities,
  granularityLabels,
  type TimeGranularity,
  type AggregatedDataPoint,
} from "@/utils/timeAggregation";

// Chart data key type (legacy, akan dihapus setelah full migration)
type ChartDataKey = "sales" | "orders" | "basketSize";

// === MAIN COMPONENT ===

const DashboardOverview: React.FC = () => {
  const { store, stores, dateRange } = useFilter();

  const navigate = useNavigate();

  // React Query Hook (Consolidated)
  const { metrics, trendData, loading: isLoading, error } = useOverviewData();

  // Chart state
  const [selectedIndicator, setSelectedIndicator] =
    useState<OverviewTrendIndicator>("sales");
  const [selectedGranularity, setSelectedGranularity] =
    useState<TimeGranularity>("monthly");

  // New Hook: Operational Chart Data (Separate API)
  const { data: ordersDayData = [], isLoading: operationalLoading } =
    useOperationalChartData();

  const isOrdersDayDataEmpty = useMemo(() => {
    if (ordersDayData.length === 0) return true;
    return ordersDayData.every((d) => d.orders === 0);
  }, [ordersDayData]);

  // Aggregated trend data based on selection
  const aggregatedTrendData = useMemo((): AggregatedDataPoint[] => {
    if (!trendData) return [];

    // Type safer access
    const indicatorKey = selectedIndicator as keyof typeof trendData;
    const rawData = trendData[indicatorKey] || [];

    // Determine aggregation type: "average" for rates/sizes, "sum" for totals
    const aggType = ["conversionRate", "basketSize"].includes(selectedIndicator)
      ? "average"
      : "sum";

    return aggregateData(
      rawData,
      selectedGranularity,
      dateRange.startDate || new Date(),
      dateRange.endDate || new Date(),
      aggType
    );
  }, [trendData, selectedIndicator, selectedGranularity, dateRange]);

  // Check if trend data is empty
  const isTrendDataEmpty = useMemo(() => {
    if (isLoading || !trendData) return true;
    const indicatorKey = selectedIndicator as keyof typeof trendData;
    const rawData = trendData[indicatorKey] || [];
    if (rawData.length === 0) return true;
    return rawData.every((d) => d.total === 0);
  }, [isLoading, trendData, selectedIndicator]);

  // Auto-detect granularity
  const availableGranularities = useMemo((): TimeGranularity[] => {
    if (!dateRange?.startDate || !dateRange?.endDate) return ["monthly"];
    return getAvailableGranularities(
      new Date(dateRange.startDate),
      new Date(dateRange.endDate)
    );
  }, [dateRange]);

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      const autoGranularity = getAutoGranularity(
        new Date(dateRange.startDate),
        new Date(dateRange.endDate)
      );
      if (!availableGranularities.includes(selectedGranularity)) {
        setSelectedGranularity(autoGranularity);
      }
    }
  }, [dateRange, availableGranularities, selectedGranularity]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error("Gagal memuat data dashboard. Silakan coba lagi.", {
        duration: 4000,
        position: "top-right",
      });
    }
  }, [error]);

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
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 mr-2"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Upload Data</span>
          </button>
        </div>
      </div>

      {/* Quick Insight Banner */}
      {/* Quick Insight Banner */}
      <motion.div variants={fadeInUpVariants}>
        <InsightBanner metrics={metrics} loading={isLoading} />
      </motion.div>

      {/* Metrics Row */}
      {/* Metrics Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 flex-none"
        variants={fadeInUpVariants}
      >
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 6 }).map((_, index) => (
              <MetricCardSkeleton key={index} />
            ))
          : // Actual metrics cards
            metrics.map((metric, index) => (
              <MetricCard
                key={index}
                metric={metric}
                loading={isLoading}
                staggerIndex={index}
              />
            ))}
      </motion.div>

      {/* Charts Area - Left/Right Split Layout */}
      <motion.div
        className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0"
        variants={staggerContainerVariants}
      >
        {/* LEFT: Analisa Tren (2/3 width, full height) */}
        <motion.div
          className="lg:col-span-2 h-full min-h-0"
          variants={fadeInUpVariants}
        >
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle
                      className={`${chartTypography.titleLarge} flex items-center gap-2`}
                    >
                      <TrendingUp className={chartHeaderIcons.large} />
                      {chartContent.tren.title}
                    </CardTitle>
                    <p className={`${chartTypography.subtitle} mt-1`}>
                      {selectedIndicator === "sales" && "Tren total penjualan"}
                      {selectedIndicator === "orders" && "Tren jumlah pesanan"}
                      {selectedIndicator === "visitors" &&
                        "Tren total pengunjung"}
                      {selectedIndicator === "conversionRate" &&
                        "Tren conversion rate"}
                      {selectedIndicator === "basketSize" &&
                        "Tren rata-rata nilai keranjang"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Indicator Dropdown */}
                    {/* Indicator Dropdown */}
                    <MetricSelector
                      value={selectedIndicator}
                      onValueChange={(value) => setSelectedIndicator(value)}
                    />

                    {/* Granularity Toggle */}
                    {/* Granularity Toggle */}
                    <TabToggle
                      items={availableGranularities.map((gran) => ({
                        value: gran,
                        label: granularityLabels[gran],
                      }))}
                      activeValue={selectedGranularity}
                      onChange={(value) => setSelectedGranularity(value as any)}
                      size="sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-6 px-6">
                <AnimatePresence mode="wait">
                  {isLoading || isTrendDataEmpty ? (
                    <motion.div
                      key="empty"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      {isLoading ? (
                        <div className="h-full flex flex-col gap-2 items-center justify-center text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-xs font-medium">
                            Memuat grafik...
                          </span>
                        </div>
                      ) : (
                        <ChartEmptyState
                          title="Data Tren Belum Tersedia"
                          message="Upload data untuk melihat grafik tren."
                        />
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${selectedIndicator}-${selectedGranularity}`}
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={aggregatedTrendData}
                          margin={chartLayout.large.margin}
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
                            strokeDasharray={
                              chartUI.cartesianGrid.strokeDasharray
                            }
                            vertical={chartUI.cartesianGrid.vertical}
                            opacity={chartUI.cartesianGrid.opacity}
                          />
                          <XAxis
                            dataKey="key"
                            axisLine={false}
                            tickLine={false}
                            tick={chartTypography.axisLabel}
                            tickMargin={10}
                            dy={10}
                            interval={
                              // Smart interval: tampilkan semua jika sedikit, atau hitung interval agar ~10-12 label tampil
                              aggregatedTrendData.length <= 12
                                ? 0 // Tampilkan semua
                                : Math.ceil(aggregatedTrendData.length / 10) - 1 // Tampilkan ~10 label
                            }
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={formatAxisValue}
                            tick={chartTypography.axisLabel}
                            tickMargin={8}
                            width={chartLayout.large.yAxisWidth}
                          />
                          <Tooltip
                            content={<ChartTooltip type="auto" />}
                            cursor={{ stroke: chartUI.cursor.stroke }}
                          />
                          {/* Dynamic Area based on selectedIndicator */}
                          <Area
                            type="monotone"
                            dataKey="value"
                            name={indicatorLabels[selectedIndicator]}
                            stroke={chartColors.primary}
                            fill="url(#colorSales)"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            animationDuration={chartAnimation.duration}
                            animationEasing={chartAnimation.easing}
                            activeDot={{
                              r: chartUI.activeDot.r,
                              fill: chartUI.activeDot.fill,
                              stroke: chartUI.activeDot.stroke,
                              strokeWidth: chartUI.activeDot.strokeWidth,
                              style: { filter: chartUI.activeDot.filter },
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* RIGHT: Stacked Charts (1/3 width) */}
        <motion.div
          className="flex flex-col gap-4 h-full min-h-0"
          variants={staggerContainerVariants}
        >
          {/* YoY Growth Chart (atas) */}
          <motion.div className="flex-1 min-h-0" variants={fadeInUpVariants}>
            <YoYGrowthChart />
          </motion.div>

          {/* Analisa Operasional (bawah) */}
          <motion.div className="flex-1 min-h-0" variants={fadeInUpVariants}>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <Card className="glass-card h-full flex flex-col">
                <CardHeader className="py-4 px-6 flex-none border-b border-black/5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle
                        className={`${chartTypography.titleCompact} flex items-center gap-2`}
                      >
                        <BarChart3 className={chartHeaderIcons.compact} />
                        {chartContent.operasional.title}
                      </CardTitle>
                      <p className={`${chartTypography.subtitleCompact}`}>
                        {chartContent.operasional.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 pt-4 pb-6 px-6">
                  <AnimatePresence mode="wait">
                    {operationalLoading || isOrdersDayDataEmpty ? (
                      <motion.div
                        key="empty-ops"
                        variants={chartContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="h-full"
                      >
                        {operationalLoading ? (
                          <div className="h-full flex flex-col gap-2 items-center justify-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-xs font-medium">
                              Memuat grafik...
                            </span>
                          </div>
                        ) : (
                          <ChartEmptyState
                            icon={BarChart3}
                            title="Data Operasional Belum Tersedia"
                            message="Upload data untuk melihat pola harian."
                          />
                        )}
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
                            margin={chartLayout.compact.margin}
                          >
                            <CartesianGrid
                              strokeDasharray={
                                chartUI.cartesianGrid.strokeDasharray
                              }
                              vertical={chartUI.cartesianGrid.vertical}
                              opacity={chartUI.cartesianGrid.opacity}
                            />
                            <XAxis
                              dataKey="dayLabel"
                              axisLine={false}
                              tickLine={false}
                              tick={chartTypography.axisLabel}
                              dy={10}
                              interval={0}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={chartTypography.axisLabel}
                              width={chartLayout.compact.yAxisWidth}
                            />
                            <Tooltip
                              content={<ChartTooltip type="dayOfWeek" />}
                              cursor={{ fill: chartUI.cursor.fill }}
                            />
                            <Bar
                              dataKey="orders"
                              name="Total Pesanan"
                              radius={chartUI.barRadius.top}
                              animationDuration={chartAnimation.duration}
                              animationEasing={chartAnimation.easing}
                            >
                              {ordersDayData.map((entry, index) => {
                                const maxOrders = Math.max(
                                  ...ordersDayData.map((d) => d.orders)
                                );
                                const isBestDay =
                                  entry.orders === maxOrders &&
                                  entry.orders > 0;
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      isBestDay
                                        ? chartColors.primary
                                        : chartColors.secondary
                                    }
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
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
export default DashboardOverview;
