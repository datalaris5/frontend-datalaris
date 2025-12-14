/**
 * Ads Service
 * -----------
 * Service untuk endpoint Dashboard Iklan.
 *
 * Endpoints:
 * - penjualan: Penjualan dari iklan
 * - biaya: Biaya iklan
 * - roas: Return On Ad Spend
 * - conversionRate: Tingkat konversi iklan
 * - ctr: Click-Through Rate
 * - impressions: Total tayangan iklan
 */

import apiClient from "./axios";
import type { AxiosResponse } from "axios";

interface AdsParams {
  store_id?: string;
  start_date?: string;
  end_date?: string;
}

export const AdsService = {
  penjualan: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/penjualan-iklan", params),

  biaya: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/biaya-iklan", params),

  roas: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/roas", params),

  conversionRate: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/convertion-rate", params),

  ctr: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/presentase-klik", params),

  impressions: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/dilihat", params),

  salesVsCost: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/penjualan-dan-biaya", params),

  totalRoas: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/total-roas", params),

  topProducts: (params: AdsParams): Promise<AxiosResponse> =>
    apiClient.post("/admin/dashboard-iklan/top-product", params),
};
