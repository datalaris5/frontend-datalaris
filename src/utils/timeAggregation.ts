/**
 * Time Aggregation Utilities
 * --------------------------
 * Fungsi untuk aggregate data daily ke weekly/monthly/quarterly.
 * Digunakan oleh Enhanced Trend Chart untuk flexible time granularity.
 */

import {
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  format,
  differenceInDays,
  parseISO,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameQuarter,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Type untuk data point dengan tanggal
export interface TimeDataPoint {
  tanggal: string; // "2024-01-15" format
  total: number;
}

// Type untuk aggregated data
export interface AggregatedDataPoint {
  key: string; // Label untuk X-axis
  value: number;
  originalDate?: Date;
}

// Granularity options
export type TimeGranularity = "daily" | "weekly" | "monthly" | "quarterly";

/**
 * Auto-detect granularity berdasarkan date range
 */
export function getAutoGranularity(
  startDate: Date,
  endDate: Date
): TimeGranularity {
  const days = differenceInDays(endDate, startDate);

  if (days <= 31) return "daily";
  if (days <= 90) return "weekly";
  if (days <= 365) return "monthly";
  return "quarterly";
}

/**
 * Get available granularity options berdasarkan date range
 */
export function getAvailableGranularities(
  startDate: Date,
  endDate: Date
): TimeGranularity[] {
  const days = differenceInDays(endDate, startDate);
  const options: TimeGranularity[] = [];

  // Daily: Cocok untuk range pendek (<= 3 bulan)
  if (days <= 90) options.push("daily");

  // Weekly: Butuh minimal 2 minggu (> 14 hari) supaya jadi garis
  if (days > 14 && days <= 365) options.push("weekly");

  // Monthly: Butuh minimal 2 bulan (> 31 hari) supaya jadi garis
  if (days > 31) options.push("monthly");

  // Quarterly: Butuh minimal 2 kuartal (> 180 hari)
  if (days > 180) options.push("quarterly");

  return options;
}

/**
 * Helper to calculate value based on type
 */
function calculateValue(
  items: TimeDataPoint[],
  type: "sum" | "average"
): number {
  if (items.length === 0) return 0;

  const total = items.reduce((sum, item) => sum + item.total, 0);

  if (type === "average") {
    // Untuk average, kita bagi dengan jumlah data point yang ada (non-zero helps accuracy but standard avg uses count)
    // Disini kita gunakan count dari items yang masuk interval tersebut
    return total / items.length;
  }

  return total;
}

/**
 * Aggregate data ke Weekly dengan Zero-Filling
 */
export function aggregateToWeekly(
  data: TimeDataPoint[],
  startDate: Date,
  endDate: Date,
  type: "sum" | "average" = "sum"
): AggregatedDataPoint[] {
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 }
  );

  return weeks.map((weekStart) => {
    const weekItems = data.filter((item) =>
      isSameWeek(parseISO(item.tanggal), weekStart, { weekStartsOn: 1 })
    );

    return {
      key: format(weekStart, "dd MMM", { locale: idLocale }),
      value: calculateValue(weekItems, type),
      originalDate: weekStart,
    };
  });
}

/**
 * Aggregate data ke Monthly dengan Zero-Filling
 */
export function aggregateToMonthly(
  data: TimeDataPoint[],
  startDate: Date,
  endDate: Date,
  type: "sum" | "average" = "sum"
): AggregatedDataPoint[] {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map((monthStart) => {
    const monthItems = data.filter((item) =>
      isSameMonth(parseISO(item.tanggal), monthStart)
    );

    return {
      key: format(monthStart, "MMM yyyy", { locale: idLocale }),
      value: calculateValue(monthItems, type),
      originalDate: monthStart,
    };
  });
}

/**
 * Aggregate data ke Quarterly dengan Zero-Filling
 */
export function aggregateToQuarterly(
  data: TimeDataPoint[],
  startDate: Date,
  endDate: Date,
  type: "sum" | "average" = "sum"
): AggregatedDataPoint[] {
  const quarters = eachQuarterOfInterval({ start: startDate, end: endDate });

  return quarters.map((quarterStart) => {
    const quarterItems = data.filter((item) =>
      isSameQuarter(parseISO(item.tanggal), quarterStart)
    );

    const quarterNum = Math.ceil((quarterStart.getMonth() + 1) / 3);
    const quarterKey = `Q${quarterNum} ${format(quarterStart, "yyyy")}`;

    return {
      key: quarterKey,
      value: calculateValue(quarterItems, type),
      originalDate: quarterStart,
    };
  });
}

/**
 * Aggregate data to Daily dengan Zero-Filling
 * Fix: Hanya zero-fill sampai tanggal data terakhir yang ada, bukan filter user.
 * Ini mencegah "terjun bebas ke 0" di ujung chart.
 */
export function aggregateToDaily(
  data: TimeDataPoint[],
  startDate: Date,
  endDate: Date
): AggregatedDataPoint[] {
  // Jika tidak ada data, return empty (jangan generate zeros)
  if (data.length === 0) return [];

  // Cari tanggal terakhir yang ada di data API
  const sortedDates = data
    .map((d) => parseISO(d.tanggal))
    .sort((a, b) => b.getTime() - a.getTime());
  const actualLastDate = sortedDates[0];

  // Gunakan tanggal yang lebih kecil: filter user ATAU data terakhir
  const effectiveEndDate =
    actualLastDate && actualLastDate < endDate ? actualLastDate : endDate;

  const days = eachDayOfInterval({ start: startDate, end: effectiveEndDate });

  return days.map((day) => {
    const dayData = data.find((item) => isSameDay(parseISO(item.tanggal), day));
    return {
      key: format(day, "dd MMM", { locale: idLocale }),
      value: dayData ? dayData.total : 0,
      originalDate: day,
    };
  });
}

/**
 * Master aggregate function
 */
export function aggregateData(
  data: TimeDataPoint[],
  granularity: TimeGranularity,
  startDate: Date,
  endDate: Date,
  type: "sum" | "average" = "sum"
): AggregatedDataPoint[] {
  if (!startDate || !endDate) return [];

  switch (granularity) {
    case "daily":
      return aggregateToDaily(data, startDate, endDate);
    case "weekly":
      return aggregateToWeekly(data, startDate, endDate, type);
    case "monthly":
      return aggregateToMonthly(data, startDate, endDate, type);
    case "quarterly":
      return aggregateToQuarterly(data, startDate, endDate, type);
    default:
      return aggregateToMonthly(data, startDate, endDate, type);
  }
}

/**
 * Label untuk granularity (UI)
 */
export const granularityLabels: Record<TimeGranularity, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  quarterly: "Kuartalan",
};
