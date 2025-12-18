/**
 * InsightBanner
 * -------------
 * Komponen yang menampilkan insight otomatis dari data dashboard.
 * Mirip fitur di dashboard premium seperti Shopify Analytics, Mixpanel.
 *
 * Contoh output:
 * "📈 Total Penjualan naik 12.5% dari periode sebelumnya.
 *  Hari terbaik: Sabtu dengan rata-rata 234 pesanan."
 */

import React, { useMemo } from "react";
import { Sparkles, Calendar } from "lucide-react";
import type {
  DashboardMetric,
  OrdersDayDataPoint,
} from "@/types/dashboard.types";
import { generateSmartInsight } from "@/utils/insightUtils";

interface InsightBannerProps {
  metrics: DashboardMetric[];
  ordersDayData: OrdersDayDataPoint[];
  loading?: boolean;
}

const InsightBanner: React.FC<InsightBannerProps> = ({
  metrics,
  ordersDayData,
  loading = false,
}) => {
  // 1. Loading skeleton (Unchanged)
  if (loading) {
    return (
      <div className="glass-card rounded-xl py-3 px-4 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Generate Smart Insight using Centralized Logic
  // Memoize result to prevent re-calculation on every render
  const insight = useMemo(() => generateSmartInsight(metrics), [metrics]);

  // 3. Hitung best day (Secondary Insight - tetap disimpan sebagai trivia tambahan)
  const bestDay = useMemo(
    () =>
      ordersDayData.length > 0
        ? ordersDayData.reduce((max, day) =>
            day.orders > max.orders ? day : max
          )
        : null,
    [ordersDayData]
  );

  const hasBestDay = bestDay && bestDay.orders > 0;
  // Jangan tampilkan best day jika sedang mode Hazard/Critical, fokus ke masalah.
  const showBestDay =
    hasBestDay && insight.type !== "hazard" && insight.type !== "neutral";

  // 4. Render Dynamic UI
  return (
    <div
      className={`glass-card rounded-xl py-3 px-4 mb-4 border-l-4 transition-all duration-300 ${insight.theme.border} ${insight.theme.bg}`}
    >
      <div className="flex items-center gap-4">
        {/* Dynamic Icon */}
        <div
          className={`p-2 rounded-full flex-shrink-0 ${insight.theme.iconBg} ${insight.theme.iconText}`}
        >
          <insight.icon className="w-5 h-5" />
        </div>

        {/* Content Area - Horizontal Layout */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          {/* Main Insight Message */}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-bold whitespace-nowrap">{insight.title}</span>
            <span className="hidden md:inline text-muted-foreground/40">•</span>
            <span
              className={`${insight.theme.text} dark:${insight.theme.textDark} leading-tight font-medium`}
            >
              {insight.message}
            </span>
          </div>

          {/* Secondary Insight (Trivia: Best Day) - Badge Style for Unity */}
          {showBestDay && (
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${insight.theme.bg.replace(
                "bg-",
                "bg-white/40 dark:bg-black/10"
              )}`}
            >
              <Calendar
                className={`w-3.5 h-3.5 ${insight.theme.iconText} opacity-70`}
              />
              <span className="text-muted-foreground whitespace-nowrap">
                Puncak Pesanan Toko:{" "}
                <span className="text-foreground font-semibold">
                  Hari {bestDay?.full}
                </span>{" "}
                <span className="opacity-70">
                  (Rata-rata {bestDay?.orders.toLocaleString("id-ID")} Pesanan)
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Sparkle Decoration (Only for positive vibes) */}
        {(insight.type === "achievement" || insight.type === "efficiency") && (
          <Sparkles className="w-4 h-4 text-yellow-500/50 flex-shrink-0 animate-pulse ml-2" />
        )}
      </div>
    </div>
  );
};

export default InsightBanner;
