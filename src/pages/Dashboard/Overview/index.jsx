import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  MousePointer,
  Users,
  UserPlus,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFilter } from "../../../context/FilterContext";
import { api } from "../../../services/api";
import FeatureNotReady from "../../../components/common/FeatureNotReady";
import { format } from "date-fns";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DashboardOverview = () => {
  const { store, stores, dateRange } = useFilter();
  const [loading, setLoading] = useState(true);

  // Metrics State
  const [metrics, setMetrics] = useState([
    {
      title: "Total Penjualan",
      value: "Rp0",
      trend: "0%",
      trendUp: true,
      data: [],
      icon: DollarSign,
      highlight: true,
      isDummy: false,
      color: "orange",
    },
    {
      title: "Total Pesanan",
      value: "0",
      trend: "0%",
      trendUp: true,
      data: [],
      icon: ShoppingBag,
      isDummy: false,
      color: "blue",
    },
    {
      title: "Convertion Rate",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: MousePointer,
      isDummy: true,
      color: "purple",
    },
    {
      title: "Basket Size",
      value: "-",
      trend: "0%",
      trendUp: true,
      data: [],
      icon: ShoppingBag,
      isDummy: true,
      color: "emerald",
    },
    {
      title: "Total Pengunjung",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: Users,
      isDummy: true,
      color: "cyan",
    },
    {
      title: "Total Pembeli Baru",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: UserPlus,
      isDummy: true,
      color: "pink",
    },
  ]);

  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  // Fetch Metrics Data (With Manual Aggregation for 'All Stores')
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const fromDate = dateRange?.startDate;
        const toDate = dateRange?.endDate;

        const dateParams = {
          date_from: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
          date_to: toDate ? format(toDate, "yyyy-MM-dd") : "",
        };

        // Initialize Aggregates
        let aggSales = { current: 0, previous: 0 };
        let aggOrders = { current: 0, previous: 0 };
        let aggVisitors = { current: 0, previous: 0 };

        // Helper to fetch details including percent for a store
        const fetchStoreDetails = async (id) => {
          const params = { ...dateParams, store_id: id };
          try {
            const [salesRes, ordersRes, visitorsRes] = await Promise.all([
              api.dashboard.totalPenjualan(params),
              api.dashboard.totalPesanan(params),
              api.dashboard.totalPengunjung(params),
            ]);

            const extract = (res) => {
              const current = Number(res.data?.data?.total || 0);
              const percent = Number(res.data?.data?.percent || 0);
              // Reverse calculate previous value: Previous = Current / (1 + Percent/100)
              // Handle edge case where percent is -100 (Previous was X, Current is 0) -> Formula breaks if Current is 0?
              // Actually, if Current is 0, we can't easily know previous unless we check if percent is -100.
              // But simpler formula: previous = current - (change), where change = previous * percent.
              // Wait, standard: Change% = ((Curr - Prev)/Prev) * 100
              // Curr = Prev * (1 + P/100)
              // Prev = Curr / (1 + P/100)
              // If Prev was 0, Percent is usually 0 or handled by backend as 100% if current > 0.

              let previous = 0;
              if (percent === 100 && current > 0)
                previous = 0; // Pure growth from 0
              else if (percent !== 0) previous = current / (1 + percent / 100);
              else previous = current; // No change

              return { current, percent, previous };
            };

            return {
              sales: extract(salesRes),
              orders: extract(ordersRes),
              visitors: extract(visitorsRes),
            };
          } catch (e) {
            console.error(`Error fetching stats for store ${id}`, e);
            return {
              sales: { current: 0, percent: 0, previous: 0 },
              orders: { current: 0, percent: 0, previous: 0 },
              visitors: { current: 0, percent: 0, previous: 0 },
            };
          }
        };

        if (store === "all") {
          // --- AGGREGATION LOGIC ---
          const activeStores = stores.filter((s) => s.IsActive !== false);
          if (activeStores.length > 0) {
            const results = await Promise.all(
              activeStores.map((s) => fetchStoreDetails(s.ID || s.id))
            );

            results.forEach((res) => {
              aggSales.current += res.sales.current;
              aggSales.previous += res.sales.previous;

              aggOrders.current += res.orders.current;
              aggOrders.previous += res.orders.previous;

              aggVisitors.current += res.visitors.current;
              aggVisitors.previous += res.visitors.previous;
            });
          }
        } else {
          // --- SINGLE STORE LOGIC ---
          const res = await fetchStoreDetails(store);
          aggSales = res.sales;
          aggOrders = res.orders;
          aggVisitors = res.visitors;
        }

        // --- CALCULATE FINAL GROWTH TRENDS ---
        const calculateTrend = (current, previous) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const salesGrowth = calculateTrend(aggSales.current, aggSales.previous);
        const ordersGrowth = calculateTrend(
          aggOrders.current,
          aggOrders.previous
        );

        // Visitors Trend
        // Note: For single store, the API technically returns the exact percent, but recalculating it ensures consistency with "All Stores".
        // Small floating point differences might occur, but acceptable for UI display.
        const visitorsGrowth = calculateTrend(
          aggVisitors.current,
          aggVisitors.previous
        );

        // Derived Metrics: Conversion Rate
        const currentCR =
          aggVisitors.current > 0
            ? (aggOrders.current / aggVisitors.current) * 100
            : 0;
        const previousCR =
          aggVisitors.previous > 0
            ? (aggOrders.previous / aggVisitors.previous) * 100
            : 0;
        const crGrowth = calculateTrend(currentCR, previousCR);

        // Derived Metrics: Basket Size
        const currentBS =
          aggOrders.current > 0 ? aggSales.current / aggOrders.current : 0;
        const previousBS =
          aggOrders.previous > 0 ? aggSales.previous / aggOrders.previous : 0;
        const bsGrowth = calculateTrend(currentBS, previousBS);

        // Update UI State
        setMetrics((prev) => {
          const newMetrics = [...prev];

          const updateMetric = (index, value, growth, prefix = "") => {
            const isUp = growth >= 0;
            newMetrics[index] = {
              ...newMetrics[index],
              value: value,
              trend: `${Math.abs(growth).toFixed(1)}%`,
              trendUp: isUp,
              isDummy: false,
            };
          };

          // 1. Total Penjualan
          updateMetric(0, formatCurrency(aggSales.current), salesGrowth);

          // 2. Total Pesanan
          updateMetric(1, aggOrders.current.toString(), ordersGrowth);

          // 3. Conversion Rate
          updateMetric(2, `${currentCR.toFixed(2)}%`, crGrowth);

          // 4. Basket Size
          updateMetric(3, formatCurrency(currentBS), bsGrowth);

          // 5. Total Pengunjung
          updateMetric(
            4,
            aggVisitors.current.toLocaleString("id-ID"),
            visitorsGrowth
          );

          // 6. Total Pembeli Baru (Still Dummy)
          newMetrics[5] = { ...newMetrics[5], value: "0", isDummy: true };

          return newMetrics;
        });
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dateRange?.startDate && dateRange?.endDate) {
      fetchDashboardData();
    }
  }, [store, stores, dateRange]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-none">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard Tinjauan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan performa toko Anda
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 transition-all duration-300"
          >
            <Link to="/upload">
              <UploadCloud size={16} className="mr-2" />
              Upload Data
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 flex-none">
        {metrics.map((metric, index) => {
          const colorThemes = {
            orange: {
              iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
              iconText: "text-white",
              accent: "#f97316",
              accentClass: "from-orange-500 to-orange-500/80",
            },
            blue: {
              iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
              iconText: "text-white",
              accent: "#3b82f6",
              accentClass: "from-blue-500 to-blue-500/80",
            },
            purple: {
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
              iconText: "text-white",
              accent: "#a855f7",
              accentClass: "from-purple-500 to-purple-500/80",
            },
            emerald: {
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
              iconText: "text-white",
              accent: "#10b981",
              accentClass: "from-emerald-500 to-emerald-500/80",
            },
            cyan: {
              iconBg: "bg-gradient-to-br from-cyan-500 to-sky-500",
              iconText: "text-white",
              accent: "#06b6d4",
              accentClass: "from-cyan-500 to-cyan-500/80",
            },
            pink: {
              iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
              iconText: "text-white",
              accent: "#ec4899",
              accentClass: "from-pink-500 to-pink-500/80",
            },
          };

          const theme = colorThemes[metric.color] || colorThemes.orange;

          return (
            <div key={index} className="h-full">
              <FeatureNotReady
                blur={metric.isDummy}
                overlay={metric.isDummy}
                message="Segera Hadir"
              >
                <Card
                  className={`relative overflow-hidden h-full transition-all duration-300 hover:scale-[1.02] rounded-2xl ${
                    metric.highlight
                      ? "bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white border-transparent shadow-2xl shadow-orange-500/40 ring-1 ring-white/20"
                      : "glass-card hover:shadow-2xl"
                  }`}
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
                          metric.highlight
                            ? "text-white/90"
                            : "text-muted-foreground"
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
                      {metric.value}
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
                          <LineChart
                            data={metric.data.map((v, i) => ({ i, v }))}
                          >
                            <Line
                              type="monotone"
                              dataKey="v"
                              stroke={
                                metric.highlight ? "#ffffff" : theme.accent
                              }
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
        })}
      </div>

      {/* Charts Area - WAITING FOR API BACKEND */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Sales Trend - YoY Comparison */}
        <SalesTrendChart storeId={store} stores={stores} />

        {/* Monthly Orders */}
        <Card className="flex flex-col glass-card-strong rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Pesanan Bulanan {currentYear}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total pesanan per bulan
            </p>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 relative">
            <FeatureNotReady blur={true} overlay={true} message="Segera Hadir">
              {/* Empty Chart for Visual Placeholder */}
              <div className="w-full h-full"></div>
            </FeatureNotReady>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sub-component for Sales Trend Chart to keep main component clean
const SalesTrendChart = ({ storeId, stores }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Prepare buckets for 12 months
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          name: new Date(0, i).toLocaleString("id-ID", { month: "short" }),
          [currentYear]: 0,
          [lastYear]: 0,
        }));

        const fetchYearlyData = async (id, year) => {
          const params = {
            store_id: id,
            date_from: `${year}-01-01`,
            date_to: `${year}-12-31`,
          };
          try {
            const res = await api.dashboard.trenPenjualan(params);
            return res.data?.data || [];
          } catch (e) {
            console.error("Error fetching trend:", e);
            return [];
          }
        };

        let shopsToFetch = [];
        if (storeId === "all") {
          shopsToFetch = stores
            .filter((s) => s.IsActive !== false)
            .map((s) => s.ID || s.id);
        } else {
          shopsToFetch = [storeId];
        }

        // Fetch Current Year and Last Year in parallel
        const fetchAllForYear = async (year) => {
          const promises = shopsToFetch.map((id) => fetchYearlyData(id, year));
          const results = await Promise.all(promises);

          // Aggregate results
          const yearTotals = new Array(12).fill(0);
          results.forEach((storeData) => {
            storeData.forEach((item, index) => {
              if (index < 12) yearTotals[index] += Number(item.total || 0);
            });
          });
          return yearTotals;
        };

        const [currentYearTotals, lastYearTotals] = await Promise.all([
          fetchAllForYear(currentYear),
          fetchAllForYear(lastYear),
        ]);

        // Update chart data
        const finalData = monthlyData.map((item, index) => ({
          ...item,
          [currentYear]: currentYearTotals[index],
          [lastYear]: lastYearTotals[index],
        }));

        setChartData(finalData);
      } catch (err) {
        console.error("Failed loading trend chart", err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchData();
    }
  }, [storeId, stores]);

  const formatCurrencyShort = (value) => {
    if (value >= 1000000000) return `Rp${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}rb`;
    return `Rp${value}`;
  };

  return (
    <Card className="lg:col-span-2 flex flex-col glass-card-strong rounded-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">Tren Penjualan</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Perbandingan {currentYear} vs {lastYear}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="opacity-70">{currentYear}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="opacity-70">{lastYear}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrencyShort}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--foreground))",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey={currentYear}
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCurrent)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#f97316" }}
              />
              <Area
                type="monotone"
                dataKey={lastYear}
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorLast)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardOverview;
