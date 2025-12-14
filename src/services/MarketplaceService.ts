/**
 * Marketplace Service
 * -------------------
 * Service untuk manajemen marketplace (CRUD operations).
 */

import apiClient from "./axios";
import {
  Marketplace,
  CreateMarketplaceRequest,
  UpdateMarketplaceRequest,
  MarketplacePaginationRequest,
  MarketplacePaginationResponse,
} from "@/types/api/marketplace.types";
import { AxiosResponse } from "axios";

export const MarketplaceService = {
  // List with pagination
  list: (
    params: MarketplacePaginationRequest
  ): Promise<AxiosResponse<MarketplacePaginationResponse>> =>
    apiClient.post("/admin/marketplaces/page", params),

  // Get Marketplace By ID
  get: (id: number): Promise<AxiosResponse<Marketplace>> =>
    apiClient.get(`/admin/marketplaces/${id}`),

  // Create Marketplace
  create: (
    data: CreateMarketplaceRequest
  ): Promise<AxiosResponse<Marketplace>> =>
    apiClient.post("/admin/marketplaces", data),

  // Update Marketplace
  update: (
    data: UpdateMarketplaceRequest
  ): Promise<AxiosResponse<Marketplace>> =>
    apiClient.put("/admin/marketplaces", data),

  // Soft Delete Marketplace
  delete: (id: number): Promise<AxiosResponse<null>> =>
    apiClient.delete(`/admin/marketplaces/${id}`),

  // Toggle Active Status
  status: (
    id: number,
    status: "active" | "inactive"
  ): Promise<AxiosResponse<null>> =>
    apiClient.post(`/admin/marketplaces/${id}/status/${status}`),

  // List of Values (Dropdown)
  lov: (): Promise<AxiosResponse<{ id: number; value: string }[]>> =>
    apiClient.get("/admin/marketplaces/lov"),
};
