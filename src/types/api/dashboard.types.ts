/**
 * Definisi Type untuk Dashboard
 * -----------------------------
 * Tipe data untuk metrik, chart, dan filter dashboard.
 */

export interface Store {
  id: string;
  name: string;
  marketplace: string;
  isActive: boolean;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MetricData {
  value: number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface FilterState {
  store: string | null;
  dateRange: DateRange;
}

// Dashboard API Response Types
export interface DashboardResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface TopProductItem {
  rank: number;
  product_name: string;
  revenue: number;
  quantity: number;
}

export interface RevenueDataPoint {
  date: string;
  total_revenue: number;
  order_count: number;
}

export interface OrderPlatformData {
  marketplace: string;
  order_count: number;
  percentage: number;
}
