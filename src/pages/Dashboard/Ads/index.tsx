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
} from "lucide-react";
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
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { format } from "date-fns";
import CountUp from "react-countup";

// === TYPES ===

interface SparklineItem {
  tanggal?: string;
  total: number;
}

interface AdsMetric {
  title: string;
  value: number;
  format: "currency" | "number" | "percent";
  suffix?: string;
  trend: string;
  trendUp: boolean;
  data: number[];
  icon: LucideIcon;
  highlight?: boolean;
  isDummy: boolean;
  color: string;
}

interface SalesTrendDataPoint {
  month: string;
  penjualan: number;
  biaya: number;
}

interface RoasTrendDataPoint {
  month: string;
  roas: number;
}

interface TopProduct {
  nama_iklan: string;
  penjualan: number;
  biaya: number;
  roas: number;
  convertion_rate: number;
}

interface StoreItem {
  id?: string | number;
}

interface AggregatedData {
  penjualan: { total: number; percent: number; sparkline: SparklineItem[] };
  biaya: { total: number; percent: number; sparkline: SparklineItem[] };
  roas: { total: number; percent: number; sparkline: SparklineItem[] };
  cr: { total: number; percent: number; sparkline: SparklineItem[] };
  ctr: { total: number; percent: number; sparkline: SparklineItem[] };
  impressions: { total: number; percent: number; sparkline: SparklineItem[] };
}

// === MAIN COMPONENT ===

const DashboardAds: React.FC = () => {
  const { store, stores, dateRange } = useFilter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Data States
  const [salesTrendData, setSalesTrendData] = useState<SalesTrendDataPoint[]>(
    []
  );
  const [roasTrendData, setRoasTrendData] = useState<RoasTrendDataPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [sortBy, setSortBy] = useState<"penjualan" | "biaya" | "roas">(
    "penjualan"
  );
  const [activeChart, setActiveChart] = useState<"sales" | "roas">("sales");

  // Metrics State
  const [metrics, setMetrics] = useState<AdsMetric[]>([
    {
      title: "Total Penjualan",
      value: 0,
      format: "currency",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: TrendingUp,
      highlight: true,
      isDummy: false,
      color: "blue",
    },
    {
      title: "Total Biaya Iklan",
      value: 0,
      format: "currency",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: DollarSign,
      highlight: true,
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: DollarSign,
      isDummy: true,
      color: "orange",
    },
  ]);

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

  // Helper: merge sparklines
  const mergeSparklines = (
    base: SparklineItem[],
    incoming: SparklineItem[]
  ): SparklineItem[] => {
    if (!incoming || incoming.length === 0) return base;
    if (!base || base.length === 0) return incoming.map((i) => ({ ...i }));
    return base.map((b, i) => {
      const inc = incoming[i] || { total: 0 };
      return { ...b, total: Number(b.total) + Number(inc.total) };
    });
  };

  useEffect(() => {
    const fetchStoreData = async (storeId: string | number) => {
      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";
      const payload = {
        store_id: storeId,
        date_from: fromDate,
        date_to: toDate,
      };

      const [penjualanRes, biayaRes, roasRes, crRes, ctrRes, impressionsRes] =
        await Promise.all([
          api.ads.penjualan(payload),
          api.ads.biaya(payload),
          api.ads.roas(payload),
          api.ads.conversionRate(payload),
          api.ads.ctr(payload),
          api.ads.impressions(payload),
        ]);

      const getData = (res: any) => res.data?.data || {};
      return {
        penjualan: getData(penjualanRes),
        biaya: getData(biayaRes),
        roas: getData(roasRes),
        cr: getData(crRes),
        ctr: getData(ctrRes),
        impressions: getData(impressionsRes),
      };
    };

    const loadData = async () => {
      setLoading(true);
      try {
        let aggregated: AggregatedData = {
          penjualan: { total: 0, percent: 0, sparkline: [] },
          biaya: { total: 0, percent: 0, sparkline: [] },
          roas: { total: 0, percent: 0, sparkline: [] },
          cr: { total: 0, percent: 0, sparkline: [] },
          ctr: { total: 0, percent: 0, sparkline: [] },
          impressions: { total: 0, percent: 0, sparkline: [] },
        };

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

        const results = await Promise.all(
          targetStores.map((s) => fetchStoreData(s.id!))
        );

        let totalSales = 0,
          totalCost = 0,
          totalImpressions = 0;
        let weightedCTR = 0,
          weightedCR = 0;

        results.forEach((res, index) => {
          totalSales += Number(res.penjualan.total || 0);
          totalCost += Number(res.biaya.total || 0);
          totalImpressions += Number(res.impressions.total || 0);

          // Merge sparklines
          if (index === 0) {
            aggregated.penjualan.sparkline = res.penjualan.sparkline || [];
            aggregated.biaya.sparkline = res.biaya.sparkline || [];
            aggregated.impressions.sparkline = res.impressions.sparkline || [];
          } else {
            aggregated.penjualan.sparkline = mergeSparklines(
              aggregated.penjualan.sparkline,
              res.penjualan.sparkline || []
            );
            aggregated.biaya.sparkline = mergeSparklines(
              aggregated.biaya.sparkline,
              res.biaya.sparkline || []
            );
            aggregated.impressions.sparkline = mergeSparklines(
              aggregated.impressions.sparkline,
              res.impressions.sparkline || []
            );
          }

          // Derived metrics
          const ctrVal = Number(res.ctr.total || 0);
          const clicks = totalImpressions * (ctrVal / 100);
          weightedCTR += clicks;

          const crVal = Number(res.cr.total || 0);
          const orders = clicks * (crVal / 100);
          weightedCR += orders;
        });

        aggregated.penjualan.total = totalSales;
        aggregated.biaya.total = totalCost;
        aggregated.impressions.total = totalImpressions;
        aggregated.roas.total = totalCost > 0 ? totalSales / totalCost : 0;
        aggregated.ctr.total =
          totalImpressions > 0 ? (weightedCTR / totalImpressions) * 100 : 0;
        aggregated.cr.total =
          weightedCTR > 0 ? (weightedCR / weightedCTR) * 100 : 0;

        // Calculate ROAS sparkline
        if (aggregated.penjualan.sparkline && aggregated.biaya.sparkline) {
          aggregated.roas.sparkline = aggregated.penjualan.sparkline.map(
            (sItem, i) => {
              const cItem = aggregated.biaya.sparkline[i] || { total: 0 };
              return {
                ...sItem,
                total:
                  Number(cItem.total) > 0
                    ? Number(sItem.total) / Number(cItem.total)
                    : 0,
              };
            }
          );
        }

        // Fetch charts for single store only
        if (store !== "all") {
          const payload = {
            store_id: store,
            date_from: dateRange?.startDate
              ? format(dateRange.startDate, "yyyy-MM-dd")
              : "",
            date_to: dateRange?.endDate
              ? format(dateRange.endDate, "yyyy-MM-dd")
              : "",
          };
          const [salesVsCostRes, totalRoasRes, topProductsRes] =
            await Promise.all([
              api.ads.salesVsCost(payload),
              api.ads.totalRoas(payload),
              api.ads.topProducts(payload),
            ]);
          setSalesTrendData(salesVsCostRes.data?.data || []);
          setRoasTrendData(totalRoasRes.data?.data || []);
          setTopProducts(topProductsRes.data?.data || []);
        } else {
          setSalesTrendData([]);
          setRoasTrendData([]);
          setTopProducts([]);
        }

        // Update metrics
        setMetrics((prev) => {
          const newMetrics = [...prev];
          const updateMetric = (
            index: number,
            dataObj: { total: number; sparkline: SparklineItem[] },
            formatType: "currency" | "number" | "percent"
          ) => {
            newMetrics[index] = {
              ...newMetrics[index],
              value: dataObj.total,
              format: formatType,
              trend: "0%",
              trendUp: true,
              data:
                dataObj.sparkline.length > 0
                  ? dataObj.sparkline.map((d) => Number(d.total))
                  : [0, 0, 0, 0, 0, 0, 0],
              isDummy: false,
            };
          };
          updateMetric(0, aggregated.penjualan, "currency");
          updateMetric(1, aggregated.biaya, "currency");
          updateMetric(2, aggregated.roas, "number");
          updateMetric(4, aggregated.impressions, "number");
          updateMetric(
            5,
            { total: aggregated.ctr.total, sparkline: [] },
            "percent"
          );
          updateMetric(
            6,
            { total: aggregated.cr.total, sparkline: [] },
            "percent"
          );
          return newMetrics;
        });
      } catch (error) {
        console.error("Ads Aggregation Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.startDate && dateRange?.endDate) loadData();
  }, [store, stores, dateRange]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in pb-4">
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
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 mr-2"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Upload Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards - 4x2 Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts Area */}
        <div className="lg:col-span-2 h-full min-h-0">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  Trend Performa
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Analisis tren penjualan dan efektivitas iklan
                </p>
              </div>
              <Tabs
                value={activeChart}
                onValueChange={(v) => setActiveChart(v as "sales" | "roas")}
                className="w-full sm:w-[300px]"
              >
                <TabsList className="grid w-full grid-cols-2 bg-white/5">
                  <TabsTrigger value="sales">Penjualan</TabsTrigger>
                  <TabsTrigger value="roas">ROAS</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
              <ResponsiveContainer width="100%" height="100%">
                {activeChart === "sales" ? (
                  <ComposedChart
                    data={salesTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      dy={10}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000
                          ? `${(val / 1000000).toFixed(0)}jt`
                          : val >= 1000
                          ? `${(val / 1000).toFixed(0)}rb`
                          : val
                      }
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000
                          ? `${(val / 1000000).toFixed(0)}jt`
                          : val >= 1000
                          ? `${(val / 1000).toFixed(0)}rb`
                          : val
                      }
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        fontSize: "12px",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    <Bar
                      yAxisId="right"
                      dataKey="biaya"
                      name="Biaya"
                      fill="#f97316"
                      radius={[2, 2, 0, 0]}
                      barSize={16}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="penjualan"
                      name="Penjualan"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                ) : (
                  <AreaChart
                    data={roasTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRoas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#a855f7"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#a855f7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `${val}x`}
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(2)}x`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        fontSize: "12px",
                        borderRadius: "8px",
                        padding: "8px",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "0px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="roas"
                      name="ROAS"
                      stroke="#a855f7"
                      fillOpacity={1}
                      fill="url(#colorRoas)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <div className="lg:col-span-1 h-full min-h-0 overflow-hidden">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
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
        </div>
      </div>
    </div>
  );
};

// === METRIC CARD COMPONENT ===

interface MetricCardProps {
  metric: AdsMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const colorThemes: Record<
    string,
    { iconBg: string; iconText: string; accent: string; accentClass: string }
  > = {
    blue: {
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
      iconText: "text-white",
      accent: "#3b82f6",
      accentClass: "from-blue-500 to-blue-500/80",
    },
    emerald: {
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconText: "text-white",
      accent: "#10b981",
      accentClass: "from-emerald-500 to-emerald-500/80",
    },
    purple: {
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
      iconText: "text-white",
      accent: "#a855f7",
      accentClass: "from-purple-500 to-purple-500/80",
    },
    orange: {
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
      iconText: "text-white",
      accent: "#f97316",
      accentClass: "from-orange-500 to-orange-500/80",
    },
    cyan: {
      iconBg: "bg-gradient-to-br from-cyan-500 to-sky-500",
      iconText: "text-white",
      accent: "#06b6d4",
      accentClass: "from-cyan-500 to-cyan-500/80",
    },
    green: {
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
      iconText: "text-white",
      accent: "#22c55e",
      accentClass: "from-green-500 to-green-500/80",
    },
    pink: {
      iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
      iconText: "text-white",
      accent: "#ec4899",
      accentClass: "from-pink-500 to-pink-500/80",
    },
  };
  const theme = colorThemes[metric.color] || colorThemes.blue;

  const highlightThemes: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-blue-500/40",
    orange:
      "bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 shadow-orange-500/40",
    purple:
      "bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-800 shadow-purple-500/40",
  };
  const highlightClass = metric.highlight
    ? `${
        highlightThemes[metric.color] || highlightThemes.blue
      } text-white border-transparent shadow-2xl ring-1 ring-white/20`
    : "glass-card hover:shadow-2xl";

  return (
    <div className="h-full">
      <FeatureNotReady
        blur={metric.isDummy}
        overlay={metric.isDummy}
        message="Segera Hadir"
      >
        <Card
          className={`relative overflow-hidden h-full transition-all duration-300 hover:scale-[1.02] rounded-2xl ${highlightClass}`}
        >
          {!metric.highlight && (
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${theme.accentClass}`}
            />
          )}
          <div className="absolute -bottom-3 -right-3 opacity-[0.08] rotate-12 pointer-events-none">
            <metric.icon size={64} />
          </div>
          <div className="relative z-10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2.5 rounded-xl shadow-lg ${
                  metric.highlight
                    ? "bg-white/20 text-white shadow-white/10"
                    : `${theme.iconBg} ${theme.iconText} shadow-${metric.color}-500/30`
                }`}
              >
                <metric.icon size={18} strokeWidth={2.5} />
              </div>
              <h3
                className={`text-xs font-semibold leading-tight ${
                  metric.highlight ? "text-white/90" : "text-muted-foreground"
                }`}
              >
                {metric.title}
              </h3>
            </div>
            <p
              className={`text-2xl font-extrabold tracking-tight mb-2 ${
                metric.highlight ? "text-white" : "text-foreground"
              }`}
            >
              <CountUp
                start={0}
                end={metric.value}
                duration={2.0}
                separator="."
                decimal=","
                decimals={
                  metric.format === "currency"
                    ? 0
                    : metric.format === "number" && metric.value % 1 !== 0
                    ? 2
                    : 0
                }
                prefix={metric.format === "currency" ? "Rp" : ""}
                suffix={metric.format === "percent" ? "%" : metric.suffix || ""}
              />
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                  metric.highlight
                    ? "bg-white/20 text-white"
                    : metric.trendUp
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                {metric.trendUp ? "↑" : "↓"} {metric.trend}
              </span>
              <div className="w-16 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.data.map((v, i) => ({ i, v }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={metric.highlight ? "#ffffff" : theme.accent}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </FeatureNotReady>
    </div>
  );
};

export default DashboardAds;
