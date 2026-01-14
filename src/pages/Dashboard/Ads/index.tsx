/**
 * Dashboard Ads
 * -------------
 * Halaman analisis performa iklan Shopee/TikTok.
 *
 * Metrik Utama (8 cards):
 * - Total Penjualan, Total Biaya Iklan, ROAS, AOV Iklan
 * - Total Dilihat, Persentase Klik (CTR), Convertion Rate, CPA
 *
 * Charts:
 * - Trend Performa (Composed Chart: Sales vs Cost, atau ROAS Area)
 * - Top 10 Produk Table
 *
 * Data Flow:
 * - Fetch dari API ads (penjualan, biaya, roas, ctr, cr, impressions)
 * - Multi-store aggregation jika store="all"
 */

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import {
  Megaphone,
  MousePointer,
  Eye,
  DollarSign,
  TrendingUp,
  Target,
  Upload,
  ArrowUpDown,
  LucideIcon,
  Loader2,
} from "lucide-react";
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
import ChartTooltip from "@/components/common/ChartTooltip";
import { formatAxisValue } from "@/utils/chartUtils";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFilter } from "@/context/FilterContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DateRangePicker from "@/components/common/DateRangePicker";
import { motion } from "framer-motion";
import {
  staggerContainerVariants,
  fadeInUpVariants,
  chartContentVariants,
} from "@/config/animationConfig";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { format } from "date-fns";
import CountUp from "react-countup";
import MetricCard from "@/components/dashboard/MetricCard";
import {
  MetricCardSkeleton,
  ChartSkeleton,
  ChartEmptyState,
  InsightBanner,
} from "@/components/dashboard";
import { MetricColor, DashboardMetric } from "@/types/dashboard.types";
import { AnimatePresence } from "framer-motion";
import { MetricSelector } from "@/components/dashboard/MetricSelector";
import TabToggle from "@/components/ui/TabToggle";
import {
  aggregateData,
  getAvailableGranularities,
  TimeGranularity,
  granularityLabels,
} from "@/utils/timeAggregation";
import { useAdsData } from "@/hooks/useAdsData";

// === MAIN COMPONENT ===

const DashboardAds: React.FC = () => {
  const { store, stores, dateRange } = useFilter();
  const navigate = useNavigate();

  // Custom Hook for Data Fetching
  const { metrics, loading, topProducts, chartData } = useAdsData();

  // Chart State
  const [selectedIndicator, setSelectedIndicator] = useState<string>("sales");
  const [selectedGranularity, setSelectedGranularity] =
    useState<TimeGranularity>("daily");

  const [sortBy, setSortBy] = useState<string>("penjualan");

  const availableGranularities = React.useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return ["daily"];
    return getAvailableGranularities(dateRange.startDate, dateRange.endDate);
  }, [dateRange]);

  // Reset granularity if not available
  useEffect(() => {
    if (!availableGranularities.includes(selectedGranularity)) {
      setSelectedGranularity(availableGranularities[0] as TimeGranularity);
    }
  }, [availableGranularities, selectedGranularity]);

  // Re-aggregated Trend Data
  const aggregatedTrendData = React.useMemo(() => {
    // Return empty if basic requirements not met
    if (!dateRange?.startDate || !dateRange?.endDate || !chartData) return [];

    // Data Source Selection
    let sourceData: any[] = [];
    let type: "sum" | "average" = "sum";

    // Strictly match normalized structure
    switch (selectedIndicator) {
      case "sales":
        sourceData = chartData.sales || [];
        break;
      case "cost":
        sourceData = chartData.cost || [];
        type = "sum";
        break;
      case "roas":
        sourceData = chartData.roas || [];
        type = "average";
        break;
      default:
        sourceData = [];
    }

    if (sourceData.length === 0) return [];

    return aggregateData(
      sourceData,
      selectedGranularity,
      dateRange.startDate,
      dateRange.endDate,
      type
    );
  }, [chartData, selectedIndicator, selectedGranularity, dateRange]);

  // Empty State Logic
  const isTrendDataEmpty = React.useMemo(() => {
    if (loading) return false;
    return (
      aggregatedTrendData.length === 0 ||
      aggregatedTrendData.every((d) => d.value === 0)
    );
  }, [aggregatedTrendData, loading]);

  const formatCurrency = (val: number): string =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formatShortCurrency = (val: number): string => {
    if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `Rp${(val / 1000).toFixed(0)}rb`;
    return `Rp${val}`;
  };

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
            Dashboard Iklan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan performa iklan Anda
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
      <motion.div variants={fadeInUpVariants}>
        <InsightBanner metrics={metrics} loading={loading} />
      </motion.div>

      {/* Metric Cards - 4x2 Grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-none"
        variants={fadeInUpVariants}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <MetricCardSkeleton key={index} />
            ))
          : metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={staggerContainerVariants}
      >
        {/* Charts Area */}
        <motion.div
          className="lg:col-span-2 h-full min-h-0"
          variants={fadeInUpVariants}
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Trend Performa
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedIndicator === "sales" && "Tren total penjualan"}
                      {selectedIndicator === "cost" && "Tren total biaya iklan"}
                      {selectedIndicator === "roas" && "Tren efektivitas ROAS"}
                      {selectedIndicator === "orders" && "Tren jumlah pesanan"}
                      {selectedIndicator === "visitors" &&
                        "Tren jumlah pengunjung"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MetricSelector
                      value={selectedIndicator}
                      onValueChange={(val) => setSelectedIndicator(val)}
                      options={[
                        { value: "sales", label: "Penjualan" },
                        { value: "cost", label: "Biaya" },
                        { value: "roas", label: "ROAS" },
                      ]}
                    />
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
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
                <AnimatePresence mode="wait">
                  {loading || isTrendDataEmpty ? (
                    <motion.div
                      key="empty"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      {loading ? (
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
                              id="colorChart"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset={chartGradients.primary.start.offset}
                                stopColor={
                                  selectedIndicator === "cost"
                                    ? chartColors.orange
                                    : selectedIndicator === "roas"
                                    ? chartColors.purple
                                    : chartColors.primary
                                }
                                stopOpacity={
                                  chartGradients.primary.start.opacity
                                }
                              />
                              <stop
                                offset={chartGradients.primary.end.offset}
                                stopColor={
                                  selectedIndicator === "cost"
                                    ? chartColors.orange
                                    : selectedIndicator === "roas"
                                    ? chartColors.purple
                                    : chartColors.primary
                                }
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
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) =>
                              selectedIndicator === "roas"
                                ? `${val}x`
                                : formatAxisValue(val)
                            }
                            tick={chartTypography.axisLabel}
                            tickMargin={8}
                            width={chartLayout.large.yAxisWidth}
                          />
                          <Tooltip
                            content={
                              <ChartTooltip
                                type="auto"
                                indicator={selectedIndicator}
                              />
                            }
                            cursor={{ stroke: chartUI.cursor.stroke }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name={
                              selectedIndicator === "sales"
                                ? "Penjualan"
                                : selectedIndicator === "cost"
                                ? "Biaya"
                                : "ROAS"
                            }
                            stroke={
                              selectedIndicator === "cost"
                                ? chartColors.orange
                                : selectedIndicator === "roas"
                                ? chartColors.purple
                                : chartColors.primary
                            }
                            fillOpacity={1}
                            fill="url(#colorChart)"
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

        {/* Top Products Table */}
        <motion.div
          className="lg:col-span-1 h-full min-h-0 overflow-hidden"
          variants={fadeInUpVariants}
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-3 px-4 flex-none border-b border-white/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Top 10 Produk
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Diurutkan berdasarkan{" "}
                    <span className="font-semibold text-primary">
                      {sortBy === "penjualan"
                        ? "Penjualan"
                        : sortBy === "biaya"
                        ? "Biaya"
                        : "ROAS"}
                    </span>
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10"
                    >
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy("penjualan")}>
                      Penjualan Tertinggi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("biaya")}>
                      Biaya Tertinggi
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("roas")}>
                      ROAS Tertinggi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto min-h-0 p-0 scrollbar-hide">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-md z-10 shadow-sm">
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="w-[45%] text-[10px] h-9">
                        Produk
                      </TableHead>
                      <TableHead className="text-right text-[10px] h-9">
                        ROAS
                      </TableHead>
                      <TableHead className="text-right text-[10px] h-9">
                        Penjualan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground h-24 text-xs"
                        >
                          Tidak ada data
                        </TableCell>
                      </TableRow>
                    ) : (
                      topProducts
                        .sort((a, b) => {
                          if (sortBy === "penjualan")
                            return b.penjualan - a.penjualan;
                          if (sortBy === "biaya") return b.biaya - a.biaya;
                          if (sortBy === "roas") return b.roas - a.roas;
                          return 0;
                        })
                        .map((product, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-white/5 border-white/5"
                          >
                            <TableCell className="font-medium py-2">
                              <div
                                className="line-clamp-2 text-[11px] leading-tight"
                                title={product.nama_iklan}
                              >
                                {product.nama_iklan}
                              </div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">
                                Cost: {formatShortCurrency(product.biaya)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold align-top py-2 text-xs">
                              {product.roas.toFixed(1)}x
                            </TableCell>
                            <TableCell className="text-right align-top py-2">
                              <div className="font-semibold text-blue-500 text-xs">
                                {formatShortCurrency(product.penjualan)}
                              </div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">
                                CR: {product.convertion_rate.toFixed(1)}%
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// === METRIC CARD COMPONENT REMOVED (Using reusable component)

export default DashboardAds;
