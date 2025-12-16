/**
 * Admin Store Management
 * ----------------------
 * Halaman manajemen toko untuk admin.
 *
 * Fitur:
 * - List toko dengan pagination
 * - Pencarian toko
 * - Toggle status (Active/Inactive)
 * - Delete toko
 */

import React, { useState, useEffect, useCallback } from "react";
import { Store, Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import { Store as StoreType } from "@/types/api/store.types";
import { useDebounce } from "@/hooks/useDebounce"; // Ensure this hook exists or implement local debounce

const AdminStoreManagement: React.FC = () => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchStores = useCallback(async (searchQuery = "", pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.store.list({
        page: pageNum,
        limit: 10,
        search: searchQuery,
      });

      const { data, total, totalPages: pages } = res.data;
      setStores(data || []);
      setTotalItems(total);
      setTotalPages(pages);
    } catch (error) {
      console.error("Failed to fetch stores", error);
      toast.error("Gagal memuat data toko.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for fetching data when page or debounced search changes
  useEffect(() => {
    fetchStores(debouncedSearchTerm, page);
  }, [debouncedSearchTerm, page, fetchStores]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(1); // Reset to page 1 on search
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus toko ini?")) return;

    try {
      await api.store.delete(id);
      toast.success("Toko berhasil dihapus");
      fetchStores(searchTerm, page);
    } catch (error) {
      toast.error("Gagal menghapus toko");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    const newStatus = currentStatus ? "inactive" : "active";
    try {
      await api.store.status(id, newStatus);
      toast.success(`Status toko berhasil diubah ke ${newStatus}`);
      fetchStores(searchTerm, page);
    } catch (error) {
      toast.error("Gagal mengubah status toko");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Store Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage stores registered in the system
          </p>
        </div>
        <Button
          onClick={() =>
            toast("Fitur Create Store belum diimplementasikan di UI", {
              icon: "ℹ️",
            })
          }
          className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
        >
          <Plus size={20} /> Create Store
        </Button>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 rounded-2xl mb-6 flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama toko..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
          />
        </div>
        <Button variant="ghost" onClick={() => fetchStores(searchTerm, page)}>
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat data toko...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && stores.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Tidak ada toko ditemukan
          </h3>
          <p className="text-gray-500">
            Coba kata kunci lain atau tambahkan toko baru.
          </p>
        </div>
      )}

      {/* Stores Grid */}
      {!loading && stores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              {/* Status Indicator Stripe */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  store.is_active ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>

              <div className="flex items-start justify-between mb-4 pl-2">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Badge
                  variant={store.is_active ? "default" : "secondary"}
                  className={`cursor-pointer ${
                    store.is_active
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => handleToggleStatus(store.id, store.is_active)}
                >
                  {store.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-1 pl-2">
                {store.name}
              </h3>
              <p className="text-xs text-muted-foreground pl-2 mb-4">
                ID: {store.id} • Tenant ID: {store.tenant_id}
              </p>

              <div className="space-y-2 mb-4 pl-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Marketplace ID</span>
                  <span className="font-medium text-foreground">
                    {store.marketplace_id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-foreground">
                    {store.created_at
                      ? new Date(store.created_at).toLocaleDateString("id-ID")
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border/50 pl-2">
                <button
                  onClick={() =>
                    toast("Edit fitur belum tersedia", { icon: "🔧" })
                  }
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Edit size={14} className="inline mr-1" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminStoreManagement;
