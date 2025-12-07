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
  LabelList,
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
import { useFilter } from "../context/FilterContext";
import { api } from "../services/api";
import FeatureNotReady from "../components/common/FeatureNotReady";

const DashboardOverview = () => {
  const { store, stores, dateRange } = useFilter();
  const [loading, setLoading] = useState(true);

  // Chart Data States
  const [salesData, setSalesData] = useState([]);
  const [dailyOrdersData, setDailyOrdersData] = useState([]);

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
    },
    {
      title: "Total Pesanan",
      value: "0",
      trend: "0%",
      trendUp: true,
      data: [],
      icon: ShoppingBag,
      isDummy: false,
    },
    // Placeholders for metrics not yet connected
    {
      title: "Convertion Rate",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: MousePointer,
      isDummy: true,
    },
    {
      title: "Basket Size",
      value: "-",
      trend: "0%",
      trendUp: true,
      data: [],
      icon: ShoppingBag,
      isDummy: true,
    },
    {
      title: "Total Pengunjung",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: Users,
      isDummy: true,
    },
    {
      title: "Total Pembeli Baru",
      value: "-",
      trend: "0%",
      trendUp: false,
      data: [],
      icon: UserPlus,
      isDummy: true,
    },
  ]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const formatCurrency = (val) => {
    if (val >= 1000000000) return `Rp${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)} jt`;
    if (val >= 1000) return `Rp${(val / 1000).toFixed(1)} rb`;
    return `Rp${val}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [store, stores, dateRange]);

  const fetchDashboardData = async () => {
    console.log(
      "DEBUG: fetchDashboardData triggered. Store:",
      store,
      "DateRange:",
      dateRange
    );

    if (!stores.length && store === "all") {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        date_from: formatDate(dateRange.startDate),
        date_to: formatDate(dateRange.endDate),
      };

      let penjualanResult = { total: 0, percent: 0, sparkline: [] };
      let pesananResult = { total: 0, percent: 0, sparkline: [] };

      if (store === "all") {
        // AGGREGATION LOGIC
        // 1. Fetch data for ALL active stores concurrently
        const activeStores = stores.filter(
          (s) => s.IsActive || s.is_active !== false
        );

        if (activeStores.length === 0) {
          setLoading(false);
          return;
        }

        const stats = await Promise.all(
          activeStores.map(async (s) => {
            const p = { ...payload, store_id: s.ID || s.id };
            try {
              const [resPenjualan, resPesanan] = await Promise.all([
                api.dashboard.totalPenjualan(p),
                api.dashboard.totalPesanan(p),
              ]);
              return {
                penjualan: resPenjualan.data.data,
                pesanan: resPesanan.data.data,
              };
            } catch (e) {
              console.warn(`Failed to fetch for store ${s.Name}`, e);
              return null;
            }
          })
        );

        // 2. Sum Totals and Merge Sparklines
        const sparklineMapPenjualan = {};
        const sparklineMapPesanan = {};
        let totalPercentPenjualanSum = 0; // Aproximation for avg percent
        let totalPercentPesananSum = 0;
        let validCount = 0;

        stats.forEach((stat) => {
          if (!stat) return;
          validCount++;
          // Sum Totals
          penjualanResult.total += stat.penjualan.total;
          pesananResult.total += stat.pesanan.total;

          totalPercentPenjualanSum += stat.penjualan.percent;
          totalPercentPesananSum += stat.pesanan.percent;

          // Merge Sparklines (Sum by Date)
          stat.penjualan.sparkline.forEach((item) => {
            const date = item.tanggal.split("T")[0];
            if (!sparklineMapPenjualan[date]) sparklineMapPenjualan[date] = 0;
            sparklineMapPenjualan[date] += item.total;
          });

          stat.pesanan.sparkline.forEach((item) => {
            const date = item.tanggal.split("T")[0];
            if (!sparklineMapPesanan[date]) sparklineMapPesanan[date] = 0;
            sparklineMapPesanan[date] += item.total;
          });
        });

        // Convert Maps back to Arrays
        penjualanResult.sparkline = Object.keys(sparklineMapPenjualan)
          .sort()
          .map((date) => ({
            tanggal: date,
            total: sparklineMapPenjualan[date],
          }));

        pesananResult.sparkline = Object.keys(sparklineMapPesanan)
          .sort()
          .map((date) => ({
            tanggal: date,
            total: sparklineMapPesanan[date],
          }));

        // Average Percent (Simple Avg, technically slightly inaccurate but usable for dashboard trend)
        if (validCount > 0) {
          penjualanResult.percent = totalPercentPenjualanSum / validCount;
          pesananResult.percent = totalPercentPesananSum / validCount;
        }
      } else {
        // SINGLE STORE LOGIC
        const p = { ...payload, store_id: parseInt(store) };
        const [resPenjualan, resPesanan] = await Promise.all([
          api.dashboard.totalPenjualan(p),
          api.dashboard.totalPesanan(p),
        ]);
        penjualanResult = resPenjualan.data.data;
        pesananResult = resPesanan.data.data;
      }

      // 3. Update States
      // Main Chart (Penjualan)
      const formattedSalesData = penjualanResult.sparkline.map((item) => ({
        name: new Date(item.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        value: item.total, // Keep full value for tooltip
        displayValue: (item.total / 1000000).toFixed(1), // For label if needed
      }));
      setSalesData(formattedSalesData);

      // Orders Chart
      const formattedOrdersData = pesananResult.sparkline.map((item) => ({
        name: new Date(item.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        value: item.total,
      }));
      setDailyOrdersData(formattedOrdersData);

      // Cards
      setMetrics((prev) => [
        {
          ...prev[0], // Total Penjualan
          value: formatCurrency(penjualanResult.total),
          trend: `${penjualanResult.percent.toFixed(1)}%`,
          trendUp: penjualanResult.percent >= 0,
          data: penjualanResult.sparkline.map((s) => s.total),
        },
        {
          ...prev[1], // Total Pesanan
          value: pesananResult.total.toLocaleString("id-ID"),
          trend: `${pesananResult.percent.toFixed(1)}%`,
          trendUp: pesananResult.percent >= 0,
          data: pesananResult.sparkline.map((s) => s.total),
        },
        ...prev.slice(2), // Keep others as placeholders
      ]);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom Label for Line Chart
  const CustomLabel = (props) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    // Simplified label logic to avoid clutter: show only if distinct or minimal
    return null;
    // (Optional: Restore if needed, but usually redundant with tooltip on dense charts)
  };

  // Custom Label for Bar Chart
  const BarLabel = (props) => {
    const { x, y, width, value } = props;
    if (!value) return null;
    return (
      <text
        x={x + width / 2}
        y={y}
        dy={-5}
        fill="#666"
        fontSize={10}
        textAnchor="middle"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-none">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard Tinjauan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ringkasan performa toko Anda
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/upload"
            className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition-all flex items-center shadow-sm hover:shadow-md"
          >
            <UploadCloud size={16} className="mr-2" />
            Upload Data
          </Link>
        </div>
      </div>

      {/* Metric Cards Row - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <div key={index} className="h-full">
            <FeatureNotReady
              blur={metric.isDummy}
              overlay={metric.isDummy}
              message="Segera Hadir"
            >
              <div
                className={`p-3 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full ${
                  metric.highlight
                    ? "bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}
              >
                {/* Faint Background Icon for Highlighted Card */}
                {metric.highlight && (
                  <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12 pointer-events-none">
                    <metric.icon size={80} />
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className={`text-[10px] uppercase tracking-wider font-semibold ${
                        metric.highlight
                          ? "text-orange-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {metric.title}
                    </h3>
                    <div
                      className={`p-1 rounded-md ${
                        metric.highlight
                          ? "bg-white/20 text-white"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <metric.icon size={12} />
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold mb-1 ${
                      metric.highlight
                        ? "text-white"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {metric.value}
                  </p>

                  <div className="flex items-end justify-between">
                    <span
                      className={`flex items-center text-[10px] font-medium ${
                        metric.highlight
                          ? "text-white/90"
                          : metric.trendUp
                          ? "text-teal-500"
                          : "text-red-500"
                      }`}
                    >
                      {metric.trendUp ? "↑" : "↓"} {metric.trend}
                    </span>

                    {/* Mini Sparkline */}
                    <div className="w-12 h-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metric.data.map((v, i) => ({ i, v }))}>
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={
                              metric.highlight
                                ? "#ffffff"
                                : metric.trendUp
                                ? "#14b8a6"
                                : "#ef4444"
                            }
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </FeatureNotReady>
          </div>
        ))}
      </div>

      {/* Charts Area - Flexible */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
            Tren Penjualan
          </h3>
          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="text-center text-gray-400 text-xs mt-10">
                Loading...
              </div>
            ) : salesData.length === 0 ? (
              <div className="text-center text-gray-400 text-xs mt-10">
                Tidak ada data. Silakan upload data penjualan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    dy={5}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => `Rp${value.toLocaleString("id-ID")}`}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: "#f97316",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom Charts Column */}
        <div className="flex flex-col gap-4">
          {/* Total Pesanan (Daily) */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
              Total Pesanan
            </h3>
            <div className="flex-1 min-h-0">
              {dailyOrdersData.length === 0 ? (
                <div className="text-center text-gray-400 text-xs mt-10">
                  Tidak ada data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyOrdersData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      dy={5}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar
                      dataKey="value"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    >
                      <LabelList content={<BarLabel />} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* YoY Growth - MOCKED FOR NOW */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 flex flex-col relative overflow-hidden">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">
              YoY Growth
            </h3>
            <div className="flex-1 min-h-0 flex items-center justify-center opacity-50">
              <p className="text-xs text-gray-400 text-center">
                Data YoY belum tersedia dari backend.
              </p>
            </div>
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-gray-50/10 backdrop-blur-[1px] " />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
