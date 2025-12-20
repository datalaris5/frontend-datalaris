/**
 * InsightBanner
 * -------------
 * Komponen insight otomatis dari data dashboard.
 * Style: Compact AI-Assistant aesthetic.
 * Config: Menggunakan aiInsightConfig dari themeConfig.ts
 */

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { DashboardMetric } from "@/types/dashboard.types";
import { generateSmartInsight } from "@/utils/insightUtils";
import { aiInsightConfig } from "@/config/themeConfig";

interface InsightBannerProps {
  metrics: DashboardMetric[];
  loading?: boolean;
}

// Destructure config untuk cleaner code
const { labels, container, icon, badge, text, shimmer } = aiInsightConfig;

const InsightBanner: React.FC<InsightBannerProps> = ({
  metrics,
  loading = false,
}) => {
  // 1. Loading skeleton - Compact
  if (loading) {
    return (
      <div className="glass-card rounded-xl py-2 px-3 mb-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <div className="h-3 bg-muted rounded flex-1 max-w-[300px]" />
        </div>
      </div>
    );
  }

  // 2. Generate Smart Insight
  const insight = useMemo(() => generateSmartInsight(metrics), [metrics]);

  // 3. Build container className from config
  const containerClassName = [
    container.base,
    container.gradient.light,
    container.gradient.dark,
    container.border,
    container.shadow,
    container.hover,
    container.transition,
  ].join(" ");

  // 4. Render Compact AI-Style UI
  return (
    <div className={containerClassName}>
      {/* Shimmer Effect */}
      <div className={shimmer} />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        {/* AI Sparkle Icon */}
        <Sparkles className={`${icon.size} ${icon.color} flex-shrink-0`} />

        {/* AI Badge */}
        <span
          className={`${badge.text} ${badge.color} ${badge.bg} ${badge.padding}`}
        >
          {labels.badge}
        </span>

        {/* Title */}
        <span className={text.title}>{insight.title}</span>

        {/* Separator */}
        <span className={text.separator}>{labels.separator}</span>

        {/* Message */}
        <span className={text.message}>{insight.message}</span>
      </div>
    </div>
  );
};

export default InsightBanner;
