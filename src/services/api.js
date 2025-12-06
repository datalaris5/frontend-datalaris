import axios from 'axios';

const BASE_URL = 'http://localhost:8080/fin/v1/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to inject token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    login: (credentials) => apiClient.post('/login', credentials),
    adminLogin: (credentials) => apiClient.post('/admin/login', credentials),
  },
  stores: {
    list: () => apiClient.get('/stores'),
    create: (data) => apiClient.post('/stores', data),
  },
  upload: {
    // Helper to determine endpoint based on platform and type
    send: (platform, type, formData) => {
      let endpoint = '/upload'; // Default for overview/orders
      
      if (platform === 'shopee') {
        if (type === 'ads') endpoint = '/upload/shopee/ads';
        if (type === 'chat') endpoint = '/upload/shopee/chat';
      }
      
      // FormData requires multipart/form-data header (axios handles this automatically when body is FormData)
      return apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
  analytics: {
    orders: (params) => apiClient.get('/analytics/orders', { params }),
    products: (params) => apiClient.get('/analytics/products', { params }),
  },
  admin: {
    // User Management
    users: {
      list: (params) => apiClient.get('/admin/users', { params }),
      get: (id) => apiClient.get(`/admin/users/${id}`),
      create: (data) => apiClient.post('/admin/users', data),
      update: (id, data) => apiClient.put(`/admin/users/${id}`, data),
      delete: (id) => apiClient.delete(`/admin/users/${id}`),
    },
    // Store Management (Admin)
    stores: {
      list: (params) => apiClient.get('/admin/stores', { params }),
      get: (id) => apiClient.get(`/admin/stores/${id}`),
      create: (data) => apiClient.post('/admin/stores', data),
      update: (id, data) => apiClient.put(`/admin/stores/${id}`, data),
      delete: (id) => apiClient.delete(`/admin/stores/${id}`),
    },
    // System Settings
    settings: {
      get: () => apiClient.get('/admin/settings'),
      update: (data) => apiClient.put('/admin/settings', data),
    },
    // Dashboard Stats
    stats: {
      overview: () => apiClient.get('/admin/stats/overview'),
      health: () => apiClient.get('/admin/stats/health'),
    },
  },

};

export default api;
