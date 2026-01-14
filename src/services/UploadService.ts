/**
 * Upload Service
 * --------------
 * Service untuk upload data Excel ke backend.
 *
 * Tipe upload yang didukung:
 * - overview: Data tinjauan (penjualan, pesanan, dll)
 * - ads: Data iklan
 * - chat: Data percakapan
 * - orders: Data pesanan
 */

import apiClient from "./axios";
import type { AxiosResponse } from "axios";
import { UploadType, UPLOAD_ENDPOINTS } from "@/types/upload.types";

export const UploadService = {
  send: (
    _platform: string,
    type: UploadType,
    formData: FormData,
    storeId: string
  ): Promise<AxiosResponse> => {
    if (!storeId) {
      return Promise.reject(new Error("Store ID is required"));
    }

    const getEndpoint = UPLOAD_ENDPOINTS[type];

    if (!getEndpoint) {
      return Promise.reject(
        new Error("Tipe data ini belum didukung untuk upload.")
      );
    }

    const endpoint = getEndpoint(storeId);

    return apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getHistory: (storeId?: string): Promise<AxiosResponse> => {
    return apiClient.get(
      `/admin/history-data-upload${
        storeId && storeId !== "all" ? `?store_id=${storeId}` : ""
      }`
    );
  },
};
