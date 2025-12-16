/**
 * Dashboard Service
 * -----------------
 * Service untuk endpoint Dashboard Tinjauan (Overview).
 *
 * Endpoints:
 * - Total Penjualan, Pesanan, Pengunjung
 * - Conversion Rate, Basket Size
 * - Tren Penjualan (Chart Data)
 */

import apiClient from "./axios";
import type { AxiosResponse } from "axios";

interface DashboardParams {
  store_id?: string;
  start_date?: string;
  end_date?: string;
}

interface DashboardMetric {
  total: number;
  percent: number;
  trend: "Up" | "Down" | "Equal";
  sparkline?: number[];
}

interface StatsResponse {
  conversionRate: DashboardMetric;
  basketSize: DashboardMetric;
  totalVisitors: DashboardMetric;
  totalNewBuyers: DashboardMetric;
}

interface ChartDataPoint {
  date: string;
  amount: number;
}

export const DashboardService = {
  // Dashboard Tinjauan Endpoints
  totalPenjualan: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/total-penjualan", params),

  totalPesanan: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/total-pesanan", params),

  totalPengunjung: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/total-pengunjung", params),

  conversionRate: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/convertion-rate", params),

  basketSize: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/basket-size", params),

  trenPenjualan: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/tren-penjualan", params),

  // Total Orders per Week (NEW)
  totalPesananInWeek: (params: DashboardParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/total-pesanan/in-week", params),

  // High-level methods used by AdminDashboard
  getStats: async (params: DashboardParams): Promise<StatsResponse> => {
    try {
      const [conversionRes, basketRes, visitorsRes] = await Promise.all([
        apiClient.post("/admin/dashboard-tinjauan/convertion-rate", params),
        apiClient.post("/admin/dashboard-tinjauan/basket-size", params),
        apiClient.post("/admin/dashboard-tinjauan/total-pengunjung", params),
      ]);

      return {
        conversionRate: conversionRes.data.data,
        basketSize: basketRes.data.data,
        totalVisitors: visitorsRes.data.data,
        // Mocking New Buyers as API is missing
        totalNewBuyers: {
          total: 0,
          percent: 0,
          trend: "Equal",
          sparkline: [],
        },
      };
    } catch (e) {
      console.error("Dashboard Stats Error", e);
      throw e;
    }
  },

  getSalesChart: async (
    _params: DashboardParams
  ): Promise<ChartDataPoint[]> => {
    // Keep mock for now or implement if needed
    return [
      { date: "Senin", amount: 1500000 },
      { date: "Selasa", amount: 2300000 },
      { date: "Rabu", amount: 1800000 },
      { date: "Kamis", amount: 3200000 },
      { date: "Jumat", amount: 2100000 },
      { date: "Sabtu", amount: 4500000 },
      { date: "Minggu", amount: 3900000 },
    ];
  },

  // Analytics Endpoints (Legacy Path - to be standardized to datalaris/v1 later)
  // Using full URL to override baseURL of apiClient
  getProductsAnalytics: (): Promise<AxiosResponse> =>
    apiClient.get("http://localhost:8080/fin/v1/api/analytics/products"),

  getOrdersAnalytics: (): Promise<AxiosResponse> =>
    apiClient.get("http://localhost:8080/fin/v1/api/analytics/orders"),
};
