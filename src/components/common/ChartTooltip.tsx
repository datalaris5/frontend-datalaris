/**
 * ChartTooltip
 * ------------
 * Komponen tooltip kustom untuk chart Recharts.
 * Menggunakan utility classes dari index.css untuk theming yang konsisten.
 *
 * Digunakan di semua chart dashboard (Penjualan, Pesanan, dll).
 *
 * Props:
 * - active: Status aktif dari Recharts
 * - payload: Data yang ditampilkan dari Recharts
 * - label: Label X-Axis (biasanya tanggal/kategori)
 * - type: Format value - 'currency' | 'number' | 'percent' | 'dayOfWeek'
 * - hideLabel: Sembunyikan header label
 */

import React from "react";

// Tipe untuk entry data dari Recharts
interface PayloadEntry {
  name?: string;
  value?: number;
  dataKey?: string;
  payload?: {
    salesGrowth?: number | null;
    ordersGrowth?: number | null;
    basketSizeGrowth?: number | null;
    full?: string;
    name?: string;
    orders?: number;
    totalOrders?: number; // removed if not used, but used in old code. New code uses 'orders' as Total.
    average?: number;
    count?: number;
    [key: string]: number | string | null | undefined;
  };
}

// Tipe untuk props komponen
interface ChartTooltipProps {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  type?: "currency" | "number" | "percent" | "dayOfWeek" | "auto";
  hideLabel?: boolean;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  type = "number",
  hideLabel = false,
}) => {
  // Jangan render jika tidak aktif atau tidak ada data
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  /**
   * Format nilai berdasarkan tipe metric
   * - Penjualan/Basket → Format Rupiah
   * - Rate/Persen → Format persentase
   * - Lainnya → Format angka biasa
   */
  const formatValue = (value: number, name?: string): string => {
    // Deteksi otomatis berdasarkan nama metric
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

  // Rendering khusus untuk analisis hari dalam seminggu
  if (type === "dayOfWeek") {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="glass-tooltip p-2.5 min-w-[150px]">
        {/* Header nama hari */}
        <div className="mb-2 pb-2 border-b border-border/50">
          <p className="text-xs font-bold text-foreground">
            {data.full || data.name}
          </p>
        </div>

        {/* List statistik */}
        <div className="space-y-2">
          {/* Total (Primary) */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {new Intl.NumberFormat("id-ID").format(data.orders || 0)}
            </span>
          </div>

          {/* Secondary Stats (Compact) */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-muted-foreground/80">
              Rata-rata
            </span>
            <span className="text-xs font-medium text-foreground/80 tabular-nums">
              {new Intl.NumberFormat("id-ID").format(data.average || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-muted-foreground/80">Sample</span>
            <span className="text-xs font-medium text-foreground/80 tabular-nums">
              {data.count || 0} hari
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Rendering default untuk tipe chart lainnya
  return (
    <div className="glass-tooltip p-2.5 min-w-[150px]">
      {/* Header Label */}
      {!hideLabel && (
        <div className="mb-2 pb-2 border-b border-border/50">
          <p className="text-xs font-bold text-foreground">{label}</p>
        </div>
      )}

      {/* Daftar Metrics */}
      <div className="space-y-2">
        {payload.map((entry, index) => {
          const data = entry.payload;
          let growth: number | null | undefined = null;

          // Cari data pertumbuhan (growth) secara dinamis
          if (entry.dataKey && data?.[`${entry.dataKey}Growth`] !== undefined) {
            growth = data[`${entry.dataKey}Growth`] as number | null;
          } else if (data) {
            // Fallback berdasarkan nama metric
            if (entry.name?.toLowerCase().includes("penjualan")) {
              growth = data.salesGrowth;
            } else if (entry.name?.toLowerCase().includes("pesanan")) {
              growth = data.ordersGrowth;
            } else if (entry.name?.toLowerCase().includes("basket")) {
              growth = data.basketSizeGrowth;
            }
          }

          const isPositive =
            growth !== null && growth !== undefined && growth > 0;
          const isNegative =
            growth !== null && growth !== undefined && growth < 0;
          const showGrowth = growth !== null && growth !== undefined;

          // Styling badge berdasarkan arah pertumbuhan
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
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              {/* Metric Name */}
              <span className="text-xs text-muted-foreground">
                {entry.name}
              </span>

              {/* Value & Growth */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary tabular-nums">
                  {formatValue(entry.value || 0, entry.name)}
                </span>
                {showGrowth && (
                  <span
                    className={`badge-growth ${badgeColorClass} ml-0 scale-90 origin-right`}
                  >
                    {icon} {Math.abs(growth!).toFixed(1)}%
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
