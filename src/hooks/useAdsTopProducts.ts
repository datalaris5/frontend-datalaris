import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/services/api";
import { useFilter } from "@/context/FilterContext";
import { getTargetStores, buildPayload } from "@/utils/dashboardHelpers";

export interface TopProduct {
  nama_iklan: string;
  penjualan: number;
  biaya: number;
  roas: number;
  convertion_rate: number;
}

export const useAdsTopProducts = () => {
  const { store, stores, dateRange } = useFilter();

  const query = useQuery({
    queryKey: ["dashboard", "ads", "top-products", store, dateRange],
    queryFn: async (): Promise<TopProduct[]> => {
      // 1. Target Stores & Dates
      const targetStores = getTargetStores(store, stores);
      const dates = {
        fromDate: dateRange?.startDate
          ? format(dateRange.startDate, "yyyy-MM-dd")
          : "",
        toDate: dateRange?.endDate
          ? format(dateRange.endDate, "yyyy-MM-dd")
          : "",
      };

      if (!dates.fromDate || !dates.toDate) {
        return [];
      }

      // Top Products only supported for single store currently or standard API behavior
      // If "all" stores, we might need a different strategy or just return empty if backend doesn't support aggregation
      // Assuming behavior matches current implementation: only fetch if single store selected or handling first store

      if (store === "all") {
        return []; // Or implement aggregation if backend supports it
      }

      // 2. Fetch Top Products
      // Re-use logic: fetch for the selected store
      const s = targetStores[0];
      if (!s) return [];

      try {
        const payload = buildPayload(s.id!, s.marketplace_id || 1, dates);
        const res = await api.ads.topProducts(payload);
        return res.data?.data || [];
      } catch (e) {
        console.error("Failed top products", e);
        return [];
      }
    },
    enabled:
      !!dateRange?.startDate && !!dateRange?.endDate && stores.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    topProducts: query.data || [],
    loading: query.isLoading,
    error: query.error,
  };
};
