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
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
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
import ChartEmptyState from "@/components/dashboard/ChartEmptyState";
import ChartSkeleton from "@/components/dashboard/ChartSkeleton";
import {
  chartLayout,
  chartTypography,
  chartHeaderIcons,
  chartContent,
  chartAnimation,
  chartGrowthColors,
  chartUI,
} from "@/config/chartTheme";

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload as YoYMetric;
  const isPositive = data.growthPercent >= 0;

  return (
    <div className="glass-tooltip p-2.5 min-w-[150px]">
      <div className="mb-2 pb-2 border-b border-border/50">
        <p className="text-xs font-bold text-foreground">{data.month}</p>
      </div>

      <div className="space-y-2">
        {/* Tahun Ini */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Tahun Ini</span>
          <span className="text-sm font-bold text-primary tabular-nums">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(data.currentValue)}
          </span>
        </div>

        {/* Tahun Lalu */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">Tahun Lalu</span>
          <span className="text-xs font-medium text-foreground/80 tabular-nums">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(data.previousValue)}
          </span>
        </div>

        {/* Pertumbuhan */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-white/5">
          <span className="text-xs font-medium text-muted-foreground">
            Growth
          </span>
          <span
            className={`text-xs font-bold tabular-nums ${
              isPositive
                ? chartGrowthColors.positive.text
                : chartGrowthColors.negative.text
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
  const { data, isLoading } = useYoYGrowth();

  // Loading state
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Empty state - API not implemented or no previous year data
  if (!data || !data.hasPreviousYearData) {
    const previousYear = (data?.currentYear || new Date().getFullYear()) - 1;
    return (
      <Card className="glass-card h-full flex flex-col">
        <CardHeader className="py-4 px-6 flex-none border-b border-black/5 dark:border-white/10">
          <div className="flex flex-col gap-1">
            <CardTitle
              className={`${chartTypography.titleCompact} flex items-center gap-2`}
            >
              <TrendingUp className={chartHeaderIcons.compact} />
              {chartContent.yoyGrowth.title}
            </CardTitle>
            <p className={chartTypography.subtitleCompact}>
              {chartContent.yoyGrowth.getSubtitle(
                data?.currentYear || new Date().getFullYear(),
                previousYear
              )}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center">
          <ChartEmptyState
            icon={Calendar}
            title="Data YoY Belum Tersedia"
            message={`Upload data tahun ${previousYear} untuk perbandingan.`}
          />
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
      <CardHeader className="py-4 px-6 flex-none border-b border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle
              className={`${chartTypography.titleCompact} flex items-center gap-2`}
            >
              <TrendingUp className={chartHeaderIcons.compact} />
              {chartContent.yoyGrowth.title}
            </CardTitle>
            <p className={chartTypography.subtitleCompact}>
              {chartContent.yoyGrowth.getSubtitle(
                data.currentYear,
                data.previousYear
              )}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${
              isOverallPositive
                ? `${chartGrowthColors.positive.bg} ${chartGrowthColors.positive.text}`
                : `${chartGrowthColors.negative.bg} ${chartGrowthColors.negative.text}`
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
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-2 pb-4 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={chartLayout.horizontal.margin}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={chartTypography.axisLabel}
              width={chartLayout.horizontal.yAxisWidth}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Bar
              dataKey="growthPercent"
              radius={chartUI.barRadius.right}
              animationDuration={chartAnimation.duration}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.growthPercent >= 0
                      ? chartGrowthColors.positive.fill
                      : chartGrowthColors.negative.fill
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
