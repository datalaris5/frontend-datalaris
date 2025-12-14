/**
 * Enum Status & Role
 * ------------------
 * Nilai status terpusat untuk menghindari magic strings.
 */

export enum UserRole {
  ADMIN = "ADMIN",
  TENANT = "TENANT",
  USER = "USER",
}

export enum Marketplace {
  SHOPEE = "Shopee",
  TOKOPEDIA = "Tokopedia",
  LAZADA = "Lazada",
  TIKTOK = "TikTok Shop",
}

export enum StoreStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum SubscriptionPlan {
  FREE = "free",
  BASIC = "basic",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}
