import apiClient from "./axios";

export const UploadService = {
  send: (platform, type, formData, storeId) => {
    if (!storeId) {
      return Promise.reject(new Error("Store ID is required"));
    }

    let endpoint = "";
    if (type === "overview") {
      endpoint = `/admin/upload/tinjauan/${storeId}`;
    } else if (type === "ads") {
      endpoint = `/admin/upload/iklan/${storeId}`;
    } else {
      return Promise.reject(
        new Error("Tipe data ini belum didukung untuk upload.")
      );
    }

    return apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getHistory: (storeId) => {
    return apiClient.get(
      `/admin/history-data-upload${
        storeId && storeId !== "all" ? `?store_id=${storeId}` : ""
      }`
    );
  },
};
