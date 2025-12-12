import apiClient from "./axios";

export const AdsService = {
  penjualan: (params) =>
    apiClient.post("/admin/dashboard-iklan/penjualan-iklan", params),

  biaya: (params) =>
    apiClient.post("/admin/dashboard-iklan/biaya-iklan", params),

  roas: (params) => apiClient.post("/admin/dashboard-iklan/roas", params),

  conversionRate: (params) =>
    apiClient.post("/admin/dashboard-iklan/convertion-rate", params),

  ctr: (params) =>
    apiClient.post("/admin/dashboard-iklan/presentase-klik", params),

  impressions: (params) =>
    apiClient.post("/admin/dashboard-iklan/dilihat", params),
};
