import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [platform, setPlatform] = useState("shopee"); // 'shopee', 'tiktok-tokopedia', 'all'
  const [store, setStore] = useState("all"); // 'all' or specific store ID
  const [stores, setStores] = useState([]); // List of stores
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
    endDate: new Date(),
    label: "30 Hari Terakhir",
  });

  const [marketplaces, setMarketplaces] = useState([]);

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

  const refreshStores = async () => {
    try {
      const response = await api.stores.list();
      // Backend returns { message: "...", data: { data: [...], total: ... } } (PaginationResponse uses "data" tag)
      // So path is: axios.data -> BaseResponse.data -> PaginationResponse.data
      const items =
        response.data?.data?.data || response.data?.data?.items || [];
      console.log("DEBUG: FilterContext Stores Fetched:", items);
      setStores(items);
    } catch (error) {
      console.error("Failed to fetch stores for filter context:", error);
    }
  };

  const refreshMarketplaces = async () => {
    try {
      const response = await api.marketplaces.lov();
      const items = response.data?.data || response.data || [];
      setMarketplaces(items);
    } catch (error) {
      console.error("Failed to fetch marketplaces:", error);
    }
  };

  const getMarketplaceName = (id) => {
    const mp = marketplaces.find((m) => m.id === id || m.ID === id);
    return mp ? mp.value || mp.Value || mp.name || mp.Name : "Unknown";
  };

  const value = {
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
