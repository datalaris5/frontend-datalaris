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

  // Year-over-Year Growth (FEAT-001 - Backend not yet implemented)
  yoyGrowth: (params: {
    store_id: number;
    marketplace_id: number;
    year: number;
  }): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-tinjauan/yoy-growth", params),
};
