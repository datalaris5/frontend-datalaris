/**
 * Konstanta Route Aplikasi
 * ------------------------
 * Daftar path route terpusat untuk menghindari hardcoded strings.
 */

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Main App
  HOME: "/",
  DASHBOARD: "/dashboard",

  // Dashboard Sub-routes
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  DASHBOARD_ORDERS: "/dashboard/orders",
  DASHBOARD_PRODUCTS: "/dashboard/products",
  DASHBOARD_ADS: "/dashboard/ads",
  DASHBOARD_CHAT: "/dashboard/chat",

  // Other
  SETTINGS: "/settings",
  STORES: "/stores",
  SUBSCRIPTION: "/subscription",
  DATA: "/data",

  // Admin
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_STORES: "/admin/stores",
  ADMIN_BUILDER: "/admin/builder",
  ADMIN_THEME: "/admin/theme",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
