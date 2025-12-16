/**
 * Store Service
 * -------------
 * Service untuk manajemen toko (CRUD operations).
 */

import apiClient from "./axios";
import {
  Store,
  CreateStoreRequest,
  UpdateStoreRequest,
  StorePaginationRequest,
  StorePaginationResponse,
} from "@/types/api/store.types";
import { AxiosResponse } from "axios";

// Interface untuk backward compatibility dengan halaman User Store Management
interface LegacyStoreData {
  id: string | number;
  name: string;
  platform: string;
  shop_id?: string;
  access_token?: string;
  status?: string;
  last_sync?: string;
  marketplace_id?: number;
  is_active?: boolean;
}

export const StoreService = {
  // List with pagination
  list: (
    params: StorePaginationRequest
  ): Promise<AxiosResponse<StorePaginationResponse>> =>
    apiClient.post("/admin/store/page", params),

  // Get All Stores (Helper untuk backward compatibility)
  getAll: async (): Promise<LegacyStoreData[]> => {
    try {
      const res = await apiClient.post("/admin/store/page", {
        page: 1,
        limit: 100,
      });
      const payload = res.data?.data || res.data;
      // Handle pagination wrapper
      if (payload && Array.isArray(payload.data)) {
        return payload.data.map((store: Store) => ({
          ...store,
          platform: "shopee", // Default platform jika tidak ada
        }));
      }
      // Handle direct array
      if (Array.isArray(payload)) {
        return payload.map((store: Store) => ({
          ...store,
          platform: "shopee",
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      return [];
    }
  },

  // Get Store By ID
  get: (id: number): Promise<AxiosResponse<Store>> =>
    apiClient.get(`/admin/store/${id}`),

  // Create Store
  create: (
    data: CreateStoreRequest | Record<string, unknown>
  ): Promise<AxiosResponse<Store>> => apiClient.post("/admin/store", data),

  // Update Store (accepts legacy id + data format or new UpdateStoreRequest)
  update: (
    idOrData: number | string | UpdateStoreRequest,
    data?: Record<string, unknown>
  ): Promise<AxiosResponse<Store>> => {
    // Legacy format: update(id, data)
    if (data !== undefined) {
      return apiClient.put("/admin/store", { ...data, id: idOrData });
    }
    // New format: update(UpdateStoreRequest)
    return apiClient.put("/admin/store", idOrData);
  },

  // Soft Delete Store
  delete: (id: number | string): Promise<AxiosResponse<null>> =>
    apiClient.delete(`/admin/store/${id}`),

  // Toggle Active Status
  status: (
    id: number,
    status: "active" | "inactive"
  ): Promise<AxiosResponse<null>> =>
    apiClient.post(`/admin/store/${id}/status/${status}`),

  // List of Values (Dropdown)
  lov: (): Promise<AxiosResponse<{ id: number; value: string }[]>> =>
    apiClient.get("/admin/store/lov"),
};
