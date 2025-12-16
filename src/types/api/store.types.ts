export interface Store {
  id: number;
  name: string;
  tenant_id: number;
  marketplace_id: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStoreRequest {
  name: string;
  marketplace_id: number;
}

export interface UpdateStoreRequest {
  id: number;
  name: string;
  marketplace_id: number;
  is_active?: boolean;
}

export interface StorePaginationRequest {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface StorePaginationResponse {
  data: Store[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
