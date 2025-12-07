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
        // Fix: Use startDate and endDate from FilterContext correctly
        const fromDate = dateRange?.startDate;
        const toDate = dateRange?.endDate;

        const dateParams = {
          date_from: fromDate ? format(fromDate, "yyyy-MM-dd") : "",
          date_to: toDate ? format(toDate, "yyyy-MM-dd") : "",
        };

        // console.log("DEBUG: Fetching Stats with params:", dateParams);

        let totalSales = 0;
        let totalOrders = 0;

        if (store === "all") {
          // --- AGGREGATION LOGIC FOR ALL STORES ---
          // Filter active stores only
          const activeStores = stores.filter((s) => s.IsActive !== false);

          if (activeStores.length > 0) {
            // Fetch stats for each store in parallel
            const statPromises = activeStores.map((s) =>
              api.dashboard.getStats({ ...dateParams, store_id: s.ID || s.id })
            );

            const results = await Promise.all(statPromises);

            // Sum up the results
            results.forEach((res) => {
              totalSales += res.totalSales || 0;
              totalOrders += res.totalOrders || 0;
            });
          }
        } else {
          // --- SINGLE STORE LOGIC ---
          const stats = await api.dashboard.getStats({
            ...dateParams,
            store_id: store,
          });
          totalSales = stats.totalSales || 0;
          totalOrders = stats.totalOrders || 0;
        }

        // Update UI State
        setMetrics((prev) => {
          const newMetrics = [...prev];
          // Total Penjualan
          newMetrics[0] = {
            ...newMetrics[0],
            value: formatCurrency(totalSales),
          };
          // Total Pesanan
          newMetrics[1] = { ...newMetrics[1], value: totalOrders.toString() };
          return newMetrics;
        });
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Ensure we trigger fetch when dates change (and dates exist)
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
        <Card className="lg:col-span-2 flex flex-col glass-card-strong rounded-2xl">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">
                Tren Penjualan
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Perbandingan {currentYear} vs {lastYear}
              </p>
            </div>
            {/* Legend Placeholder */}
            <div className="flex items-center gap-4 text-xs opacity-50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>{currentYear}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>{lastYear}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 relative">
            <FeatureNotReady blur={true} overlay={true} message="Segera Hadir">
              {/* Empty Chart for Visual Placeholder */}
              <div className="w-full h-full"></div>
            </FeatureNotReady>
          </CardContent>
        </Card>

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

export default DashboardOverview;
