/**
 * Dashboard Chat
 * --------------
 * Halaman analisis performa chat dan layanan pelanggan.
 * Menampilkan metrik chat, response time, dan tren volume.
 *
 * Metrik Utama:
 * - Jumlah Chat, Chat Dibalas, Persentase Dibalas
 * - Rata-rata Waktu Respon (dummy)
 * - Conversion Rate, Estimasi Penjualan, Total Pembeli
 *
 * Charts:
 * - Tren Jumlah Chat (Area Chart)
 * - Waktu Respon (Bar Chart dengan KPI line)
 */

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Upload, BarChart3, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatData } from "@/hooks/useChatData";
import DateRangePicker from "@/components/common/DateRangePicker";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainerVariants,
  fadeInUpVariants,
  chartContentVariants,
} from "@/config/animationConfig";
import {
  MetricCard,
  MetricCardSkeleton,
  InsightBanner,
  ChartEmptyState,
  ChartSkeleton,
  MetricSelector,
} from "@/components/dashboard";
import TabToggle from "@/components/ui/TabToggle";
import {
  aggregateData,
  getAvailableGranularities,
  TimeGranularity,
  granularityLabels,
} from "@/utils/timeAggregation";
import { useFilter } from "@/context/FilterContext";
import {
  chartContent,
  chartHeaderIcons,
  chartTypography,
  chartColors,
  chartGradients,
  chartUI,
  chartAnimation,
  areaStyles,
} from "@/config/chartTheme";

// Tipe untuk tooltip props dari Recharts
interface TooltipPayload {
  value: number;
}

interface CustomVolumeTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

/**
 * Custom Tooltip untuk Volume Chart
 * Menampilkan chat masuk, dibalas, dan missed dengan styling glass
 */
const CustomVolumeTooltip: React.FC<CustomVolumeTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const incoming = Number(payload[0]?.value || 0);
    const replied = Number(payload[1]?.value || 0);
    const missed = incoming - replied;
    const missedPercent = incoming > 0 ? (missed / incoming) * 100 : 0;

    return (
      <div className="glass-tooltip p-3 min-w-[150px]">
        <div className="mb-2 pb-2 border-b border-border/50">
          <p className="text-xs font-bold text-foreground">{label}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Masuk
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {incoming}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
              Dibalas
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {replied}
            </span>
          </div>
          {missed > 0 && (
            <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-rose-500 flex items-center gap-1">
                ⚠️ Tak Dibalas
              </span>
              <span className="badge-growth badge-growth-negative ml-0 scale-90 origin-right">
                {missed} ({missedPercent.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardChat: React.FC = () => {
  const navigate = useNavigate();
  const { dateRange } = useFilter(); // Get Global Date Range
  const [selectedIndicator, setSelectedIndicator] = useState("volume");
  const [selectedGranularity, setSelectedGranularity] =
    useState<TimeGranularity>("daily");

  // Chart Configuration Map
  const chartConfig: Record<string, { subtitle: string }> = {
    volume: {
      subtitle: "Tren jumlah chat masuk",
    },
    responseTime: {
      subtitle: "Rata-rata waktu respon harian",
    },
    sales: {
      subtitle: "Tren nominal penjualan dari chat",
    },
    buyers: {
      subtitle: "Tren jumlah pembeli unik",
    },
    percent: {
      subtitle: "Tren performa balasan chat (%)",
    },
    cr: {
      subtitle: "Tren tingkat konversi chat ke penjualan",
    },
  };

  const currentChartConfig =
    chartConfig[selectedIndicator] || chartConfig.volume;

  // Use Custom Hook (Centralized logic)
  const {
    metrics,
    rawTrendData,
    rawResponseTimeData,
    responseTimeData,
    loading,
  } = useChatData();

  // 1. Determine Available Granularities
  const availableGranularities = React.useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate)
      return ["daily"] as TimeGranularity[];
    return getAvailableGranularities(dateRange.startDate, dateRange.endDate);
  }, [dateRange]);

  // 2. Reset Granularity if not available
  React.useEffect(() => {
    if (!availableGranularities.includes(selectedGranularity)) {
      setSelectedGranularity(availableGranularities[0]);
    }
  }, [availableGranularities, selectedGranularity]);

  // 3. Aggregate Data Dynamically
  const aggregatedTrendData = React.useMemo(() => {
    if (!rawTrendData.length || !dateRange?.startDate || !dateRange?.endDate)
      return [];

    // Case 1: Volume (Single Series: Incoming Only)
    if (selectedIndicator === "volume") {
      const source = rawTrendData.map((d) => ({
        tanggal: d.date,
        total: d.incoming,
      }));
      const aggregated = aggregateData(
        source,
        selectedGranularity,
        dateRange.startDate,
        dateRange.endDate,
        "sum"
      );
      return aggregated.map((d) => ({
        date: d.key,
        value: d.value,
      }));
    }

    // Case 2: Response Time (Handled separately via API but aggregated in Frontend for granularity)
    if (selectedIndicator === "responseTime") {
      if (!rawResponseTimeData.length) return [];
      const source = rawResponseTimeData.map((d) => ({
        tanggal: d.date,
        total: d.time,
      }));
      const aggregated = aggregateData(
        source,
        selectedGranularity,
        dateRange.startDate,
        dateRange.endDate,
        "average"
      );
      return aggregated.map((d) => ({
        date: d.key,
        value: Number(d.value.toFixed(1)), // Keep 1 decimal for minutes
      }));
    }

    // Case 3: Other Metrics (Single Series)
    const metricKeyMap: Record<string, keyof (typeof rawTrendData)[0]> = {
      sales: "sales",
      buyers: "buyers",
      percent: "percent",
      cr: "cr",
    };
    const key = metricKeyMap[selectedIndicator];
    if (!key) return [];

    const source = rawTrendData.map((d) => ({
      tanggal: d.date,
      total: Number(d[key]),
    }));

    const aggregationType =
      selectedIndicator === "percent" || selectedIndicator === "cr"
        ? "average"
        : "sum";

    const aggregated = aggregateData(
      source,
      selectedGranularity,
      dateRange.startDate,
      dateRange.endDate,
      aggregationType
    );

    return aggregated.map((d) => ({
      date: d.key,
      value: d.value,
    }));
  }, [
    rawTrendData,
    rawResponseTimeData,
    selectedIndicator,
    selectedGranularity,
    dateRange,
  ]);

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
            Dashboard Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis performa chat dan layanan pelanggan
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

      {/* Insight Banner */}
      <motion.div variants={fadeInUpVariants}>
        <InsightBanner metrics={metrics} loading={loading} />
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-none"
        variants={fadeInUpVariants}
      >
        {loading
          ? Array.from({ length: metrics.length }).map((_, i) => (
              <MetricCardSkeleton key={i} highlight={i === 0} />
            ))
          : metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} staggerIndex={index} />
            ))}
      </motion.div>

      {/* Charts Area */}
      <motion.div
        className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={staggerContainerVariants}
      >
        {/* Volume Chart */}
        <motion.div className="col-span-2 min-h-0" variants={fadeInUpVariants}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div>
                      <CardTitle
                        className={`${chartTypography.titleLarge} flex items-center gap-2`}
                      >
                        <TrendingUp className={chartHeaderIcons.large} />
                        {chartContent.tren.title}
                      </CardTitle>
                      <p className={`${chartTypography.subtitle} mt-1`}>
                        {currentChartConfig.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MetricSelector
                      value={selectedIndicator}
                      onValueChange={(val) => setSelectedIndicator(val)}
                      options={[
                        { value: "volume", label: "Jumlah Chat" },
                        { value: "sales", label: "Estimasi Penjualan" },
                        { value: "buyers", label: "Total Pembeli" },
                        { value: "percent", label: "Persentase Dibalas" },
                        { value: "cr", label: "Conversion Rate" },
                        { value: "responseTime", label: "Waktu Respon" },
                      ]}
                    />
                    <TabToggle
                      items={availableGranularities.map((g) => ({
                        value: g,
                        label: granularityLabels[g],
                      }))}
                      activeValue={selectedGranularity}
                      onChange={(val) => setSelectedGranularity(val as any)}
                      size="sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
                <AnimatePresence mode="wait">
                  {selectedIndicator === "responseTime" ? (
                    // RESPONSE TIME CHART (Aggregated)
                    aggregatedTrendData.length === 0 ? (
                      <motion.div
                        key="empty-response"
                        variants={chartContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="h-full"
                      >
                        <ChartEmptyState
                          icon={Clock}
                          title="Data Waktu Respon Kosong"
                          message="Upload data untuk melihat waktu respon."
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`response-chart-${selectedGranularity}`}
                        variants={chartContentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="h-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={aggregatedTrendData}
                            margin={{
                              top: 10,
                              right: 10,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              opacity={0.1}
                            />
                            <XAxis
                              dataKey="date"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10 }}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10 }}
                            />
                            <Tooltip
                              cursor={{ fill: "transparent" }}
                              formatter={(value) => [
                                `${value} Menit`,
                                "Waktu Respon",
                              ]}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {aggregatedTrendData.map((entry, index) => {
                                let color = "#10b981";
                                if (entry.value > kpiTarget) color = "#ef4444";
                                else if (entry.value > kpiTarget / 2)
                                  color = "#f97316";
                                return (
                                  <Cell key={`cell-${index}`} fill={color} />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )
                  ) : aggregatedTrendData.length === 0 ? (
                    // EMPTY STATE (Generic)
                    <motion.div
                      key="empty-trend"
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      <ChartEmptyState
                        icon={BarChart3}
                        title="Data Tren Belum Tersedia"
                        message="Upload data chat untuk melihat grafik tren."
                      />
                    </motion.div>
                  ) : (
                    // GENERIC TREND CHART (Single Area)
                    <motion.div
                      key={`trend-chart-${selectedIndicator}-${selectedGranularity}`}
                      variants={chartContentVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={aggregatedTrendData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -20,
                            bottom: 0,
                          }}
                        >
                          <defs>
                            <linearGradient
                              id={chartGradients.primary.id}
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
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => {
                              if (selectedIndicator === "sales") {
                                if (val >= 1000000)
                                  return `${(val / 1000000).toFixed(0)}jt`;
                                return val;
                              }
                              return val;
                            }}
                          />
                          <Tooltip
                            formatter={(value: number) => {
                              if (selectedIndicator === "sales") {
                                return [
                                  new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                  }).format(value),
                                  "Penjualan",
                                ];
                              }
                              if (
                                selectedIndicator === "percent" ||
                                selectedIndicator === "cr"
                              ) {
                                return [`${value.toFixed(2)}%`, "Rate"];
                              }
                              return [value, "Total"];
                            }}
                            cursor={{
                              stroke: chartUI.cursor.stroke,
                              strokeWidth: 1,
                              strokeDasharray: "4 4",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            name="Total"
                            stroke={areaStyles.primary.stroke}
                            fill={areaStyles.primary.fill}
                            strokeWidth={areaStyles.primary.strokeWidth}
                            fillOpacity={1}
                            activeDot={areaStyles.primary.activeDot}
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

        {/* Response Time Chart (Real Data) */}
        <motion.div
          className="flex flex-col min-h-0"
          variants={fadeInUpVariants}
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Waktu Respon Harian
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rata-rata waktu respon per hari
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
                {responseTimeData.length === 0 ? (
                  <ChartEmptyState
                    icon={Clock}
                    title="Data Waktu Respon Kosong"
                    message="Upload data untuk melihat waktu respon harian."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={responseTimeData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        opacity={0.1}
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        formatter={(value) => [
                          `${value} Menit`,
                          "Waktu Respon",
                        ]}
                      />
                      <Bar
                        dataKey="time"
                        fill={chartColors.secondary}
                        radius={chartUI.barRadius.top}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardChat;
