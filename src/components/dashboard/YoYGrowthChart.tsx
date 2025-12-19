/**
 * YoYGrowthChart
 * --------------
 * Diverging Bar Chart untuk menampilkan Year-over-Year Growth.
 *
 * Features:
 * - Positif growth: Bar ke kanan (hijau)
 * - Negatif growth: Bar ke kiri (merah)
 * - Empty state saat data tahun lalu tidak ada
 * - Tooltip dengan detail comparison
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Calendar, Upload } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { useYoYGrowth, YoYMetric } from "@/hooks/useYoYGrowth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Warna untuk growth
const POSITIVE_COLOR = "#10b981"; // Emerald
const NEGATIVE_COLOR = "#ef4444"; // Red

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload as YoYMetric;
  const isPositive = data.growthPercent >= 0;

  return (
    <div className="glass-card p-3 rounded-lg shadow-lg border border-white/10">
      <p className="font-semibold text-sm mb-2">{data.month}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tahun Ini:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(data.currentValue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tahun Lalu:</span>
          <span className="font-medium">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(data.previousValue)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
          <span className="text-muted-foreground">Pertumbuhan:</span>
          <span
            className={`font-bold ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {data.growthPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export function YoYGrowthChart() {
  const { data, isLoading, error } = useYoYGrowth();
  const navigate = useNavigate();

  // Loading state
  if (isLoading) {
    return (
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="flex-none pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Pertumbuhan Tahunan (YoY)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Memuat data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state - API not implemented or no previous year data
  if (!data || !data.hasPreviousYearData) {
    return (
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="flex-none pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Pertumbuhan Tahunan (YoY)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-base mb-2">
              Data Tahun Lalu Belum Tersedia
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              Upload data tahun{" "}
              {(data?.currentYear || new Date().getFullYear()) - 1} untuk
              melihat perbandingan pertumbuhan dengan tahun ini.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/upload")}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Chart with data
  const chartData = data.metrics;
  const overallGrowth = data.summary.overallGrowthPercent;
  const isOverallPositive = overallGrowth >= 0;

  return (
    <Card className="glass-card h-full flex flex-col">
      <CardHeader className="flex-none pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Pertumbuhan Tahunan (YoY)
          </CardTitle>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isOverallPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {isOverallPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isOverallPositive ? "+" : ""}
            {overallGrowth.toFixed(1)}%
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {data.currentYear} vs {data.previousYear}
        </p>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Bar
              dataKey="growthPercent"
              radius={[0, 4, 4, 0]}
              animationDuration={500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.growthPercent >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default YoYGrowthChart;
