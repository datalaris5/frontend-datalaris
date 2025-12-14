/**
 * API Aggregator
 * --------------
 * Menggabungkan semua service ke dalam satu objek `api` untuk kemudahan import.
 *
 * Cara pakai:
 * import { api } from '@/services/api';
 * api.auth.login(credentials);
 * api.store.getAll();
 */

import apiClient from "./axios";
import { AuthService } from "./AuthService";
import { StoreService } from "./StoreService";
import { MarketplaceService } from "./MarketplaceService";
import { UploadService } from "./UploadService";
import { DashboardService } from "./DashboardService";
import { AdsService } from "./AdsService";
import { ChatService } from "./ChatService";

export const api = {
  auth: AuthService,
  dashboard: DashboardService,
  store: StoreService,
  marketplace: MarketplaceService,
  ads: AdsService,
  chat: ChatService,
  upload: UploadService,
};

export default api;

// Re-export all services for direct import
export { AuthService } from "./AuthService";
export { StoreService } from "./StoreService";
export { MarketplaceService } from "./MarketplaceService";
export { UploadService } from "./UploadService";
export { DashboardService } from "./DashboardService";
export { AdsService } from "./AdsService";
export { ChatService } from "./ChatService";
export { default as apiClient } from "./axios";
