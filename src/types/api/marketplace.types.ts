export interface Marketplace {
  id: number;
  name: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMarketplaceRequest {
  name: string;
}

export interface UpdateMarketplaceRequest {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface MarketplacePaginationRequest {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface MarketplacePaginationResponse {
  data: Marketplace[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
