/**
 * Definisi Type untuk Iklan (Ads)
 * -------------------------------
 * Tipe data untuk metrik dan respons dashboard iklan.
 */

export interface AdsMetricData {
  value: number;
  change?: number;
  period?: string;
}

export interface AdsResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SalesAndCostData {
  date: string;
  sales: number;
  cost: number;
}

export interface RoasData {
  date: string;
  roas: number;
}
