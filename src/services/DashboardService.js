import apiClient from "./axios";

export const DashboardService = {
  totalPenjualan: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-penjualan", params),

  totalPesanan: (params) =>
    apiClient.post("/admin/dashboard-tinjauan/total-pesanan", params),

  // High-level methods used by DashboardOverview
  getStats: async (params) => {
    try {
      const [salesRes, ordersRes] = await Promise.all([
        apiClient.post("/admin/dashboard-tinjauan/total-penjualan", params),
        apiClient.post("/admin/dashboard-tinjauan/total-pesanan", params),
      ]);

      return {
        totalSales: salesRes.data.data?.total || 0,
        totalOrders: ordersRes.data.data?.total || 0,
        averageOrderValue: 0, // Calculate if possible
        conversionRate: 0,
      };
    } catch (e) {
      console.error("Dashboard Stats Error", e);
      return {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
      };
    }
  },

  getSalesChart: async (params) => {
    // Mock chart data for now as backend might not have chart endpoint ready
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
