import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Activity, BarChart2, PieChart, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import FeatureNotReady from "../components/common/FeatureNotReady";

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Types Definition (Must match AdminBuilder)
const WIDGET_TYPES = {
  STAT_CARD: { id: "stat_card", name: "Stat Card", icon: Activity },
  LINE_CHART: { id: "line_chart", name: "Line Chart", icon: BarChart2 },
  BAR_CHART: { id: "bar_chart", name: "Bar Chart", icon: BarChart2 },
  PIE_CHART: { id: "pie_chart", name: "Pie Chart", icon: PieChart },
};

// Mock Data for Visualization
const mockChartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "Mei", value: 500 },
];

const DynamicDashboard = () => {
  const [layouts, setLayouts] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching layout from API/DB
    const savedLayout = localStorage.getItem("dashboard_layout");
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      setLayouts(parsed.layouts);
      setWidgets(parsed.widgets);
    }
    setLoading(false);
  }, []);

  if (loading)
    return <div className="p-8 text-center">Loading dashboard...</div>;

  const content =
    !widgets || widgets.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-full mb-4">
          <AlertCircle size={48} className="text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Belum Dikonfigurasi
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          Admin belum mengatur layout untuk dashboard ini. Silakan hubungi
          administrator atau login sebagai admin untuk mengatur layout.
        </p>
        <Link
          to="/admin/builder"
          className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
        >
          Buka Page Builder (Admin)
        </Link>
      </div>
    ) : (
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts || { lg: [] }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        isDraggable={false}
        isResizable={false}
        margin={[16, 16]}
      >
        {widgets.map((widget) => (
          <div key={widget.i} className="relative">
            {renderWidgetContent(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    );

  // Render Widget Content based on Type
  const renderWidgetContent = (widget) => {
    return (
      // Helper wrapper to avoid repetition in switch
      <switch_content widget={widget} />
    );
  };

  // Helper function for switch content since I can't put it in the wrapper above directly cleanly without refactor
  function SwitchContent({ widget }) {
    switch (widget.type) {
      case "STAT_CARD":
        return (
          <div className="h-full flex flex-col justify-between bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  {widget.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  Rp 45.2 Jt
                </p>
              </div>
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                <Activity size={18} />
              </div>
            </div>
            <div className="text-xs text-green-500 font-medium mt-4 flex items-center">
              ↑ 12.5% <span className="text-gray-400 ml-1">vs bulan lalu</span>
            </div>
          </div>
        );
      case "LINE_CHART":
        return (
          <div className="h-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              {widget.title}
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case "BAR_CHART":
        return (
          <div className="h-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              {widget.title}
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            Unknown Widget
          </div>
        );
    }
  }

  // Redefining renderWidgetContent to use the component
  const renderWidgetContentActual = (widget) => (
    <SwitchContent widget={widget} />
  );

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard Custom
          </h1>
          <p className="text-sm text-gray-500">
            Layout ini disusun oleh Admin menggunakan Page Builder.
          </p>
        </div>
        <Link
          to="/admin/builder"
          className="text-xs text-orange-600 hover:underline"
        >
          Edit Layout (Admin)
        </Link>
      </div>

      <FeatureNotReady
        message="Fitur Custom Dashboard Belum Tersedia"
        overlay={true}
      >
        {!widgets || widgets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-full mb-4">
              <AlertCircle size={48} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Belum Dikonfigurasi
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Admin belum mengatur layout untuk dashboard ini. Silakan hubungi
              administrator atau login sebagai admin untuk mengatur layout.
            </p>
            <Link
              to="/admin/builder"
              className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
            >
              Buka Page Builder (Admin)
            </Link>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts || { lg: [] }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={false}
            isResizable={false}
            margin={[16, 16]}
          >
            {widgets.map((widget) => (
              <div key={widget.i} className="relative">
                <SwitchContent widget={widget} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </FeatureNotReady>
    </div>
  );
};

export default DynamicDashboard;
