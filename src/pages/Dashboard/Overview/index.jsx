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
import { Button } from "@/components/ui/button";
import { useFilter } from "../../../context/FilterContext";
import { api } from "../../../services/api";
import FeatureNotReady from "../../../components/common/FeatureNotReady";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import CountUp from "react-countup";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const DashboardOverview = () => {
  const { store, stores, dateRange } = useFilter();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Chart Tabs State
  const [activeTab, setActiveTab] = useState("sales");

  // Data States
  const [salesMonthlyData, setSalesMonthlyData] = useState([]);
  const [ordersDailyData, setOrdersDailyData] = useState([]);
  const [avgDailyOrders, setAvgDailyOrders] = useState(0);

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
      value: 0, // Placeholder
      format: "number",
      trend: "0%",
      trendUp: true,
      data: [0, 0, 0, 0, 0, 0, 0],
      icon: Package,
      isDummy: true, // Mark as dummy
      color: "pink",
    },
  ]);

  // Helper to merge sparklines
  const mergeSparklines = (base, incoming) => {
    if (!incoming || incoming.length === 0) return base;
    if (!base || base.length === 0) return incoming.map((i) => ({ ...i }));

    // Create a map for faster lookup
    const incomingMap = new Map(incoming.map((i) => [i.tanggal, i]));

    return base.map((b) => {
      const inc = incomingMap.get(b.tanggal) || { total: 0 };
      return { ...b, total: Number(b.total) + Number(inc.total) };
    });
  };

  useEffect(() => {
    const fetchStoreDetails = async (id) => {
      const fromDate = dateRange?.startDate
        ? format(dateRange.startDate, "yyyy-MM-dd")
        : "";
      const toDate = dateRange?.endDate
        ? format(dateRange.endDate, "yyyy-MM-dd")
        : "";

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

      const extract = (res) => {
        const data = res.data?.data || {};
        const current = Number(data.total || 0);
        const percent = Number(data.percent || 0);
        const sparkline = data.sparkline || [];
        return { current, percent, sparkline };
      };

      return {
        sales: extract(salesRes),
        orders: extract(ordersRes),
        visitors: extract(visitorsRes),
        cr: extract(crRes),
        bs: extract(bsRes),
      };
    };

    const loadData = async () => {
      setLoading(true);
      try {
        let aggSales = { current: 0, percent: 0, sparkline: [] };
        let aggOrders = { current: 0, percent: 0, sparkline: [] };
        let aggVisitors = { current: 0, percent: 0, sparkline: [] };
        let aggCR = { current: 0, percent: 0, sparkline: [] };
        let aggBS = { current: 0, percent: 0, sparkline: [] };

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

        const results = await Promise.all(
          targetStores.map((s) => fetchStoreDetails(s.id))
        );

        results.forEach((res, idx) => {
          aggSales.current += res.sales.current;
          aggOrders.current += res.orders.current;
          aggVisitors.current += res.visitors.current;

          if (idx === 0) {
            aggSales.sparkline = res.sales.sparkline || [];
            aggOrders.sparkline = res.orders.sparkline || [];
            aggVisitors.sparkline = res.visitors.sparkline || [];
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

        // Recalculate Derived Metrics
        aggBS.current =
          aggOrders.current > 0 ? aggSales.current / aggOrders.current : 0;
        aggCR.current =
          aggVisitors.current > 0
            ? (aggOrders.current / aggVisitors.current) * 100
            : 0;

        // Recalculate Sparklines for Derived Metrics
        if (aggSales.sparkline.length > 0 && aggOrders.sparkline.length > 0) {
          // Ensure lengths match or handle mismatch
          aggBS.sparkline = aggSales.sparkline.map((s, i) => {
            const o = aggOrders.sparkline.find(
              (x) => x.tanggal === s.tanggal
            ) || { total: 0 };
            return {
              tanggal: s.tanggal,
              total:
                Number(o.total) > 0 ? Number(s.total) / Number(o.total) : 0,
            };
          });
        }

        if (
          aggOrders.sparkline.length > 0 &&
          aggVisitors.sparkline.length > 0
        ) {
          aggCR.sparkline = aggVisitors.sparkline.map((v, i) => {
            const o = aggOrders.sparkline.find(
              (x) => x.tanggal === v.tanggal
            ) || { total: 0 };
            return {
              tanggal: v.tanggal,
              total:
                Number(v.total) > 0
                  ? (Number(o.total) / Number(v.total)) * 100
                  : 0,
            };
          });
        }

        // Dummy Growth Data (Since we don't have prev period in this context yet)
        const growth = { sales: 0, orders: 0, cr: 0, bs: 0, visitors: 0 };

        // Update Metrics UI
        setMetrics((prev) => {
          const newMetrics = [...prev];
          const update = (idx, dataObj, fmt, trend) => {
            const sparkline = dataObj.sparkline || [];
            newMetrics[idx] = {
              ...newMetrics[idx],
              value: dataObj.current,
              format: fmt,
              trend: `${trend.toFixed(1)}%`,
              trendUp: trend >= 0,
              data:
                sparkline.length > 0
                  ? sparkline.map((d) => Number(d.total))
                  : [0, 0, 0, 0, 0, 0, 0],
              isDummy: false,
            };
          };

          update(0, aggSales, "currency", growth.sales);
          update(1, aggOrders, "number", growth.orders);
          update(2, aggCR, "percent", growth.cr);
          update(3, aggBS, "currency", growth.bs);
          update(4, aggVisitors, "number", growth.visitors);

          return newMetrics;
        });

        // --- Process Chart Data ---

        // 1. Process Order Data (Daily)
        if (aggOrders.sparkline && aggOrders.sparkline.length > 0) {
          const dailyOrders = aggOrders.sparkline
            .map((d) => ({
              date: d.tanggal,
              displayDate: format(parseISO(d.tanggal), "dd MMM"),
              total: Number(d.total),
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

          setOrdersDailyData(dailyOrders);

          // Calculate Average
          const totalOrders = dailyOrders.reduce(
            (sum, item) => sum + item.total,
            0
          );
          setAvgDailyOrders(
            dailyOrders.length > 0
              ? Math.round(totalOrders / dailyOrders.length)
              : 0
          );
        } else {
          setOrdersDailyData([]);
          setAvgDailyOrders(0);
        }

        // 2. Process Sales Data (Monthly Aggregation)
        if (aggSales.sparkline && aggSales.sparkline.length > 0) {
          const monthlyMap = new Map();

          aggSales.sparkline.forEach((d) => {
            // Ensure date is valid
            if (!d.tanggal) return;
            const date = parseISO(d.tanggal);
            const monthKey = format(date, "MMM yyyy", { locale: idLocale }); // e.g., "Jan 2024"

            const currentTotal = monthlyMap.get(monthKey) || 0;
            monthlyMap.set(monthKey, currentTotal + Number(d.total));
          });

          // Convert Map to Array
          const monthlyData = Array.from(monthlyMap.entries()).map(
            ([month, total]) => ({
              month,
              total,
            })
          ); // Map order depends on insertion, ideally should sort if data spans years

          setSalesMonthlyData(monthlyData);
        } else {
          setSalesMonthlyData([]);
        }
      } catch (error) {
        console.error("Overview Fetch Error:", error);
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
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Main Charts Area (Tabbed) */}
        <div className="h-full min-h-0 w-full">
          <Card className="glass-card-strong rounded-2xl h-full flex flex-col">
            <CardHeader className="py-4 px-6 flex-none border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">
                  Analisis Performa
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  tren penjualan, jumlah order, dan pertumbuhan
                </p>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full sm:w-[400px]"
              >
                <TabsList className="grid w-full grid-cols-3 bg-white/5">
                  <TabsTrigger value="sales">Penjualan</TabsTrigger>
                  <TabsTrigger value="orders">Pesanan</TabsTrigger>
                  <TabsTrigger value="yoy">YoY Growth</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === "sales" && (
                  <AreaChart
                    data={salesMonthlyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
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
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10 }}
                      dy={10}
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
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [
                        new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(value),
                        "Total Penjualan",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#f97316"
                      fill="url(#colorSales)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                )}

                {activeTab === "orders" && (
                  <BarChart
                    data={ordersDailyData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="displayDate"
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
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <ReferenceLine
                      y={avgDailyOrders}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label={{
                        position: "right",
                        value: `Rata-rata: ${avgDailyOrders}`,
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                      }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total Pesanan"
                      radius={[4, 4, 0, 0]}
                    >
                      {ordersDailyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.total > avgDailyOrders ? "#3b82f6" : "#94a3b8"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}

                {activeTab === "yoy" && (
                  <div className="h-full w-full flex items-center justify-center">
                    <FeatureNotReady message="Analisis YoY Segera Hadir" />
                  </div>
                )}
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
