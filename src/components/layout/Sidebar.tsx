/**
 * Sidebar
 * -------
 * Komponen navigasi utama di sisi kiri dashboard.
 *
 * Fitur:
 * - Mode collapsed (ikon saja) dan expanded (ikon + teks)
 * - Submenu yang bisa di-expand/collapse
 * - Tooltip saat collapsed untuk menampilkan label
 * - Styling aktif/inaktif berdasarkan route saat ini
 * - Tombol logout di bagian bawah
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  UploadCloud,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Settings,
  ShoppingBag,
  Package,
  ChevronDown,
  Megaphone,
  MessageSquare,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Tipe untuk item navigasi dengan children (submenu)
interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  children?: MenuItem[];
}

// Props untuk komponen Sidebar
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  // State untuk tracking grup mana yang di-expand
  const [expandedGroups, setExpandedGroups] = React.useState<
    Record<string, boolean>
  >({
    "Pesanan Toko": true, // Default buka grup "Pesanan Toko"
  });

  // Toggle expand/collapse untuk grup menu
  const toggleGroup = (label: string): void => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Konfigurasi menu items
  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Tinjauan", path: "/overview" },
    { icon: Megaphone, label: "Iklan", path: "/ads" },
    { icon: MessageSquare, label: "Chat", path: "/chat" },
    {
      icon: ShoppingBag,
      label: "Pesanan Toko",
      path: "/orders",
      children: [
        { icon: ShoppingBag, label: "Ringkasan", path: "/orders" },
        {
          icon: Package,
          label: "Detail Produk Pesanan",
          path: "/orders/products",
        },
      ],
    },
    { icon: Store, label: "Manajemen Toko", path: "/stores" },
    { icon: UploadCloud, label: "Upload Data", path: "/upload" },
    { icon: CreditCard, label: "Langganan", path: "/pricing" },
    { icon: Settings, label: "Pengaturan", path: "/settings" },
  ];

  // Handler logout
  const handleLogout = (): void => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 glass-bar border-r transition-all duration-300 flex flex-col shadow-xl shadow-black/5",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Header dengan logo brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        {isOpen ? (
          // Mode expanded: Logo + Nama brand
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-lg brand-shadow">
              D
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Datalaris
            </span>
          </div>
        ) : (
          // Mode collapsed: Hanya logo
          <div className="w-10 h-10 mx-auto rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-xl brand-shadow">
            D
          </div>
        )}

        {/* Tombol toggle sidebar (hidden saat collapsed) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "text-muted-foreground hidden lg:flex",
            !isOpen && "mx-auto mt-4 hidden"
          )}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      {/* Area menu navigasi */}
      <TooltipProvider delayDuration={0}>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedGroups[item.label];

              // --- MODE COLLAPSED: Tampilkan ikon saja dengan tooltip ---
              if (!isOpen) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center justify-center w-full h-12 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon size={20} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="font-medium bg-foreground text-background"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // --- MODE EXPANDED: Tampilkan full menu ---
              return (
                <div key={item.path}>
                  {hasChildren ? (
                    // Parent item dengan toggle (memiliki children)
                    <div
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group font-medium",
                        isActive
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={cn(
                            isActive
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isExpanded ? "transform rotate-180" : ""
                        )}
                      />
                    </div>
                  ) : (
                    // Standard item (tidak punya children)
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                        isActive
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          isActive
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )}

                  {/* Render children items (submenu) */}
                  {hasChildren && isExpanded && isOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-muted pl-2">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-200",
                              isChildActive
                                ? "text-orange-600 dark:text-orange-400 font-bold bg-orange-50/50 dark:bg-orange-900/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            <ChildIcon size={16} />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </TooltipProvider>

      {/* Footer dengan link admin dan tombol logout */}
      <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {/* Link ke Page Builder (hanya untuk admin) */}
        {user?.role === "admin" && (
          <Link
            to="/admin/builder"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-2",
              "text-muted-foreground hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600",
              !isOpen && "justify-center px-0"
            )}
          >
            <Settings size={20} />
            {isOpen && <span>Page Builder</span>}
          </Link>
        )}

        {/* Tombol logout */}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all group",
            "text-muted-foreground hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600",
            !isOpen && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="group-hover:text-red-500" />
          {isOpen && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
