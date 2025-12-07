import apiClient from "./axios";

export const MarketplaceService = {
  list: (params) =>
    apiClient.post(
      "/admin/marketplaces/page",
      params || { page: 1, limit: 100 }
    ),
  create: (data) => apiClient.post("/admin/marketplaces", data),
  update: (id, data) => apiClient.put(`/admin/marketplaces`, { ...data, id }),
  get: (id) => apiClient.get(`/admin/marketplaces/${id}`),
  delete: (id) => apiClient.delete(`/admin/marketplaces/${id}`),
  status: (id, status) =>
    apiClient.post(`/admin/marketplaces/${id}/status/${status}`),
  lov: () => apiClient.get("/admin/marketplaces/lov"),
};
