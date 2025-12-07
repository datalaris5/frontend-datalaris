import apiClient from "./axios";

export const StoreService = {
  // Backend uses POST /admin/store/page for listing with pagination
  list: (params) =>
    apiClient.post("/admin/store/page", params || { page: 1, limit: 100 }),

  // Also common getAll helper
  // Unwrapping pagination structure based on confirmed pattern
  getAll: () =>
    apiClient.post("/admin/store/page", { page: 1, limit: 100 }).then((res) => {
      const payload = res.data.data || res.data;
      // If payload contains 'data' array (standard pagination), return it
      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }
      // If payload itself is array
      if (Array.isArray(payload)) {
        return payload;
      }
      return [];
    }),

  create: (data) => apiClient.post("/admin/store", data),

  update: (id, data) => apiClient.put(`/admin/store`, { ...data, id }),

  get: (id) => apiClient.get(`/admin/store/${id}`),

  delete: (id) => apiClient.delete(`/admin/store/${id}`),

  status: (id, status) => apiClient.post(`/admin/store/${id}/status/${status}`),

  lov: () => apiClient.get("/admin/store/lov"),
};
