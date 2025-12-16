/**
 * Dynamic Dashboard
 * -----------------
 * Halaman custom dashboard dengan widget yang bisa di-drag & resize.
 * Menggunakan react-grid-layout untuk layout management.
 *
 * Status: BETA / Coming Soon
 * - Drag & drop layout sedang dalam perbaikan
 * - Untuk saat ini menampilkan placeholder charts
 *
 * Fitur Rencana:
 * - Widget yang bisa di-drag dan resize
 * - Simpan layout preferences ke API
 * - Tambah widget baru
 */

import React, { useState, ReactNode } from "react";
import ResponsiveGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Move, GripVertical, Settings, Plus } from "lucide-react";
import FeatureNotReady from "@/components/common/FeatureNotReady";

// Tipe untuk data chart
interface ChartDataPoint {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

// Mock Data untuk charts
const data: ChartDataPoint[] = [
  { name: "Mon", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Tue", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Wed", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Thu", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Fri", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Sat", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Sun", uv: 3490, pv: 4300, amt: 2100 },
];

// Tipe untuk layout item
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Props untuk ChartWidget
interface ChartWidgetProps {
  title: string;
  children: ReactNode;
  isDraggable: boolean;
}

/**
 * ChartWidget Component
 * Wrapper untuk chart dengan header dan styling glass
 */
const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  children,
  isDraggable,
}) => (
  <div className="glass-card h-full rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
    <div
      className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${
        isDraggable ? "cursor-move bg-gray-50 dark:bg-gray-900/50" : ""
      }`}
    >
      <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
        {isDraggable && (
          <GripVertical size={16} className="mr-2 text-gray-400" />
        )}
        {title}
      </h3>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <Settings size={16} />
      </button>
    </div>
    <div className="flex-1 p-4 min-h-0">{children}</div>
  </div>
);

const DynamicDashboard: React.FC = () => {
  // State untuk mode edit (drag & drop)
  const [isDraggable, setIsDraggable] = useState(false);

  // Layout configuration untuk react-grid-layout
  const [layouts, setLayouts] = useState<{ lg: LayoutItem[] }>({
    lg: [
      { i: "a", x: 0, y: 0, w: 12, h: 4 },
      { i: "b", x: 0, y: 4, w: 6, h: 4 },
      { i: "c", x: 6, y: 4, w: 6, h: 4 },
    ],
  });

  /**
   * Handler untuk perubahan layout
   * Di real app, save ke User Preferences API
   */
  const onLayoutChange = (layout: LayoutItem[]): void => {
    setLayouts({ lg: layout });
  };

  return (
    <div className="space-y-6">
      {/* Header dengan Badge BETA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Custom Dashboard
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 uppercase tracking-wide">
              Beta
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Atur susunan widget sesuai kebutuhan monitoring Anda.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
            <Plus size={16} className="mr-2" /> Add Widget
          </button>
          <button
            onClick={() => setIsDraggable(!isDraggable)}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              isDraggable
                ? "bg-orange-600 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {isDraggable ? (
              <>Selesai Edit</>
            ) : (
              <>
                <Move size={16} className="mr-2" /> Atur Layout
              </>
            )}
          </button>
        </div>
      </div>

      {/* Placeholder Content (Fitur masih dalam perbaikan) */}
      <FeatureNotReady message="Fitur Drag n Drop sedang dalam perbaikan">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Chart */}
          <div className="glass-card h-80 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Traffic Chart
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="pv"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
                <Area
                  type="monotone"
                  dataKey="amt"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Bar Chart */}
          <div className="glass-card h-80 rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Sales Bar
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="pv" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FeatureNotReady>

      {/* 
        TODO: Aktifkan react-grid-layout setelah fix issues
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          isDraggable={isDraggable}
          isResizable={isDraggable}
          onLayoutChange={onLayoutChange}
          margin={[24, 24]}
        >
          ...widgets here
        </ResponsiveGridLayout>
      */}
    </div>
  );
};

export default DynamicDashboard;
