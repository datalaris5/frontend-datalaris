/**
 * ChartSkeleton
 * -------------
 * Skeleton loading state untuk Charts di Dashboard.
 * Konsisten dengan style MetricCardSkeleton.
 */

import { Card, CardHeader, CardContent } from "@/components/ui/card";

const ChartSkeleton: React.FC = () => {
  return (
    <Card className="glass-card-strong rounded-2xl h-full flex flex-col relative overflow-hidden">
      <CardHeader className="py-4 px-6 flex-none border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 w-48 bg-muted/30 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-muted/30 rounded-lg animate-pulse" />
            <div className="h-8 w-20 bg-muted/30 rounded-lg animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-4 pb-2 px-4">
        {/* Chart Area Skeleton */}
        <div className="w-full h-full flex items-end gap-2 pb-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-full bg-muted/20 rounded-t-sm animate-pulse"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                opacity: 0.5 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      </CardContent>

      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-20" />
    </Card>
  );
};

export default ChartSkeleton;
