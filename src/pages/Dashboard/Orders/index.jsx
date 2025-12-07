/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import FeatureNotReady from "../../../components/common/FeatureNotReady";
import { api } from "../../../services/api";

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DashboardOrders = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    est_sales: 0,
    total_orders: 0,
    gross_profit: 0,
    gross_margin: 0,
    orders_by_day: [],
    top_products: [],
  });

  // Mock data for background visualization
  const mockData = {
    est_sales: 29200000,
    total_orders: 166,
    gross_profit: 9800000,
    gross_margin: 41.9,
    orders_by_day: [
      { date: "Min", count: 45 },
      { date: "Sen", count: 52 },
      { date: "Sel", count: 38 },
      { date: "Rab", count: 65 },
      { date: "Kam", count: 48 },
      { date: "Jum", count: 55 },
      { date: "Sab", count: 60 },
    ],
    top_products: [
      {
        product_name: "Copic Spidol Warna Set 72",
        total_sales: 2800000,
        quantity: 5,
      },
      {
        product_name: "Daler Rowney System3 500ml",
        total_sales: 2600000,
        quantity: 12,
      },
      {
        product_name: "DAS Modelling Clay 500g",
        total_sales: 2200000,
        quantity: 45,
      },
      {
        product_name: "Canson Watercolor Pad A4",
        total_sales: 1100000,
        quantity: 20,
      },
      {
        product_name: "Giotto Decor Wax Block",
        total_sales: 948400,
        quantity: 15,
      },
    ],
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.dashboard.getOrdersAnalytics();
      const data = response.data;

      if (data && data.total_orders > 0) {
        setStats(data);
      } else {
        setStats(mockData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  };

  // Recharts custom tooltip style
  const tooltipStyle = {
    backgroundColor: "hsl(var(--background))",
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)",
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-fade-in">
      {/* Header & Upload */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard Pesanan Toko
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis performa penjualan berdasarkan data pesanan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
          >
            <Link to="/upload">
              <UploadCloud size={16} className="mr-2" />
              Upload Data
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content with Wrapper */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <FeatureNotReady message="Segera Hadir" overlay={true}>
          <div className="flex flex-col h-full gap-4">
            {/* Stats Cards - 4 Original Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
              <StatsCard
                title="Est. Penjualan"
                value={formatCurrency(stats.est_sales)}
                trend="-5.0%"
                trendUp={false}
                icon={DollarSign}
                highlight={true}
                data={[40, 35, 45, 30, 25, 20, 15]}
                color="orange"
              />
              <StatsCard
                title="Total Pesanan"
                value={stats.total_orders.toString()}
                trend="-33.3%"
                trendUp={false}
                icon={ShoppingBag}
                data={[50, 45, 40, 35, 30, 25, 20]}
                color="blue"
              />
              <StatsCard
                title="Gross Profit"
                value={formatCurrency(stats.gross_profit)}
                trend="-15.7%"
                trendUp={false}
                icon={TrendingUp}
                data={[30, 25, 35, 20, 15, 10, 5]}
                color="emerald"
              />
              <StatsCard
                title="Gross Margin"
                value={`${stats.gross_margin}%`}
                trend="+6.1%"
                trendUp={true}
                icon={ArrowUpRight}
                data={[60, 65, 70, 75, 72, 74, 76]}
                color="purple"
              />
            </div>

            {/* Content Area - Flexible */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
              {/* Left Column: Charts */}
              <div className="flex-[2] flex flex-col gap-4 min-h-0">
                {/* Main Chart - Tren Penjualan */}
                <Card className="flex-1 min-h-0 glass-card-strong rounded-2xl flex flex-col">
                  <CardHeader className="pb-2 flex-none flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold">
                      Tren Penjualan
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Filter size={16} />
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={
                          stats.orders_by_day.length > 0
                            ? stats.orders_by_day
                            : mockData.orders_by_day
                        }
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
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                          }}
                          dy={5}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                          }}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSales)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Daily Orders Chart */}
                <Card className="flex-1 min-h-0 glass-card-strong rounded-2xl flex flex-col">
                  <CardHeader className="pb-2 flex-none">
                    <CardTitle className="text-base font-bold">
                      Pesanan Harian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={
                          stats.orders_by_day.length > 0
                            ? stats.orders_by_day
                            : mockData.orders_by_day
                        }
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 11,
                          }}
                          dy={5}
                        />
                        <Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} />
                        <Bar
                          dataKey="count"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 0, 0]}
                          barSize={28}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Top Products Table */}
              <Card className="flex-1 min-h-0 glass-card-strong rounded-2xl flex flex-col overflow-hidden">
                <CardHeader className="pb-2 flex-none flex flex-row items-center justify-between border-b">
                  <CardTitle className="text-base font-bold">
                    Top Produk
                  </CardTitle>
                  <Link
                    to="/orders/products"
                    className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Lihat Semua →
                  </Link>
                </CardHeader>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Jual
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.top_products.map((product, index) => (
                        <tr
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground">
                            <div className="flex items-center">
                              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mr-2 text-muted-foreground flex-shrink-0">
                                <ShoppingBag size={14} />
                              </div>
                              <span
                                className="line-clamp-1"
                                title={product.product_name}
                              >
                                {product.product_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground text-right">
                            {product.quantity}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-foreground text-right">
                            {formatCurrency(product.total_sales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </FeatureNotReady>
      </div>
    </div>
  );
};

const StatsCard = ({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  highlight,
  data,
  color = "orange",
}) => {
  // Color themes for each metric
  const colorThemes = {
    orange: {
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-500",
      accent: "hsl(var(--orange-500, #f97316))",
      accentClass: "from-orange-500 to-orange-500/80",
    },
    blue: {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-500",
      accent: "hsl(var(--blue-500, #3b82f6))",
      accentClass: "from-blue-500 to-blue-500/80",
    },
    purple: {
      iconBg: "bg-purple-500/10",
      iconText: "text-purple-500",
      accent: "hsl(var(--purple-500, #a855f7))",
      accentClass: "from-purple-500 to-purple-500/80",
    },
    emerald: {
      iconBg: "bg-emerald-500/10",
      iconText: "text-emerald-500",
      accent: "hsl(var(--emerald-500, #10b981))",
      accentClass: "from-emerald-500 to-emerald-500/80",
    },
    cyan: {
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-500",
      accent: "hsl(var(--cyan-500, #06b6d4))",
      accentClass: "from-cyan-500 to-cyan-500/80",
    },
    pink: {
      iconBg: "bg-pink-500/10",
      iconText: "text-pink-500",
      accent: "hsl(var(--pink-500, #ec4899))",
      accentClass: "from-pink-500 to-pink-500/80",
    },
  };

  const theme = colorThemes[color] || colorThemes.orange;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] rounded-2xl ${
        highlight
          ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/40 ring-1 ring-white/20"
          : "glass-card hover:shadow-2xl"
      }`}
    >
      {/* Accent border left for non-highlight cards */}
      {!highlight && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${theme.accentClass}`}
        />
      )}

      {/* Faint Background Icon */}
      <div className="absolute -bottom-3 -right-3 opacity-[0.08] rotate-12 pointer-events-none">
        <Icon size={64} />
      </div>

      <div className="relative z-10 p-4">
        {/* Top Row: Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-2.5 rounded-xl shadow-lg ${
              highlight
                ? "bg-white/20 text-white shadow-white/10"
                : `${theme.iconBg} ${theme.iconText}`
            }`}
          >
            <Icon size={18} strokeWidth={2.5} />
          </div>
          <h3
            className={`text-xs font-semibold leading-tight ${
              highlight ? "text-white/90" : "text-muted-foreground"
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Value - Large and Prominent */}
        <p
          className={`text-2xl font-extrabold tracking-tight mb-2 ${
            highlight ? "text-white" : "text-foreground"
          }`}
        >
          {value}
        </p>

        {/* Bottom Row: Trend Badge + Sparkline */}
        <div className="flex items-center justify-between">
          {/* Trend Badge */}
          <Badge
            variant={trendUp ? "success" : "destructive"}
            className={`px-2 py-0.5 rounded-full ${
              highlight ? "bg-white/20 text-white border-none" : ""
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </Badge>

          {/* Mini Sparkline */}
          {data && (
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={highlight ? "#ffffff" : theme.accent}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DashboardOrders;
