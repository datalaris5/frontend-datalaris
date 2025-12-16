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

import React from "react";
import { TrendingUp, TrendingDown, Sparkles, Calendar } from "lucide-react";
import type {
  DashboardMetric,
  OrdersDayDataPoint,
} from "@/types/dashboard.types";
import { semanticStatusThemes } from "@/types/dashboard.types";

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
  // Loading skeleton
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 mb-4 animate-pulse">
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

  // Ambil data dari metrics
  const salesMetric = metrics.find((m) => m.title === "Total Penjualan");

  // Hitung best day
  const bestDay =
    ordersDayData.length > 0
      ? ordersDayData.reduce((max, day) =>
          day.orders > max.orders ? day : max
        )
      : null;

  // Generate insights
  const salesTrend = salesMetric?.trendUp ?? true;
  const salesPercent = salesMetric?.trend ?? "0%";
  const hasSalesData = salesMetric && salesMetric.value > 0;
  const hasBestDay = bestDay && bestDay.orders > 0;

  // Select theme based on trend
  const theme = salesTrend
    ? semanticStatusThemes.positive
    : semanticStatusThemes.negative;
  const neutralTheme = semanticStatusThemes.neutral;

  // Jika tidak ada data sama sekali
  if (!hasSalesData && !hasBestDay) {
    return (
      <div
        className={`glass-card rounded-2xl p-4 mb-4 border-l-4 ${neutralTheme.border}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${neutralTheme.iconBg}`}>
            <Sparkles className={`w-5 h-5 ${neutralTheme.iconText}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Upload data untuk melihat insight performa toko Anda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-card rounded-2xl p-4 mb-4 border-l-4 transition-all duration-300 ${theme.border} ${theme.bg}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-full ${theme.iconBg} ${theme.iconText}`}>
          {salesTrend ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Main insight */}
          <p className="text-sm font-medium text-foreground">
            {hasSalesData && (
              <>
                <span className="font-bold">Total Penjualan</span>
                {salesTrend ? (
                  <span className={`${theme.text} dark:${theme.textDark}`}>
                    {" "}
                    naik {salesPercent}
                  </span>
                ) : (
                  <span className={`${theme.text} dark:${theme.textDark}`}>
                    {" "}
                    turun {salesPercent}
                  </span>
                )}{" "}
                dari periode sebelumnya.
              </>
            )}
          </p>

          {/* Secondary insight - Best Day */}
          {hasBestDay && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Hari terbaik:{" "}
              <span className="font-semibold text-foreground">
                {bestDay.full || bestDay.displayMonth}
              </span>{" "}
              dengan rata-rata{" "}
              <span className="font-semibold text-foreground">
                {bestDay.orders.toLocaleString("id-ID")}
              </span>{" "}
              pesanan
            </p>
          )}
        </div>

        {/* Sparkle decoration */}
        <Sparkles className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
      </div>
    </div>
  );
};

export default InsightBanner;
