import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { ShopeeLogo, TikTokLogo } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [isActive, setIsActive] = useState(true); // New Status State
  const [marketplaces, setMarketplaces] = useState([]);
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState(null);

  // State for editing
  const [editingStore, setEditingStore] = useState(null);

  // State for deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  const { user } = useAuth();
  const { refreshStores } = useFilter();

  useEffect(() => {
    Promise.all([fetchStores(), fetchMarketplaces()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchMarketplaces = async () => {
    try {
      const response = await api.marketplaces.lov();
      const lov = response.data.data || [];
      setMarketplaces(lov);
    } catch (error) {
      console.error("Failed to fetch marketplaces:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await api.stores.list();
      // Backend returns { message: "...", data: { data: [...], total: ... } }
      const items =
        response.data?.data?.data || response.data?.data?.items || [];
      setStores(items);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      if (process.env.NODE_ENV === "development") {
        setStores([]);
      }
    }
  };

  // Auto-select Marketplace Logic
  useEffect(() => {
    if (
      isCreating &&
      !editingStore &&
      !selectedMarketplaceId &&
      marketplaces.length > 0
    ) {
      const shopee = marketplaces.find((m) =>
        m.value.toLowerCase().includes("shopee")
      );
      if (shopee) setSelectedMarketplaceId(shopee.id);
    }
  }, [isCreating, editingStore, marketplaces, selectedMarketplaceId]);

  const currentStoreCount = stores.length;
  const isStarter = user?.subscription === "starter" || !user?.subscription;
  const isLimitReached = !editingStore && isStarter && currentStoreCount >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimitReached && !editingStore) return;

    if (!selectedMarketplaceId) {
      toast.error("Marketplace ID tidak ditemukan.");
      return;
    }

    const selectedMp = marketplaces.find((m) => m.id === selectedMarketplaceId);
    if (selectedMp && selectedMp.value.toLowerCase().includes("tiktok")) {
      toast.error("Integrasi TikTok Shop segera hadir!");
      return;
    }

    try {
      if (editingStore) {
        await api.stores.update(editingStore.ID || editingStore.id, {
          name: storeName,
          marketplace_id: selectedMarketplaceId,
          is_active: isActive, // Send active status
        });
        toast.success("Toko berhasil diperbarui!");
      } else {
        await api.stores.create({
          name: storeName,
          marketplace_id: selectedMarketplaceId,
          is_active: isActive,
        });
        toast.success("Toko berhasil dibuat!");
      }

      closeModal();
      fetchStores();
      refreshStores();
    } catch (error) {
      console.error("Error saving store:", error);
      toast.error(
        editingStore ? "Gagal memperbarui toko" : "Gagal membuat toko"
      );
    }
  };

  const confirmDelete = (store) => {
    setStoreToDelete(store);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;
    try {
      await api.stores.delete(storeToDelete.ID || storeToDelete.id);
      toast.success("Toko berhasil dihapus");
      fetchStores();
      refreshStores();
      setDeleteModalOpen(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error("Failed to delete store:", error);
      toast.error("Gagal menghapus toko");
    }
  };

  const openEditModal = (store) => {
    setEditingStore(store);
    setStoreName(store.Name || store.name);
    setSelectedMarketplaceId(store.MarketplaceID || store.marketplace_id);
    // Handle both IsActive (Pascal) and is_active (snake - if raw json)
    // Default to true if undefined
    const activeStatus =
      store.IsActive !== undefined
        ? store.IsActive
        : store.is_active !== undefined
        ? store.is_active
        : true;
    setIsActive(activeStatus);
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingStore(null);
    setStoreName("");
    setIsActive(true);
  };

  const isShopee = (id) => {
    const m = marketplaces.find((mp) => mp.id === id);
    return m && m.value.toLowerCase().includes("shopee");
  };

  return (
    <div className="flex flex-col h-full gap-8 overflow-hidden max-w-5xl mx-auto w-full px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-none pt-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="text-orange-600" /> Kelola Toko
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Atur koneksi ke marketplace Anda di sini.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium text-sm shadow-orange-500/20"
          >
            <Plus
              size={18}
              className="mr-2 group-hover:rotate-90 transition-transform"
            />
            Tambah Toko
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-orange-500" />
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Belum ada toko
            </h3>
            <p className="text-sm text-gray-500 max-w-xs mt-2">
              Mulai berjualan dengan menghubungkan toko pertama Anda sekarang.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {stores.map((store) => {
              const active =
                store.IsActive !== undefined
                  ? store.IsActive
                  : store.is_active ?? true;
              return (
                <div
                  key={store.ID || store.id}
                  className={`relative group bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-300 ${
                    active
                      ? "border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900/50"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-2xl shadow-sm ${
                        store.MarketplaceID || store.marketplace_id
                          ? "bg-white dark:bg-gray-700"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <ShopeeLogo className="w-8 h-8" />
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => openEditModal(store)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
                        title="Edit Toko"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(store)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        title="Hapus Toko"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {store.Name || store.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                        ID: {store.MarketplaceID || store.marketplace_id}
                      </span>
                      {active ? (
                        <span className="flex items-center text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md font-medium border border-green-100 dark:border-green-900/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                          Aktif
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                          Non-Aktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Modal Backdrop */}
      {(isCreating || deleteModalOpen) && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-opacity duration-300" />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl scale-100 opacity-100 transition-all duration-300 pointer-events-auto border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Toko?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Anda akan menghapus toko{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{storeToDelete?.Name || storeToDelete?.name}"
                </span>
                . Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Logic Modal */}
      {isCreating && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-700 scale-100 opacity-100 transition-all">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-full transition-colors"
            >
              <X size={18} />
            </button>

            {isLimitReached && !editingStore ? (
              <div className="text-center py-6">
                {/* Limit Reached UI */}
                <div className="bg-orange-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Batas Toko Tercapai
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Paket Starter hanya mengizinkan 1 toko. Upgrade ke Pro untuk
                  menambah lebih banyak toko.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 shadow-lg transition-all"
                >
                  Upgrade Sekarang
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingStore ? "Edit Toko" : "Tambah Toko Baru"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingStore
                      ? "Perbarui informasi toko Anda"
                      : "Hubungkan toko baru ke dashboard"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all outline-none"
                      placeholder="Contoh: Toko Sepatu Keren"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Marketplace
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          const m = marketplaces.find((mp) =>
                            mp.value.toLowerCase().includes("shopee")
                          );
                          if (m) setSelectedMarketplaceId(m.id);
                          else
                            toast.error("Marketplace Shopee belum tersedia.");
                        }}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden ${
                          isShopee(selectedMarketplaceId)
                            ? "border-orange-500 bg-orange-50/30 dark:bg-orange-900/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-gray-600"
                        }`}
                      >
                        {isShopee(selectedMarketplaceId) && (
                          <div className="absolute top-2 right-2 text-orange-500">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <ShopeeLogo className="w-10 h-10 mb-2" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Shopee
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toast(
                            "Integrasi TikTok Shop x Tokopedia segera hadir!",
                            { icon: "🚧" }
                          )
                        }
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}
                      >
                        <TikTokLogo className="w-10 h-10 mb-2 grayscale opacity-70" />
                        <span className="font-medium text-center text-gray-900 dark:text-white text-sm">
                          TikTok Shop x<br />
                          Tokopedia
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-2">
                          Segera Hadir
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                        Status Toko
                      </span>
                      <span className="text-xs text-gray-500">
                        {isActive
                          ? "Toko aktif dan muncul di dashboard"
                          : "Toko disembunyikan sementara"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isActive
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {editingStore ? "Simpan Perubahan" : "Simpan Toko"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
