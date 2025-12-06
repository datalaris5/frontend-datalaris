import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [platform, setPlatform] = useState('shopee'); // 'shopee', 'tiktok-tokopedia', 'all'
  const [store, setStore] = useState('all'); // 'all' or specific store ID
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default last 30 days
    endDate: new Date(),
    label: '30 Hari Terakhir'
  });

  const value = {
    platform,
    setPlatform,
    store,
    setStore,
    dateRange,
    setDateRange,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
