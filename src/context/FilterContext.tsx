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
import {
  subDays,
  startOfMonth,
  startOfYear,
  subMonths,
  endOfMonth,
} from "date-fns";
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
  // Helper to calculate date range based on label
  const calculateDateRangeFromLabel = (label: string): DateRangeState => {
    const today = new Date();
    // Reset hours to avoid drift
    today.setHours(23, 59, 59, 999);

    let start = new Date();
    let end = today;

    if (label === "Hari Ini") {
      start = new Date();
      start.setHours(0, 0, 0, 0);
    } else if (label === "Kemarin") {
      start = subDays(today, 1);
      start.setHours(0, 0, 0, 0);
      end = subDays(today, 1);
      end.setHours(23, 59, 59, 999);
    } else if (label === "7 Hari Terakhir") {
      start = subDays(today, 6); // Includes today
      start.setHours(0, 0, 0, 0);
    } else if (label === "30 Hari Terakhir") {
      start = subDays(today, 29); // Includes today
      start.setHours(0, 0, 0, 0);
    } else if (label === "Bulan Ini") {
      start = startOfMonth(today);
    } else if (label === "Bulan Lalu") {
      const lastMonth = subMonths(today, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
    } else if (label === "Tahun Ini") {
      start = startOfYear(today);
    } else {
      // Default fallback (30 days)
      start = subDays(today, 29);
      start.setHours(0, 0, 0, 0);
    }

    return { startDate: start, endDate: end, label };
  };

  const [dateRange, setDateRange] = useState<DateRangeState>(() => {
    // Try to load saved preference from localStorage
    try {
      const savedLabel = localStorage.getItem("datalaris_date_pref");
      if (savedLabel && savedLabel !== "Custom") {
        // If saved label exists and is dynamic, recalculate dates
        return calculateDateRangeFromLabel(savedLabel);
      }
    } catch (e) {
      console.warn("Failed to load date preference", e);
    }

    // Default if no preference or error
    return {
      startDate: subDays(new Date(), 29), // Default last 30 days
      endDate: new Date(),
      label: "30 Hari Terakhir",
    };
  });

  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);

  const { user } = useAuth();

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

  useEffect(() => {
    if (user) {
      refreshStores();
      refreshMarketplaces();
    } else {
      setStores([]);
      setMarketplaces([]);
    }
  }, [user]);

  // Save date preference
  useEffect(() => {
    if (dateRange.label && dateRange.label !== "Custom") {
      localStorage.setItem("datalaris_date_pref", dateRange.label);
    }
  }, [dateRange.label]);

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
