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
  stores: StoreService,
  store: StoreService, // Alias for convenience
  marketplaces: MarketplaceService,
  upload: UploadService,
  dashboard: DashboardService,
  ads: AdsService,
  chat: ChatService,
  admin: {
    // Existing admin placeholders
    users: {
      list: (params) => Promise.resolve({ data: [] }),
    },
    settings: {
      get: () => Promise.resolve({ data: {} }),
    },
  },
};

export default api;
