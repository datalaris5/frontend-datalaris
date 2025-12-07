import apiClient from "./axios";

export const UploadService = {
  send: (platform, type, formData, storeId) => {
    if (!storeId) {
      return Promise.reject(new Error("Store ID is required"));
    }
    return apiClient.post(`/admin/upload/${storeId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getHistory: (storeId) => {
    // Attempt to fetch history. Validating endpoint assumption.
    return apiClient.get(
      `/admin/upload/history${
        storeId && storeId !== "all" ? `?store_id=${storeId}` : ""
      }`
    );
  },
};
