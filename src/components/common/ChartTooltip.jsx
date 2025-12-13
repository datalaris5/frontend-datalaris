import React from "react";

/**
 * Reusable Tooltip for Recharts
 * Uses centralized utility classes from index.css for easy theming
 *
 * @param {boolean} active - Recharts active state
 * @param {Array} payload - Recharts data payload
 * @param {string} label - X-Axis label (usually date/category)
 * @param {string} type - 'currency' | 'number' | 'percent' | 'auto' | 'dayOfWeek'
 * @param {boolean} hideLabel - Hide the label header
 */
const ChartTooltip = ({
  active,
  payload,
  label,
  type = "number",
  hideLabel = false,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatValue = (value, name) => {
    // Smart detection based on metric name
    const isCurrency =
      name?.toLowerCase().includes("penjualan") ||
      name?.toLowerCase().includes("basket");
    const isPercent =
      name?.toLowerCase().includes("rate") ||
      name?.toLowerCase().includes("persen");

    if (type === "currency" || isCurrency) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }

    if (type === "percent" || isPercent) {
      return `${Number(value).toFixed(1)}%`;
    }

    return new Intl.NumberFormat("id-ID").format(value);
  };

  // Special rendering for Day of Week Analysis
  if (type === "dayOfWeek") {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="glass-tooltip">
        {/* Day Name Header */}
        <div className="mb-3">
          <p className="tooltip-label">Hari</p>
          <p className="tooltip-value">{data.full || data.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="space-y-2.5">
          {/* Average (Primary - Highlighted) */}
          <div className="glass-tooltip-card-highlight">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                Rata-rata
              </span>
              <span className="text-base font-bold text-primary tabular-nums">
                {new Intl.NumberFormat("id-ID").format(data.orders)}
              </span>
            </div>
            <p className="text-[10px] text-primary/70 mt-0.5 font-medium">
              pesanan per hari
            </p>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-2">
            {/* Total */}
            <div className="glass-tooltip-card">
              <p className="text-[10px] text-muted-foreground font-medium">
                Total
              </p>
              <p className="tooltip-metric-value">
                {new Intl.NumberFormat("id-ID").format(data.totalOrders)}
              </p>
            </div>

            {/* Sample */}
            <div className="glass-tooltip-card">
              <p className="text-[10px] text-muted-foreground font-medium">
                Sample
              </p>
              <p className="text-sm font-bold text-foreground">
                {data.count} hari
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default rendering for other chart types
  return (
    <div className="glass-tooltip">
      {/* Header Label */}
      {!hideLabel && (
        <div className="mb-3">
          <p className="tooltip-label">Periode</p>
          <p className="tooltip-value">{label}</p>
        </div>
      )}

      {/* Metrics List */}
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const data = entry.payload;
          let growth = null;

          // Dynamic Growth Lookup
          if (entry.dataKey && data[`${entry.dataKey}Growth`] !== undefined) {
            growth = data[`${entry.dataKey}Growth`];
          } else {
            if (entry.name?.toLowerCase().includes("penjualan")) {
              growth = data.salesGrowth;
            } else if (entry.name?.toLowerCase().includes("pesanan")) {
              growth = data.ordersGrowth;
            } else if (entry.name?.toLowerCase().includes("basket")) {
              growth = data.basketSizeGrowth;
            }
          }

          const isPositive = growth > 0;
          const isNegative = growth < 0;
          const showGrowth = growth !== null && growth !== undefined;

          // Growth badge styling - using centralized classes
          let badgeColorClass = "badge-growth-neutral";
          let icon = "•";

          if (isPositive) {
            badgeColorClass = "badge-growth-positive";
            icon = "↑";
          } else if (isNegative) {
            badgeColorClass = "badge-growth-negative";
            icon = "↓";
          }

          return (
            <div key={index} className="glass-tooltip-card">
              {/* Metric Header */}
              <p className="tooltip-metric-label">{entry.name}</p>

              {/* Value & Growth */}
              <div className="flex items-center justify-between">
                <span className="tooltip-metric-value">
                  {formatValue(entry.value, entry.name)}
                </span>
                {showGrowth && (
                  <span className={`badge-growth ${badgeColorClass}`}>
                    {icon} {Math.abs(growth).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltip;
