/**
 * Filter Context
 * --------------
 * Context untuk manajemen filter global dashboard.
 *
 * Menyediakan:
 * - platform: Platform aktif (shopee/tiktok/all)
 * - store: Store ID yang dipilih
 * - stores: Daftar semua toko user
 * - dateRange: Rentang tanggal filter
 * - marketplaces: Daftar marketplace tersedia
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/services/api";
import { useAuth } from "./AuthContext";
import type { Store } from "@/types";

interface DateRangeState {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface Marketplace {
  id: string;
  ID?: string;
  value?: string;
  Value?: string;
  name?: string;
  Name?: string;
}

interface FilterContextType {
  platform: string;
  setPlatform: React.Dispatch<React.SetStateAction<string>>;
  store: string;
  setStore: React.Dispatch<React.SetStateAction<string>>;
  stores: Store[];
  refreshStores: () => Promise<void>;
  dateRange: DateRangeState;
  setDateRange: React.Dispatch<React.SetStateAction<DateRangeState>>;
  marketplaces: Marketplace[];
  getMarketplaceName: (id: string) => string;
}

interface FilterProviderProps {
  children: ReactNode;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
};

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [platform, setPlatform] = useState("shopee"); // 'shopee', 'tiktok-tokopedia', 'all'
  const [store, setStore] = useState("all"); // 'all' or specific store ID
  const [stores, setStores] = useState<Store[]>([]); // List of stores
  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
    endDate: new Date(),
    label: "30 Hari Terakhir",
  });

  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshStores();
      refreshMarketplaces();
    } else {
      setStores([]);
      setMarketplaces([]);
    }
  }, [user]);

  const refreshStores = async (): Promise<void> => {
    try {
      const items = await api.store.getAll();
      console.log("DEBUG: FilterContext Stores Fetched:", items);
      setStores(items as Store[]);
    } catch (error) {
      console.error("Failed to fetch stores for filter context:", error);
    }
  };

  const refreshMarketplaces = async (): Promise<void> => {
    try {
      const response = await api.marketplace.lov();
      const items = response.data?.data || response.data || [];
      setMarketplaces(items);
    } catch (error) {
      console.error("Failed to fetch marketplaces:", error);
    }
  };

  const getMarketplaceName = (id: string): string => {
    const mp = marketplaces.find((m) => m.id === id || m.ID === id);
    return mp
      ? mp.value || mp.Value || mp.name || mp.Name || "Unknown"
      : "Unknown";
  };

  const value: FilterContextType = {
    platform,
    setPlatform,
    store,
    setStore,
    stores, // Exposed
    refreshStores, // Exposed for manual refresh (e.g. after adding store)
    dateRange,
    setDateRange,
    marketplaces, // Exposed
    getMarketplaceName, // Helper
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
