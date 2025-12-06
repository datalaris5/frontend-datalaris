import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/datalaris/v1/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to inject token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors systematically
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is 401 (Unauthorized) and redirect to login if needed
    // or just pass it down for the UI to handle
    if (error.response && error.response.status === 401) {
      // Optional: Clear storage and redirect to login
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (credentials) => apiClient.post("/login", credentials),
    // Removed adminLogin as backend seems to use a unified /login
    // If there is a specific admin login, restore it, but routes.go only shows /login
  },
  stores: {
    // Backend uses POST /admin/store/page for listing with pagination
    list: (params) =>
      apiClient.post("/admin/store/page", params || { page: 1, limit: 100 }),
    create: (data) => apiClient.post("/admin/store", data),
    update: (id, data) => apiClient.put(`/admin/store`, { ...data, id }), // Check if ID is in body or param. Controller uses body for ID usually in update.
    get: (id) => apiClient.get(`/admin/store/${id}`),
    delete: (id) => apiClient.delete(`/admin/store/${id}`),
    status: (id, status) =>
      apiClient.post(`/admin/store/${id}/status/${status}`),
    lov: () => apiClient.get("/admin/store/lov"),
  },
  marketplaces: {
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
  },
  upload: {
    // Helper to determine endpoint based on platform and type
    send: (platform, type, formData) => {
      // Backend route: auth.POST("/upload/:id", controllers.UploadExcel)
      // We need to know what :id represents here. It might be marketplace ID or store ID?
      // Looking at routes.go: auth.POST("/upload/:id", controllers.UploadExcel)
      // Let's assume for now :id is related to the entity being uploaded to.
      // But standard frontend upload usually sends file.
      // Let's keep it generic or check usage.
      // For now, mapping to the most likely route.

      let endpoint = `/admin/upload/1`; // Placeholder ID, needs to be dynamic based on context

      // If the usage in DataUpload.jsx passes an ID, we should use it.
      // Current api.js signature: send: (platform, type, formData) => ...
      // We might need to update the calling code or overload this.

      return apiClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
  dashboard: {
    totalPenjualan: (params) =>
      apiClient.post("/admin/dashboard-tinjauan/total-penjualan", params),
    totalPesanan: (params) =>
      apiClient.post("/admin/dashboard-tinjauan/total-pesanan", params),
  },
  admin: {
    // Existing admin placeholders - map to real endpoints if they exist, or comment out/mock if not ready
    // Based on routes.go, we implemented store/marketplace above.
    // Users endpoints not yet seen in routes.go provided (only auth/store/marketplace/dashboard).
    // Keeping wrappers but warning they might fail if routes don't exist.
    users: {
      list: (params) => Promise.resolve({ data: [] }), // Mock for now as route missing
    },
    settings: {
      get: () => Promise.resolve({ data: {} }), // Mock
    },
  },
};

export default api;
