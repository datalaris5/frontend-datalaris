import apiClient from "./axios";

export const DashboardService = {
  // Dashboard Tinjauan Endpoints
  totalPenjualan: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-penjualan", params),

  totalPesanan: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-pesanan", params),

  totalPengunjung: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-pengunjung", params),

  conversionRate: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/convertion-rate", params),

  basketSize: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/basket-size", params),

  trenPenjualan: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/tren-penjualan", params),

  // Total Orders per Week (NEW)
  totalPesananInWeek: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-pesanan/in-week", params),

  // High-level methods used by AdminDashboard
  getStats: async (params) => {
    try {
      const [
        conversionRes,
        basketRes,
        visitorsRes,
        // salesRes, // Not requested for cards yet but good to have
        // ordersRes,
      ] = await Promise.all([
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

  getSalesChart: async (params) => {
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
  getProductsAnalytics: () =>
    apiClient.get("http://localhost:8080/fin/v1/api/analytics/products"),

  getOrdersAnalytics: () =>
    apiClient.get("http://localhost:8080/fin/v1/api/analytics/orders"),
};
