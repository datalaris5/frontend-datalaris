/**
 * MetricCard
 * ----------
 * Komponen reusable untuk menampilkan metric di Dashboard.
 * Style: Compact Stats + Glassmorphism (2024 Trend)
 *
 * Fitur:
 * - Compact layout dengan header horizontal
 * - Glassmorphism background
 * - Framer Motion animations
 * - Mini sparkline chart
 * - Centralized styling untuk konsistensi
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import CountUp from "react-countup";
import FeatureNotReady from "@/components/common/FeatureNotReady";
import { DashboardMetric } from "@/types/dashboard.types";
import { ICON_STROKE_WIDTH, ICON_SIZES } from "@/config/dashboardIcons";
import { trendBadgeStyles } from "@/config/themeConfig";
import MetricCardSkeleton from "./MetricCardSkeleton";

interface MetricCardProps {
  metric: DashboardMetric;
  loading?: boolean;
  /** Stagger animation delay index (0-5) */
  staggerIndex?: number;
}

// Animation variants - terpusat untuk konsistensi
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
  hover: {
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.98 },
};

const sparklineVariants = {
  hidden: { opacity: 0, scaleX: 0.7 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { delay: 0.3, duration: 0.5, ease: "easeOut" },
  },
};

const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  loading = false,
  staggerIndex = 0,
}) => {
  // Loading state
  if (loading) {
    return <MetricCardSkeleton highlight={metric.highlight} />;
  }

  // Unified glass styling - konsisten untuk semua cards
  const baseCardClass = "glass-card-premium";

  return (
    <motion.div
      className="h-full"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      custom={staggerIndex}
    >
      <FeatureNotReady
        blur={metric.isDummy}
        overlay={metric.isDummy}
        message="Segera Hadir"
      >
        <Card
          className={`
            relative overflow-hidden h-full rounded-xl cursor-default
            ${baseCardClass}
          `}
        >
          {/* Content - Compact Layout */}
          <div className="relative z-10 p-3">
            {/* Header: Icon + Title + Trend (horizontal) */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Icon - subtle monochrome */}
                <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground">
                  <metric.icon
                    size={ICON_SIZES.sm}
                    strokeWidth={ICON_STROKE_WIDTH}
                  />
                </div>
                {/* Title */}
                <span className="text-[11px] font-medium text-muted-foreground">
                  {metric.title}
                </span>
              </div>

              {/* Trend badge - di header */}
              <span
                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  metric.trendUp
                    ? trendBadgeStyles.up.className
                    : trendBadgeStyles.down.className
                }`}
              >
                <span className="text-[9px]">
                  {metric.trendUp
                    ? trendBadgeStyles.up.arrow
                    : trendBadgeStyles.down.arrow}
                </span>
                {metric.trend}
              </span>
            </div>

            {/* Value - Bold, prominent */}
            <p
              className={`text-xl font-bold tracking-tight ${
                metric.highlight ? "text-white" : "text-foreground"
              }`}
            >
              <CountUp
                start={0}
                end={metric.value}
                duration={1.8}
                separator="."
                decimal=","
                decimals={
                  metric.format === "currency"
                    ? 0
                    : metric.format === "number" && metric.value % 1 !== 0
                    ? 2
                    : 0
                }
                prefix={metric.format === "currency" ? "Rp " : ""}
                suffix={metric.format === "percent" ? "%" : metric.suffix || ""}
              />
            </p>

            {/* Comparison & Sparkline row */}
            <div className="flex items-end justify-between mt-1">
              {/* Comparison text */}
              {!metric.isDummy && (
                <span className="text-[9px] text-muted-foreground/60">
                  vs periode lalu
                </span>
              )}

              {/* Mini sparkline - compact */}
              <motion.div
                className="w-14 h-6"
                variants={sparklineVariants}
                initial="hidden"
                animate="visible"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metric.data.map((v, i) => ({ i, v }))}>
                    <defs>
                      <linearGradient
                        id={`grad-compact-${metric.color}-${staggerIndex}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={metric.highlight ? "#ffffff" : "#94a3b8"}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor={metric.highlight ? "#ffffff" : "#94a3b8"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={metric.highlight ? "#ffffff" : "#94a3b8"}
                      fill={`url(#grad-compact-${metric.color}-${staggerIndex})`}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        </Card>
      </FeatureNotReady>
    </motion.div>
  );
};

export default MetricCard;
