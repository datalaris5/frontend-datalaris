/**
 * Chart Utilities
 * ---------------
 * Fungsi utilitas untuk kalkulasi dan agregasi data chart.
 *
 * Fungsi:
 * - calculateMoMGrowth: Hitung pertumbuhan Month-over-Month
 * - calculateBasketSize: Hitung rata-rata nilai keranjang
 * - aggregateByQuarter: Agregasi data bulanan ke kuartal
 * - aggregateByDayOfWeek: Agregasi data harian per hari dalam minggu
 */

interface DataItem {
  [key: string]: number | string | null | undefined;
}

interface GrowthDataItem extends DataItem {
  [key: string]: number | string | null | undefined;
}

interface MonthlyDataItem {
  sales?: number;
  orders?: number;
  [key: string]: number | string | undefined;
}

interface QuarterData {
  name: string;
  sales: number;
  orders: number;
  months: number[];
  basketSize?: number;
  displayMonth?: string;
  salesGrowth?: number | null;
  ordersGrowth?: number | null;
  basketSizeGrowth?: number | null;
}

interface DailyDataItem {
  tanggal: string;
  total?: number;
}

interface DayOfWeekData {
  name: string;
  full: string;
  dayIndex: number;
  orders: number;
  totalOrders: number;
  count: number;
  displayMonth: string;
}

/**
 * Calculate Month-over-Month (MoM) Growth for a dataset
 * @param data - Array of data objects (e.g., monthsSkeleton)
 * @param keys - Keys to calculate growth for (e.g., ['sales', 'orders'])
 * @returns Data with appended growth fields (e.g., 'salesGrowth')
 */
export const calculateMoMGrowth = <T extends DataItem>(
  data: T[],
  keys: string[]
): GrowthDataItem[] => {
  return data.map((item, index) => {
    const newItem: GrowthDataItem = { ...item }; // Avoid mutating original

    keys.forEach((key) => {
      const growthKey = `${key}Growth`;

      if (index === 0) {
        // First item has no previous data
        newItem[growthKey] = null;
      } else {
        const prev = data[index - 1];
        const prevValue = Number(prev[key] || 0);
        const currentValue = Number(item[key] || 0);

        if (prevValue > 0) {
          newItem[growthKey] = ((currentValue - prevValue) / prevValue) * 100;
        } else {
          // Cannot calculate growth from 0.
          // If current is also 0, it's 0% change (neutral).
          // If current > 0, it's technically infinite, but usually treated as null or handled specially.
          // For our dashboard, let's set to null to avoid misleading infinite stats.
          newItem[growthKey] = null;
        }
      }
    });

    return newItem;
  });
};

/**
 * Calculate Basket Size (Sales / Orders)
 * @param sales
 * @param orders
 * @returns Average Basket Size (Rounded)
 */
export const calculateBasketSize = (sales: number, orders: number): number => {
  if (!orders || orders <= 0) return 0;
  return Math.round(sales / orders);
};

/**
 * Aggregate Monthly Data into Quarters (Q1-Q4)
 * @param monthlyData - Array of 12 months
 * @returns Array of 4 Quarters with calculated metrics
 */
export const aggregateByQuarter = (
  monthlyData: MonthlyDataItem[]
): QuarterData[] => {
  const quarters: QuarterData[] = [
    { name: "Q1", sales: 0, orders: 0, months: [0, 1, 2] },
    { name: "Q2", sales: 0, orders: 0, months: [3, 4, 5] },
    { name: "Q3", sales: 0, orders: 0, months: [6, 7, 8] },
    { name: "Q4", sales: 0, orders: 0, months: [9, 10, 11] },
  ];

  // First pass: Aggregate Sales & Orders
  const aggregated = quarters.map((q) => {
    q.months.forEach((mIndex) => {
      if (monthlyData[mIndex]) {
        q.sales += monthlyData[mIndex].sales || 0;
        q.orders += monthlyData[mIndex].orders || 0;
      }
    });

    // Recalculate Derived Metrics
    q.basketSize = calculateBasketSize(q.sales, q.orders);

    // Ensure XAxis key matches (displayMonth)
    q.displayMonth = q.name;

    return q;
  });

  // Second pass: Calculate QoQ Growth
  return aggregated.map((q, index) => {
    if (index === 0) {
      // Q1 has no previous quarter
      q.salesGrowth = null;
      q.ordersGrowth = null;
      q.basketSizeGrowth = null;
    } else {
      const prev = aggregated[index - 1];

      // Sales Growth
      if (prev.sales > 0) {
        q.salesGrowth = ((q.sales - prev.sales) / prev.sales) * 100;
      } else {
        q.salesGrowth = null;
      }

      // Orders Growth
      if (prev.orders > 0) {
        q.ordersGrowth = ((q.orders - prev.orders) / prev.orders) * 100;
      } else {
        q.ordersGrowth = null;
      }

      // Basket Size Growth
      if (prev.basketSize && prev.basketSize > 0) {
        q.basketSizeGrowth =
          ((q.basketSize! - prev.basketSize) / prev.basketSize) * 100;
      } else {
        q.basketSizeGrowth = null;
      }
    }

    return q;
  });
};

interface DayAccumulator {
  name: string;
  full: string;
  totalOrders: number;
  count: number;
  dayIndex: number;
}

/**
 * Aggregate Daily Data into Day of Week (Minggu - Sabtu)
 * Now calculates AVERAGE instead of SUM for more accurate analysis
 * @param dailyData - Array of { tanggal, total } objects
 * @returns Array of 7 Days with avgOrders
 */
export const aggregateByDayOfWeek = (
  dailyData: DailyDataItem[]
): DayOfWeekData[] => {
  const days: DayAccumulator[] = [
    { name: "Min", full: "Minggu", totalOrders: 0, count: 0, dayIndex: 0 },
    { name: "Sen", full: "Senin", totalOrders: 0, count: 0, dayIndex: 1 },
    { name: "Sel", full: "Selasa", totalOrders: 0, count: 0, dayIndex: 2 },
    { name: "Rab", full: "Rabu", totalOrders: 0, count: 0, dayIndex: 3 },
    { name: "Kam", full: "Kamis", totalOrders: 0, count: 0, dayIndex: 4 },
    { name: "Jum", full: "Jumat", totalOrders: 0, count: 0, dayIndex: 5 },
    { name: "Sab", full: "Sabtu", totalOrders: 0, count: 0, dayIndex: 6 },
  ];

  dailyData.forEach((item) => {
    const date = new Date(item.tanggal);
    const dayIndex = date.getDay(); // 0 = Sunday
    days[dayIndex].totalOrders += Number(item.total || 0);
    days[dayIndex].count += 1; // Track how many of this day occurred
  });

  // Calculate average and format output
  return days.map((d) => ({
    name: d.name,
    full: d.full,
    dayIndex: d.dayIndex,
    orders: d.count > 0 ? Math.round(d.totalOrders / d.count) : 0, // AVERAGE
    totalOrders: d.totalOrders, // Keep total for reference
    count: d.count, // How many occurrences (e.g., "4 Senins")
    displayMonth: d.name, // XAxis key
  }));
};

// ==========================================
// FORMAT AXIS VALUE
// ==========================================

/**
 * Format nilai angka untuk Y-Axis chart
 * Mengkonversi angka besar ke format ringkas (rb, jt, M)
 *
 * @param value - Nilai yang akan diformat
 * @returns String terformat (e.g., "1.5M", "500jt", "10rb")
 *
 * @example
 * formatAxisValue(1500000000) // "1.5M"
 * formatAxisValue(500000000)  // "500jt"
 * formatAxisValue(50000)      // "50rb"
 */
export const formatAxisValue = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}jt`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}rb`;
  }
  return String(value);
};
