/**
 * Upload Types & Constants
 * ------------------------
 * Definisi tipe data dan konstanta untuk fitur upload.
 */

export const UPLOAD_TYPES = {
  OVERVIEW: "overview",
  ORDERS: "orders",
  ADS: "ads",
  CHAT: "chat",
} as const;

export type UploadType = (typeof UPLOAD_TYPES)[keyof typeof UPLOAD_TYPES];

export const PLATFORMS = {
  SHOPEE: "shopee",
  TIKTOK_TOKOPEDIA: "tiktok-tokopedia",
  ALL: "all",
} as const;

export type PlatformKey = (typeof PLATFORMS)[keyof typeof PLATFORMS];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const allowedExtensions = [".xlsx", ".xls", ".csv"];

export const UPLOAD_ENDPOINTS = {
  [UPLOAD_TYPES.OVERVIEW]: (storeId: string) => `/admin/upload/tinjauan/${storeId}`,
  [UPLOAD_TYPES.ORDERS]: (storeId: string) => `/admin/upload/pesanan/${storeId}`,
  [UPLOAD_TYPES.ADS]: (storeId: string) => `/admin/upload/iklan/${storeId}`,
  [UPLOAD_TYPES.CHAT]: (storeId: string) => `/admin/upload/chat/${storeId}`,
};
