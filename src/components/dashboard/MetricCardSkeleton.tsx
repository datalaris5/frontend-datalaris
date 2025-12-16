/**
 * MetricCardSkeleton
 * ------------------
 * Skeleton loading state untuk MetricCard.
 * Layout: Compact Stats + Glassmorphism (match MetricCard)
 */

import { Card } from "@/components/ui/card";

interface MetricCardSkeletonProps {
  highlight?: boolean;
}

const MetricCardSkeleton: React.FC<MetricCardSkeletonProps> = ({
  highlight = false,
}) => {
  return (
    <div className="h-full">
      <Card className="relative overflow-hidden h-full rounded-xl glass-card-premium">
        {/* Content - Compact Layout */}
        <div className="relative z-10 p-3">
          {/* Header: Icon + Title + Trend */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg animate-pulse ${
                  highlight ? "bg-white/20" : "bg-muted"
                }`}
              />
              <div
                className={`h-2.5 w-16 rounded animate-pulse ${
                  highlight ? "bg-white/20" : "bg-muted"
                }`}
              />
            </div>
            <div
              className={`h-4 w-10 rounded-md animate-pulse ${
                highlight ? "bg-white/20" : "bg-muted"
              }`}
            />
          </div>

          {/* Value */}
          <div
            className={`h-6 w-24 rounded animate-pulse ${
              highlight ? "bg-white/20" : "bg-muted"
            }`}
          />

          {/* Footer: Comparison + Sparkline */}
          <div className="flex items-end justify-between mt-1">
            <div
              className={`h-2 w-14 rounded animate-pulse ${
                highlight ? "bg-white/20" : "bg-muted"
              }`}
            />
            <div
              className={`h-6 w-14 rounded animate-pulse ${
                highlight ? "bg-white/20" : "bg-muted"
              }`}
            />
          </div>
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </Card>
    </div>
  );
};

export default MetricCardSkeleton;
