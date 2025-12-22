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

import React, { useState, useEffect } from "react";
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
  LineChart,
  Line,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  MessageSquare,
  CheckCircle2,
  Percent,
  Clock,
  ShoppingCart,
  Users,
  UserCheck,
  Upload,
  LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFilter } from "@/context/FilterContext";
import { api } from "@/services/api";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountUp from "react-countup";
import MetricCard from "@/components/dashboard/MetricCard";
import { MetricColor } from "@/types/dashboard.types";

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
      <div className="glass-card-strong p-3 rounded-xl border border-white/20 shadow-xl backdrop-blur-md">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-blue-500 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Masuk
            </span>
            <span className="text-foreground">{incoming}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-emerald-500 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Dibalas
            </span>
            <span className="text-foreground">{replied}</span>
          </div>
          {missed > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-4 text-xs font-bold text-rose-500">
              <span className="flex items-center gap-1">⚠️ Tak Dibalas</span>
              <span className="bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-400">
                {missed} ({missedPercent.toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Tipe untuk chart data
interface VolumeChartData {
  date: string;
  incoming: number;
  replied: number;
}

interface ResponseTimeData {
  date: string;
  time: number;
}

// Tipe untuk metric
interface ChatMetric {
  title: string;
  value: number;
  format: "number" | "percent" | "currency";
  suffix?: string;
  trend: string;
  trendUp: boolean;
  data: number[];
  icon: LucideIcon;
  color: MetricColor;
  highlight?: boolean;
  isDummy: boolean;
}

const DashboardChat: React.FC = () => {
  const { store, stores, dateRange } = useFilter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [kpiTarget, setKpiTarget] = useState(10); // Default KPI 10 menit

  // Chart Data State
  const [volumeChartData, setVolumeChartData] = useState<VolumeChartData[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>(
    []
  );

  // Metrics State
  const [metrics, setMetrics] = useState<ChatMetric[]>([
    {
      title: "Jumlah Chat",
      value: 0,
      format: "number",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: Clock,
      color: "orange",
      isDummy: true,
    },
    {
      title: "Conversion Rate",
      value: 0,
      format: "percent",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: UserCheck,
      color: "pink",
      isDummy: false,
    },
  ]);

  // Helper: merge sparklines untuk multi-store
  const mergeSparklines = (
    base: Array<{ total: number }>,
    incoming: Array<{ total: number }>
  ): Array<{ total: number }> => {
    if (!incoming || incoming.length === 0) return base;
    if (!base || base.length === 0) return incoming.map((i) => ({ ...i }));
    return base.map((b, i) => {
      const inc = incoming[i] || { total: 0 };
      return { ...b, total: Number(b.total) + Number(inc.total) };
    });
  };

  useEffect(() => {
    // Generate dummy data untuk response time
    const generateDummyResponseTime = (): ResponseTimeData[] => {
      return Array.from({ length: 7 }, (_, i) => ({
        date: `Hari ${i + 1}`,
        time: Math.floor(Math.random() * 15) + 2,
      }));
    };
    setResponseTimeData(generateDummyResponseTime());

    // Fetch real chat data
    const loadData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Determine target stores
        interface StoreItem {
          id?: string | number;
        }
        let targetStores: StoreItem[] = [];
        if (store === "all") {
          targetStores = stores.filter((s: StoreItem) => s && s.id);
        } else {
          targetStores = [{ id: store }];
        }

        if (targetStores.length === 0) {
          setLoading(false);
          return;
        }

        const fromDate = dateRange?.startDate
          ? format(dateRange.startDate, "yyyy-MM-dd")
          : "";
        const toDate = dateRange?.endDate
          ? format(dateRange.endDate, "yyyy-MM-dd")
          : "";

        // Fetch for each store
        const fetchStoreData = async (storeId: string | number) => {
          const params = {
            date_from: fromDate,
            date_to: toDate,
            store_id: storeId,
          };
          const [totalRes, repliedRes, percentRes, buyersRes, salesRes, crRes] =
            await Promise.all([
              api.chat.jumlahChat(params),
              api.chat.chatDibalas(params),
              api.chat.persentaseChat(params),
              api.chat.totalPembeli(params),
              api.chat.penjualan(params),
              api.chat.conversionRate(params),
            ]);
          return {
            total: totalRes.data?.data || {},
            replied: repliedRes.data?.data || {},
            percent: percentRes.data?.data || {},
            buyers: buyersRes.data?.data || {},
            sales: salesRes.data?.data || {},
            cr: crRes.data?.data || {},
          };
        };

        const results = await Promise.all(
          targetStores.map((s) => fetchStoreData(s.id!))
        );

        // Aggregate results
        let sumTotalChat = 0,
          sumRepliedChat = 0,
          sumSales = 0,
          sumBuyers = 0;
        let totalSparkline: Array<{ total: number; tanggal?: string }> = [];
        let repliedSparkline: Array<{ total: number }> = [];

        results.forEach((res, index) => {
          sumTotalChat += Number(res.total.total || 0);
          sumRepliedChat += Number(res.replied.total || 0);
          sumSales += Number(res.sales.total || 0);
          sumBuyers += Number(res.buyers.total || 0);

          if (index === 0) {
            totalSparkline = res.total.sparkline || [];
            repliedSparkline = res.replied.sparkline || [];
          } else {
            totalSparkline = mergeSparklines(
              totalSparkline,
              res.total.sparkline || []
            );
            repliedSparkline = mergeSparklines(
              repliedSparkline,
              res.replied.sparkline || []
            );
          }
        });

        // Recalculate derived metrics
        const percentDibalas =
          sumTotalChat > 0 ? (sumRepliedChat / sumTotalChat) * 100 : 0;
        const crValue = sumTotalChat > 0 ? (sumBuyers / sumTotalChat) * 100 : 0;

        // Update metrics
        setMetrics((prev) => {
          const newMetrics = [...prev];
          newMetrics[0] = {
            ...newMetrics[0],
            value: sumTotalChat,
            data: totalSparkline.map((d) => Number(d.total)),
          };
          newMetrics[1] = {
            ...newMetrics[1],
            value: sumRepliedChat,
            data: repliedSparkline.map((d) => Number(d.total)),
          };
          newMetrics[2] = { ...newMetrics[2], value: percentDibalas };
          newMetrics[4] = { ...newMetrics[4], value: crValue };
          newMetrics[5] = { ...newMetrics[5], value: sumSales };
          newMetrics[6] = { ...newMetrics[6], value: sumBuyers };
          return newMetrics;
        });

        // Set chart data
        if (totalSparkline.length > 0) {
          const chartData = totalSparkline.map((val, idx) => ({
            date: val.tanggal
              ? format(new Date(val.tanggal), "dd MMM")
              : `Hari ${idx + 1}`,
            incoming: Number(val.total),
            replied: Number(repliedSparkline[idx]?.total || 0),
          }));
          setVolumeChartData(chartData);
        } else {
          setVolumeChartData([]);
        }
      } catch (error) {
        console.error("Chat Data Error:", error);
        setVolumeChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.startDate) {
      loadData();
    }
  }, [store, stores, dateRange]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in pb-4">
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
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 mr-2"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Upload Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume Chart */}
        <div className="col-span-2 min-h-0">
          <FeatureNotReady
            blur={volumeChartData.length === 0}
            overlay={volumeChartData.length === 0}
            message="Segera Hadir"
          >
            <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
                <CardTitle className="text-lg font-bold">
                  Tren Jumlah Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={volumeChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIncoming"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorReplied"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
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
                      content={<CustomVolumeTooltip />}
                      cursor={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="incoming"
                      name="Chat Masuk"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorIncoming)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="replied"
                      name="Dibalas"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorReplied)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FeatureNotReady>
        </div>

        {/* Response Time Chart (Dummy) */}
        <div className="flex flex-col min-h-0">
          <FeatureNotReady blur={true} message="Segera Hadir">
            <Card className="glass-card rounded-2xl h-full flex flex-col">
              <CardHeader className="py-4 px-6 flex-none border-b border-white/10 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Waktu Respon
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target KPI:{" "}
                    <span className="font-bold text-orange-500">
                      {kpiTarget} Menit
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                  <div className="text-[10px] font-bold text-muted-foreground w-6 text-center">
                    {kpiTarget}m
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={kpiTarget}
                    onChange={(e) => setKpiTarget(Number(e.target.value))}
                    className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
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
                      formatter={(value) => [`${value} Menit`, "Waktu Respon"]}
                    />
                    <ReferenceLine
                      y={kpiTarget}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="3 3"
                      label={{
                        position: "top",
                        value: `KPI ${kpiTarget}m`,
                        fill: "hsl(var(--destructive))",
                        fontSize: 10,
                      }}
                    />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                      {responseTimeData.map((entry, index) => {
                        let color = "#10b981";
                        if (entry.time > kpiTarget) color = "#ef4444";
                        else if (entry.time > kpiTarget / 2) color = "#f97316";
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FeatureNotReady>
        </div>
      </div>
    </div>
  );
};

export default DashboardChat;
