/**
 * Upload Service
 * --------------
 * Service untuk upload data Excel ke backend.
 *
 * Tipe upload yang didukung:
 * - overview: Data tinjauan (penjualan, pesanan, dll)
 * - ads: Data iklan
 * - chat: Data percakapan
 */

import apiClient from "./axios";
import type { AxiosResponse } from "axios";

type UploadType = "overview" | "ads" | "chat";

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

    let endpoint = "";
    if (type === "overview") {
      endpoint = `/admin/upload/tinjauan/${storeId}`;
    } else if (type === "ads") {
      endpoint = `/admin/upload/iklan/${storeId}`;
    } else if (type === "chat") {
      endpoint = `/admin/upload/chat/${storeId}`;
    } else {
      return Promise.reject(
        new Error("Tipe data ini belum didukung untuk upload.")
      );
    }

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
