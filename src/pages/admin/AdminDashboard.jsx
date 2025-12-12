import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity,
  UserPlus,
  percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import FeatureNotReady from "../../components/common/FeatureNotReady";
import { Badge } from "@/components/ui/badge";
import { DashboardService } from "../../services/DashboardService";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    conversionRate: { total: 0, percent: 0, trend: "Equal" },
    basketSize: { total: 0, percent: 0, trend: "Equal" },
    totalVisitors: { total: 0, percent: 0, trend: "Equal" },
    totalNewBuyers: { total: 0, percent: 0, trend: "Equal" },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Date Range (Current Month)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    // Format YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split("T")[0];
    return {
      date_from: formatDate(firstDay),
      date_to: formatDate(lastDay),
    };
  });

  const [storeId, setStoreId] = useState(1);

  useEffect(() => {
    fetchStats();
  }, [dateRange, storeId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getStats({
        store_id: storeId,
        date_from: dateRange.date_from,
        date_to: dateRange.date_to,
      });
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Gagal memuat data statistik.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Helper to format number
  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
  };

  const statCards = [
    {
      label: "Convertion Rate",
      value: `${stats.conversionRate?.total?.toFixed(2)}%`,
      icon: Activity,
      color: "blue",
      trend: stats.conversionRate?.trend,
      change: `${stats.conversionRate?.percent}%`,
    },
    {
      label: "Basket Size",
      value: formatCurrency(stats.basketSize?.total || 0),
      icon: ShoppingBag,
      color: "orange",
      trend: stats.basketSize?.trend,
      change: `${stats.basketSize?.percent}%`,
    },
    {
      label: "Total Pengunjung",
      value: formatNumber(stats.totalVisitors?.total || 0),
      icon: Users,
      color: "green",
      trend: stats.totalVisitors?.trend,
      change: `${stats.totalVisitors?.percent}%`,
    },
    {
      label: "Total Pembeli Baru",
      value: formatNumber(stats.totalNewBuyers?.total || 0),
      icon: UserPlus,
      color: "purple",
      trend: stats.totalNewBuyers?.trend,
      change: `${stats.totalNewBuyers?.percent}%`,
      note: "(Data Dummy - API Belum Tersedia)",
      isNotReady: true, // Flag for FeatureNotReady
    },
  ];

  /* Charts Data (Still Dummy for now) */
  const chartData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Tinjauan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Statistik Toko: {dateRange.date_from} s/d {dateRange.date_to}
          </p>
        </div>

        {/* Actions Placeholder */}
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isUp = stat.trend === "Up";
          const isDown = stat.trend === "Down";

          const CardContent = (
            <div
              key={index}
              className="glass-card p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}
                >
                  <Icon size={24} />
                </div>
                <Badge
                  variant={
                    isUp ? "success" : isDown ? "destructive" : "secondary"
                  }
                  className="px-2 py-1"
                >
                  {isUp && "+"}
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {loading ? "..." : stat.value}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.note && (
                  <span className="text-xs text-orange-500">{stat.note}</span>
                )}
              </div>
            </div>
          );

          if (stat.isNotReady) {
            return (
              <FeatureNotReady key={index} message="Segera Hadir" blur={true}>
                {CardContent}
              </FeatureNotReady>
            );
          }

          return CardContent;
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Tren Penjualan (Dummy)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">
            Aktivitas Pengunjung (Dummy)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
