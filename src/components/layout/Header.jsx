import React, { useState, useEffect } from "react";
import { Bell, Search, ShoppingBag, Store, ChevronDown } from "lucide-react";
import { ShopeeLogo, TikTokLogo } from "../Icons";
import { useAuth } from "../../context/AuthContext";
import { useFilter } from "../../context/FilterContext";
import ThemeToggle from "../ThemeToggle";
import DateRangePicker from "../common/DateRangePicker";
import toast from "react-hot-toast";

const Header = () => {
  const { user } = useAuth();
  const { platform, setPlatform, store, setStore, stores, getMarketplaceName } =
    useFilter();

  const getStoreDisplayName = (s) => {
    // Robust access to properties
    const sName = s.Name || s.name || "Unnamed Store";
    const sMpId = s.MarketplaceID || s.marketplace_id;
    const mpName = getMarketplaceName(sMpId);
    return `${mpName} - ${sName}`;
  };

  const selectedStore =
    store === "all" ? null : stores.find((s) => (s.ID || s.id) == store); // Loose equality for string/number match

  const selectedStoreName = selectedStore
    ? getStoreDisplayName(selectedStore)
    : "Semua Toko";

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        {/* Platform Selector */}
        <div className="relative group">
          <button className="flex items-center justify-between gap-2 px-3 py-2 w-[260px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg ${
                  platform === "shopee"
                    ? "bg-orange-50"
                    : platform === "tiktok-tokopedia"
                    ? "bg-gray-50"
                    : "bg-blue-50"
                }`}
              >
                {platform === "shopee" ? (
                  <ShopeeLogo className="w-5 h-5" />
                ) : platform === "tiktok-tokopedia" ? (
                  <TikTokLogo className="w-5 h-5" />
                ) : (
                  <ShoppingBag size={18} className="text-blue-600" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Platform
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize leading-tight">
                  {platform === "all"
                    ? "Semua Platform"
                    : platform === "tiktok-tokopedia"
                    ? "TikTok Shop x Tokopedia"
                    : platform}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          <div className="absolute top-full left-0 w-full pt-2 hidden group-hover:block z-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-fade-in">
              <button
                onClick={() =>
                  toast("Fitur Multi-Platform segera hadir!", { icon: "🚧" })
                }
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-between gap-2 cursor-not-allowed opacity-75"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>{" "}
                  Semua Platform
                </div>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                  Soon
                </span>
              </button>
              <button
                onClick={() => setPlatform("shopee")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
              >
                <ShopeeLogo className="w-5 h-5" /> Shopee
              </button>
              <button
                onClick={() => setPlatform("tiktok-tokopedia")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
              >
                <TikTokLogo className="w-5 h-5" /> TikTok Shop x Tokopedia
              </button>
            </div>
          </div>
        </div>

        {/* Store Selector */}
        <div className="relative group">
          <button className="flex items-center justify-between gap-2 px-3 py-2 w-[260px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700">
                <Store size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Toko
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate max-w-[120px]">
                  {selectedStoreName}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* Dropdown */}
          <div className="absolute top-full left-0 w-full pt-2 hidden group-hover:block z-20">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-fade-in">
              <button
                onClick={() => setStore("all")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                Semua Toko
              </button>
              {stores.map((s) => (
                <button
                  key={s.ID || s.id}
                  onClick={() => setStore(s.ID || s.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  {getStoreDisplayName(s)}
                </button>
              ))}
              {stores.length === 0 && (
                <div className="px-4 py-2 text-xs text-gray-400 italic">
                  Belum ada toko
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <DateRangePicker
          maxDate={new Date(new Date().setDate(new Date().getDate() - 2))}
          minDate={
            window.location.pathname.includes("orders")
              ? new Date(2025, 5, 1) // June 1, 2025 for Orders
              : new Date(2024, 0, 1) // Jan 1, 2024 for others
          }
        />
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        </button>

        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700 relative group">
          <button className="flex items-center space-x-3 focus:outline-none">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 ${
                user?.subscription === "pro"
                  ? "border-yellow-500"
                  : user?.role === "admin"
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {/* Placeholder Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-400 dark:text-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name || "User"}
              </p>
              <div className="flex items-center gap-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role === "admin"
                    ? "Super Admin"
                    : user?.subscription || "Starter"}
                </p>
                {user?.subscription === "pro" && (
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                )}
              </div>
            </div>
            <ChevronDown
              size={14}
              className="text-gray-400 group-hover:rotate-180 transition-transform duration-200"
            />
          </button>

          {/* Profile Dropdown */}
          <div className="absolute top-full right-0 pt-2 w-48 invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-in-out delay-200 group-hover:delay-0 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Pengaturan Akun
              </a>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
