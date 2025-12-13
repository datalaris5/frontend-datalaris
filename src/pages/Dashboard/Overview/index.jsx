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
  ReferenceLine,
  Cell,
} from "recharts";
import {
  ShoppingBag,
  Store,
  Users,
  DollarSign,
  MousePointer,
  Package,
  Clock,
  Upload,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useFilter } from "../../../context/FilterContext";
import { api } from "../../../services/api";
import FeatureNotReady from "../../../components/common/FeatureNotReady";
import {
  format,
  parseISO,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  getYear,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import CountUp from "react-countup";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import ChartTooltip from "../../../components/common/ChartTooltip";
import {
  calculateMoMGrowth,
  calculateBasketSize,
  aggregateByQuarter,
  aggregateByDayOfWeek,
} from "../../../utils/chartUtils";
import {
  chartColors,
  chartUI,
  chartGradients,
} from "../../../config/chartTheme";

const DashboardOverview = () => {
  const { store, stores, dateRange } = useFilter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Chart Tabs State
  const [activeTab, setActiveTab] = useState("sales");

  // Data States
  const [salesData, setSalesData] = useState([]); // Sales Chart Data (Month or Qtr)
  const [salesViewMode, setSalesViewMode] = useState("monthly"); // "monthly" | "quarterly"
  const [ordersDayData, setOrdersDayData] = useState([]); // Orders Chart Data (Min-Sab)
  const [rawMonthlyData, setRawMonthlyData] = useState([]); // Store raw monthly aggregation
  const [avgMonthlyOrders, setAvgMonthlyOrders] = useState(0);

  // Metrics State
  const [metrics, setMetrics] = useState([
    {
      title: "Total Penjualan",
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
      title: "Total Pesanan",
      value: 0,
      format: "number",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: ShoppingBag,
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
      icon: MousePointer,
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
      icon: ShoppingBag,
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
      icon: Users,
      isDummy: false,
      color: "cyan",
    },
    {
      title: "Produk Terjual",
      value: 0,
      format: "number",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: Package,
      isDummy: true, // Still dummy as per plan
      color: "pink",
    },
  ]);

  // Helper to merge sparklines (for Multi-Store selection)
  const mergeSparklines = (base, incoming) => {
    if (!incoming || incoming.length === 0) return base;
    if (!base || base.length === 0) return incoming.map((i) => ({ ...i }));

    const incomingMap = new Map(incoming.map((i) => [i.tanggal, i]));

    return base.map((b) => {
      const inc = incomingMap.get(b.tanggal) || { total: 0 };
      return { ...b, total: Number(b.total) + Number(inc.total) };
    });
  };

  // 1. Fetch METRICS Data (Follows Filter)
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

        // Determine target stores
        let targetStores = [];
        if (store === "all") {
          targetStores = stores.filter((s) => s && s.id);
        } else {
          targetStores = [{ id: store }];
        }

        if (targetStores.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch function for single store
        const fetchStoreMetrics = async (id) => {
          const payload = {
            store_id: id,
            date_from: fromDate,
            date_to: toDate,
          };
          const [salesRes, ordersRes, visitorsRes, crRes, bsRes] =
            await Promise.all([
              api.dashboard.totalPenjualan(payload),
              api.dashboard.totalPesanan(payload),
              api.dashboard.totalPengunjung(payload),
              api.dashboard.conversionRate(payload),
              api.dashboard.basketSize(payload),
            ]);

          const extract = (res) => ({
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

        // If Single Store, we leverage backend Trend %
        if (store !== "all" && targetStores.length === 1) {
          const res = await fetchStoreMetrics(targetStores[0].id);

          setMetrics((prev) => {
            const newMetrics = [...prev];
            const update = (idx, dataObj, fmt, isDummy = false) => {
              newMetrics[idx] = {
                ...newMetrics[idx],
                value: dataObj.current,
                format: fmt,
                trend: isDummy ? "0%" : `${dataObj.percent.toFixed(1)}%`,
                trendUp: dataObj.percent >= 0,
                // Simplify sparkline to array of numbers for the card
                data:
                  dataObj.sparkline.length > 0
                    ? dataObj.sparkline.map((d) => Number(d.total))
                    : [0, 0, 0, 0, 0, 0, 0],
                isDummy: isDummy,
              };
            };

            update(0, res.sales, "currency");
            update(1, res.orders, "number");
            update(2, res.cr, "percent");
            update(3, res.bs, "currency");
            update(4, res.visitors, "number");
            // Index 5 (Produk Terjual) is skipped/kept as dummy
            return newMetrics;
          });
        } else {
          // If Multi Store, we must aggregate manually.
          // LIMITATION: We cannot calculate weighted trend % without previous period data.
          // So trend % will be 0 for 'all'.

          const results = await Promise.all(
            targetStores.map((s) => fetchStoreMetrics(s.id))
          );

          let aggSales = { current: 0, percent: 0, sparkline: [] };
          let aggOrders = { current: 0, percent: 0, sparkline: [] };
          let aggVisitors = { current: 0, percent: 0, sparkline: [] };
          // CR and BS are derived
          let aggCR = { current: 0, percent: 0, sparkline: [] };
          let aggBS = { current: 0, percent: 0, sparkline: [] };

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

          // Derive BS
          aggBS.current =
            aggOrders.current > 0 ? aggSales.current / aggOrders.current : 0;
          // Derive CR
          aggCR.current =
            aggVisitors.current > 0
              ? (aggOrders.current / aggVisitors.current) * 100
              : 0;

          setMetrics((prev) => {
            const newMetrics = [...prev];
            const update = (idx, dataObj, fmt) => {
              newMetrics[idx] = {
                ...newMetrics[idx],
                value: dataObj.current,
                format: fmt,
                trend: "0%", // Hardcoded for aggregate
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

    if (dateRange?.startDate) {
      loadMetrics();
    }
  }, [store, stores, dateRange]);

  // 2. Fetch CHART Data (Fixed 1 Jan - 31 Dec of Selected Year)
  useEffect(() => {
    const loadChartData = async () => {
      // Determine Year from dateRange (default to current year if undefined)
      const targetDate = dateRange?.endDate || new Date();
      // const year = getYear(targetDate); // Unused for now
      const startOfYearDate = format(startOfYear(targetDate), "yyyy-MM-dd");
      const endOfYearDate = format(endOfYear(targetDate), "yyyy-MM-dd");

      // Generate 12-Month Skeleton (Jan-Des in Indonesian)
      const monthsSkeleton = eachMonthOfInterval({
        start: startOfYear(targetDate),
        end: endOfYear(targetDate),
      }).map((date) => ({
        originalDate: date,
        monthKey: format(date, "MMM yyyy", { locale: idLocale }), // e.g., "Jan 2024"
        displayMonth: format(date, "MMM", { locale: idLocale }), // "Jan", "Feb"
        sales: 0,
        orders: 0,
        basketSize: 0,
        _basketSizeSum: 0, // Helper for averaging
        _basketSizeCount: 0, // Helper for averaging
      }));

      // Determine target stores
      let targetStores = [];
      if (store === "all") {
        targetStores = stores.filter((s) => s && s.id);
      } else {
        targetStores = [{ id: store }];
      }

      if (targetStores.length === 0) return;

      const fetchStoreChart = async (id) => {
        const payload = {
          store_id: id,
          date_from: startOfYearDate,
          date_to: endOfYearDate,
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
          targetStores.map((s) => fetchStoreChart(s.id))
        );

        // Aggregate results into the Skeleton
        results.forEach((res) => {
          // Process Sales
          res.sales.forEach((item) => {
            const date = parseISO(item.tanggal);
            const monthKey = format(date, "MMM yyyy", { locale: idLocale });
            const monthIndex = monthsSkeleton.findIndex(
              (m) => m.monthKey === monthKey
            );
            if (monthIndex !== -1) {
              monthsSkeleton[monthIndex].sales += Number(item.total);
            }
          });

          // Process Orders
          res.orders.forEach((item) => {
            const date = parseISO(item.tanggal);
            const monthKey = format(date, "MMM yyyy", { locale: idLocale });
            const monthIndex = monthsSkeleton.findIndex(
              (m) => m.monthKey === monthKey
            );
            if (monthIndex !== -1) {
              monthsSkeleton[monthIndex].orders += Number(item.total);
            }
          });
        });

        // Finalize Basket Size & Calculate Growth
        // 1. Calculate Basket Size
        const processedSkeleton = monthsSkeleton.map((m) => ({
          ...m,
          basketSize: calculateBasketSize(m.sales, m.orders),
        }));

        // 2. Calculate Growth for relevant metrics
        const finalData = calculateMoMGrowth(processedSkeleton, [
          "sales",
          "orders",
          "basketSize",
        ]);

        // Store raw monthly data for toggle
        setRawMonthlyData(finalData);
        setSalesData(finalData); // Default: Monthly view

        // Aggregate Orders by Day of Week
        // Collect all daily orders from all stores
        let allDailyOrders = [];
        results.forEach((res) => {
          if (res.orders && res.orders.length > 0) {
            allDailyOrders = [...allDailyOrders, ...res.orders];
          }
        });
        const dayOfWeekData = aggregateByDayOfWeek(allDailyOrders);
        setOrdersDayData(dayOfWeekData);

        // Calculate Avg Orders (Monthly Average)
        const totalOrders = finalData.reduce(
          (acc, curr) => acc + curr.orders,
          0
        );
        setAvgMonthlyOrders(Math.round(totalOrders / 12));
      } catch (error) {
        console.error("Chart Data Fetch Error:", error);
      }
    };

    if (stores.length > 0) {
      loadChartData();
    }
  }, [store, stores, dateRange?.endDate]);

  // 3. Fetch OPERATIONAL Chart Data (Follows Filter - for Day of Week Analysis)
  useEffect(() => {
    const loadOperationalData = async () => {
      // Use filter dates (not full year)
      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";

      if (!fromDate || !toDate) return;

      // Determine target stores
      let targetStores = [];
      if (store === "all") {
        targetStores = stores.filter((s) => s && s.id);
      } else {
        targetStores = [{ id: store }];
      }

      if (targetStores.length === 0) return;

      try {
        // Fetch Orders data for all stores
        const results = await Promise.all(
          targetStores.map(async (s) => {
            const payload = {
              store_id: s.id,
              date_from: fromDate,
              date_to: toDate,
            };
            const ordersRes = await api.dashboard.totalPesanan(payload);
            return ordersRes.data?.data?.sparkline || [];
          })
        );

        // Collect all daily orders
        let allDailyOrders = [];
        results.forEach((sparkline) => {
          if (sparkline && sparkline.length > 0) {
            allDailyOrders = [...allDailyOrders, ...sparkline];
          }
        });

        // Aggregate by Day of Week (now uses AVERAGE)
        const dayOfWeekData = aggregateByDayOfWeek(allDailyOrders);
        setOrdersDayData(dayOfWeekData);
      } catch (error) {
        console.error("Operational Chart Fetch Error:", error);
      }
    };

    if (stores.length > 0 && dateRange?.startDate) {
      loadOperationalData();
    }
  }, [store, stores, dateRange]);

  // 4. Handle Sales View Mode Toggle (Monthly <-> Quarterly)
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
          {/* Upload Data Button */}
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 mr-2"
          >
            <Upload size={18} strokeWidth={2.5} />
            <span className="font-bold text-sm">Upload Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Charts Area (Tabbed) */}
        <div className="lg:col-span-2 h-full min-h-0">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  Analisa Tren
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tren penjualan, jumlah order, dan pertumbuhan
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setSalesViewMode("monthly")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    salesViewMode === "monthly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setSalesViewMode("quarterly")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    salesViewMode === "quarterly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  Kuartal
                </button>
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
                    tickFormatter={(val) => {
                      if (val >= 1000000000)
                        return `${(val / 1000000000).toFixed(1)}M`;
                      if (val >= 1000000)
                        return `${(val / 1000000).toFixed(0)}jt`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
                      return val;
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={<ChartTooltip type="auto" />}
                    cursor={{ stroke: chartUI.cursor.stroke }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Total Penjualan"
                    stroke={chartColors.primary}
                    fill="url(#colorSales)"
                    strokeWidth={3}
                  />
                  {/* Hidden Area for Tooltip Context */}
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Total Pesanan"
                    stroke="transparent"
                    fill="transparent"
                    strokeWidth={0}
                    activeDot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="basketSize"
                    name="Basket Size"
                    stroke="transparent"
                    fill="transparent"
                    strokeWidth={0}
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Side Chart: Day Analysis (Orders) */}
        <div className="h-full min-h-0">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10">
              <CardTitle className="text-lg font-bold">
                Analisa Operasional
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Rata-rata pesanan per hari (sesuai filter)
              </p>
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
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Premium MetricCard Component (Reused)
const MetricCard = ({ metric }) => {
  const colorThemes = {
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

  const highlightThemes = {
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

          <div
            className={`absolute -bottom-3 -right-3 opacity-[0.08] rotate-12 pointer-events-none`}
          >
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
                {/* Sparkline restored */}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.data.map((v, i) => ({ i, v }))}>
                    <defs>
                      <linearGradient
                        id={`grad-${metric.color}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            metric.highlight ? "#ffffff" : theme.accent
                          }
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            metric.highlight ? "#ffffff" : theme.accent
                          }
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={metric.highlight ? "#ffffff" : theme.accent}
                      fill={`url(#grad-${metric.color})`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>
      </FeatureNotReady>
    </div>
  );
};

export default DashboardOverview;
