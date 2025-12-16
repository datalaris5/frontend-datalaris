/**
 * Axios HTTP Client
 * -----------------
 * Konfigurasi axios instance dengan interceptors untuk authentication.
 *
 * Fitur:
 * - Base URL dari environment variable
 * - Request interceptor: inject token ke header
 * - Response interceptor: handle error 401 (Unauthorized)
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/datalaris/v1/api";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to inject token if available
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors systematically
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Check if error is 401 (Unauthorized) and redirect to login if needed
    if (error.response && error.response.status === 401) {
      // Optional: Clear storage and redirect to login
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
