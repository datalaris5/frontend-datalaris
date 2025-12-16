/**
 * Dashboard Icons Configuration
 * ------------------------------
 * Konfigurasi icon terpusat untuk semua dashboard metrics.
 * Gunakan file ini untuk memastikan konsistensi icon di seluruh aplikasi.
 *
 * Icon Style Guide (2024-2025 Trend):
 * - Thin stroke (strokeWidth: 2)
 * - Contextual/specific icons
 * - No duplicate icons for different metrics
 */

import {
  Banknote,
  ShoppingCart,
  Percent,
  ShoppingBasket,
  UsersRound,
  Eye,
  MousePointerClick,
  Target,
  Megaphone,
  MessageSquare,
  Clock,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

// ============================================
// ICON STYLE CONFIG
// ============================================

/**
 * Default stroke width untuk icons (thinner = modern)
 */
export const ICON_STROKE_WIDTH = 2;

/**
 * Default size untuk icons
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
} as const;

// ============================================
// DASHBOARD METRIC ICONS
// ============================================

export interface MetricIconConfig {
  icon: LucideIcon;
  label: string;
}

/**
 * Icon mapping untuk Dashboard Overview (Tinjauan)
 */
export const overviewIcons = {
  totalSales: { icon: Banknote, label: "Total Penjualan" },
  totalOrders: { icon: ShoppingCart, label: "Total Pesanan" },
  conversionRate: { icon: Percent, label: "Conversion Rate" },
  basketSize: { icon: ShoppingBasket, label: "Basket Size" },
  totalVisitors: { icon: UsersRound, label: "Total Pengunjung" },
  newBuyers: { icon: UsersRound, label: "Pembeli Baru" }, // API pending
} as const;

/**
 * Icon mapping untuk Dashboard Ads (Iklan)
 */
export const adsIcons = {
  adSales: { icon: Banknote, label: "Penjualan Iklan" },
  adCost: { icon: Banknote, label: "Biaya Iklan" },
  roas: { icon: Target, label: "ROAS" },
  impressions: { icon: Eye, label: "Impressions" },
  clicks: { icon: MousePointerClick, label: "Clicks" },
  ctr: { icon: Percent, label: "CTR" },
} as const;

/**
 * Icon mapping untuk Dashboard Chat
 */
export const chatIcons = {
  totalChats: { icon: MessageSquare, label: "Total Chat" },
  responseRate: { icon: Percent, label: "Response Rate" },
  avgResponseTime: { icon: Clock, label: "Waktu Respon" },
  chatOrders: { icon: ShoppingCart, label: "Pesanan dari Chat" },
  uniqueCustomers: { icon: UsersRound, label: "Pelanggan Unik" },
  returningCustomers: { icon: UserCheck, label: "Pelanggan Kembali" },
} as const;

/**
 * Generic icons untuk penggunaan umum
 */
export const genericIcons = {
  advertising: Megaphone,
  chat: MessageSquare,
  trending: Percent,
  target: Target,
  users: UsersRound,
  money: Banknote,
} as const;

// ============================================
// HELPER EXPORTS
// ============================================

export type OverviewIconKey = keyof typeof overviewIcons;
export type AdsIconKey = keyof typeof adsIcons;
export type ChatIconKey = keyof typeof chatIcons;
