/**
 * Header
 * ------
 * Komponen header utama yang muncul di bagian atas dashboard.
 *
 * Berisi:
 * - Platform Selector (Shopee/TikTok)
 * - Store Selector (pilih toko)
 * - Date Range Picker (filter tanggal)
 * - Theme Toggle (light/dark mode)
 * - Notifikasi bell
 * - User Profile dropdown
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Store,
  ChevronDown,
  User,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";
import { ShopeeLogo, TikTokLogo } from "../common/Icons";
import { useAuth } from "@/context/AuthContext";
import { useFilter } from "@/context/FilterContext";
import ThemeToggle from "../common/ThemeToggle";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

// Tipe untuk store dari context
interface StoreItem {
  ID?: string | number;
  id?: string | number;
  Name?: string;
  name?: string;
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { platform, setPlatform, store, setStore, stores } = useFilter();
  const navigate = useNavigate();

  /**
   * Mendapatkan nama display untuk toko
   * Handle berbagai format nama field dari backend
   */
  const getStoreDisplayName = (s: StoreItem): string => {
    return s.Name || s.name || "Unnamed Store";
  };

  // Cari toko yang dipilih dari list
  const selectedStore =
    store === "all"
      ? null
      : stores.find((s: StoreItem) => (s.ID || s.id) == store);
  const selectedStoreName = selectedStore
    ? getStoreDisplayName(selectedStore)
    : "Semua Toko";

  // Handler logout
  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 glass-bar border-b flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300 animate-fade-in shadow-sm">
      {/* Bagian kiri: Selectors */}
      <div className="flex items-center gap-3">
        {/* ===== Platform Selector ===== */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="filter"
              className="w-[220px] sm:w-[260px] justify-between h-12 px-4 group transition-all hover:ring-2 hover:ring-primary/10"
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                {/* Icon berdasarkan platform */}
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    platform === "shopee"
                      ? "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
                      : platform === "tiktok-tokopedia"
                      ? "bg-black/5 text-black dark:text-white group-hover:bg-black/10"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                  }`}
                >
                  {platform === "shopee" ? (
                    <ShopeeLogo className="w-5 h-5" />
                  ) : platform === "tiktok-tokopedia" ? (
                    <TikTokLogo className="w-5 h-5" />
                  ) : (
                    <Store size={20} />
                  )}
                </div>
                <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                    Platform
                  </span>
                  <span className="text-sm font-bold truncate text-foreground/90 leading-tight">
                    {platform === "all"
                      ? "Semua Platform"
                      : platform === "tiktok-tokopedia"
                      ? "TikTok x Tokopedia"
                      : "Shopee"}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[260px] p-2" align="start">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              Pilih Platform
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-1" />
            <DropdownMenuItem
              onClick={() => setPlatform("shopee")}
              className={`cursor-pointer gap-3 p-2.5 rounded-lg focus:bg-orange-50 focus:text-orange-700 ${
                platform === "shopee" ? "bg-orange-50 text-orange-700" : ""
              }`}
            >
              <ShopeeLogo className="w-5 h-5" />
              <span className="font-medium">Shopee</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPlatform("tiktok-tokopedia")}
              className={`cursor-pointer gap-3 p-2.5 rounded-lg focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-white ${
                platform === "tiktok-tokopedia"
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : ""
              }`}
            >
              <TikTokLogo className="w-5 h-5" />
              <span className="font-medium">TikTok Shop x Tokopedia</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ===== Store Selector ===== */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="filter"
              className="w-[220px] sm:w-[260px] justify-between h-12 px-4 group transition-all hover:ring-2 hover:ring-primary/10"
            >
              <div className="flex items-center gap-3 overflow-hidden text-left">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    store === "all"
                      ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      : "bg-orange-50 text-orange-600 group-hover:bg-orange-100"
                  }`}
                >
                  <Store size={20} />
                </div>
                <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                    Toko
                  </span>
                  <span className="text-sm font-bold truncate text-foreground/90 max-w-[160px] leading-tight">
                    {selectedStoreName}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[260px] p-2" align="start">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
              Pilih Toko
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mb-1" />
            <DropdownMenuItem
              onClick={() => setStore("all")}
              className={`cursor-pointer font-medium p-2.5 rounded-lg mb-1 gap-3 focus:bg-orange-50 focus:text-orange-700 ${
                store === "all" ? "bg-orange-50 text-orange-700" : ""
              }`}
            >
              <Store className="w-5 h-5 text-muted-foreground/70" />
              <span>Semua Toko</span>
            </DropdownMenuItem>
            <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
              {stores.length > 0 ? (
                stores.map((s: StoreItem) => (
                  <DropdownMenuItem
                    key={String(s.ID || s.id)}
                    onClick={() => setStore(String(s.ID || s.id))}
                    className={`cursor-pointer p-2.5 rounded-lg gap-3 focus:bg-orange-50 focus:text-orange-700 ${
                      store === String(s.ID || s.id)
                        ? "bg-orange-50 text-orange-700"
                        : ""
                    }`}
                  >
                    <Store className="w-5 h-5 text-muted-foreground/70" />
                    <span className="font-medium truncate">
                      {getStoreDisplayName(s)}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-xs text-muted-foreground text-center italic bg-muted/30 rounded-lg">
                  Belum ada toko terhubung
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bagian kanan: Theme, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 rounded-full hover:bg-muted/50 transition-all"
        >
          <Bell size={20} className="text-muted-foreground" />
          {/* Red dot indicator untuk notifikasi baru */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </Button>

        {/* ===== User Profile Dropdown ===== */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="pl-3 pr-4 h-12 hover:bg-muted/50 ml-2 gap-3 border border-transparent hover:border-border/50 transition-all group"
            >
              {/* Avatar dengan border berwarna berdasarkan role/subscription */}
              <div
                className={`p-0.5 rounded-xl border-2 transition-all group-hover:shadow-md ${
                  user?.role === "admin"
                    ? "border-red-500 shadow-red-500/20"
                    : (user as { subscription?: string })?.subscription ===
                      "pro"
                    ? "border-amber-500 shadow-amber-500/20"
                    : "border-border shadow-gray-500/10"
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={(user as { avatar?: string })?.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Info user (hidden di mobile) */}
              <div className="flex flex-col items-start text-left hidden md:flex gap-0.5">
                <span className="text-sm font-bold leading-none text-foreground/90">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none font-medium capitalize flex items-center gap-1.5">
                  {user?.role === "admin" ? (
                    <span className="text-red-500">Super Admin</span>
                  ) : (
                    <span>
                      {(user as { subscription?: string })?.subscription ||
                        "Starter"}{" "}
                      Plan
                    </span>
                  )}
                  {(user as { subscription?: string })?.subscription ===
                    "pro" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  )}
                </span>
              </div>
              <ChevronDown
                size={16}
                className="text-muted-foreground/50 group-hover:text-foreground transition-colors ml-1"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan Akun</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing (Soon)</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
