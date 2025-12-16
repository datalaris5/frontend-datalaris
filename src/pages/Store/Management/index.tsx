/**
 * Store Management
 * ----------------
 * Halaman manajemen toko marketplace.
 *
 * Fitur:
 * - Daftar toko yang terhubung
 * - Tambah toko baru (Dialog modal)
 * - Edit toko existing
 * - Hapus toko
 *
 * Platform didukung: Shopee, TikTok, Tokopedia
 * Limit: Free plan = 1 toko, Pro = unlimited
 */

import React, { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { Store, Plus, Trash2, Edit2, ShoppingBag } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useFilter } from "@/context/FilterContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Tipe untuk store data
interface StoreData {
  id: string | number;
  name: string;
  platform: string;
  shop_id?: string;
  access_token?: string;
  status?: string;
  last_sync?: string;
}

// Tipe untuk form data
interface StoreFormData {
  name: string;
  platform: string;
  shop_id: string;
  access_token: string;
}

// Tipe untuk platform config
interface PlatformConfig {
  label: string;
  badgeColor: string;
  iconBg: string;
  iconText: string;
}

const StoreManagement: React.FC = () => {
  const { user } = useAuth();
  const { setStore: setGlobalStore } = useFilter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);

  // Form State
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    platform: "shopee",
    shop_id: "",
    access_token: "",
  });

  /**
   * Fetch daftar toko dari API
   */
  const fetchStores = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await api.store.getAll();
      setStores(response || []);
    } catch (error) {
      console.error("Failed to fetch stores", error);
      toast.error("Gagal memuat data toko.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  /**
   * Buka modal untuk tambah/edit toko
   */
  const handleOpenModal = (store: StoreData | null = null): void => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        platform: store.platform,
        shop_id: store.shop_id || "",
        access_token: store.access_token || "",
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: "",
        platform: "shopee",
        shop_id: "",
        access_token: "",
      });
    }
    setIsModalOpen(true);
  };

  /**
   * Tutup modal
   */
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  /**
   * Submit form (create/update toko)
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.name || !formData.platform) {
      toast.error("Nama toko dan platform wajib diisi");
      return;
    }

    const isPro = user?.subscription === "pro";
    if (!isPro && stores.length >= 1 && !editingStore) {
      toast.error(
        "Plan Gratis hanya bisa menghubungkan 1 toko. Upgrade ke Pro untuk unlimited toko!"
      );
      return;
    }

    try {
      if (editingStore) {
        await api.store.update(editingStore.id, formData);
        toast.success("Toko berhasil diperbarui!");
      } else {
        await api.store.create(formData);
        toast.success("Toko berhasil ditambahkan!");
      }

      await fetchStores();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan toko.");
    }
  };

  /**
   * Hapus toko
   */
  const handleDelete = async (id: string | number): Promise<void> => {
    if (window.confirm("Apakah Anda yakin ingin menghapus toko ini?")) {
      try {
        await api.store.delete(id);
        await fetchStores();
        toast.success("Toko berhasil dihapus.");
      } catch (error) {
        toast.error("Gagal menghapus toko.");
      }
    }
  };

  /**
   * Get konfigurasi visual per platform
   */
  const getPlatformConfig = (platform: string): PlatformConfig => {
    switch (platform) {
      case "shopee":
        return {
          label: "Shopee",
          badgeColor: "bg-orange-500 text-white",
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
          iconText: "text-orange-600 dark:text-orange-400",
        };
      case "tiktok":
        return {
          label: "TikTok",
          badgeColor: "bg-black text-white dark:bg-white dark:text-black",
          iconBg: "bg-gray-100 dark:bg-gray-800",
          iconText: "text-gray-900 dark:text-gray-100",
        };
      case "tokopedia":
        return {
          label: "Tokopedia",
          badgeColor: "bg-green-600 text-white",
          iconBg: "bg-green-50 dark:bg-green-900/30",
          iconText: "text-green-600 dark:text-green-400",
        };
      default:
        return {
          label: platform,
          badgeColor: "bg-gray-500 text-white",
          iconBg: "bg-gray-100",
          iconText: "text-gray-600",
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Manajemen Toko
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola koneksi toko marketplace Anda di sini.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 font-bold rounded-xl"
        >
          <Plus size={18} className="mr-2" /> Tambah Toko
        </Button>
      </div>

      {/* Store List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty State */}
        {stores.length === 0 && !loading && (
          <button
            onClick={() => handleOpenModal()}
            className="col-span-full group relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-300"
          >
            <div className="p-4 rounded-full bg-muted group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors mb-4">
              <Store
                size={32}
                className="text-muted-foreground group-hover:text-orange-600"
              />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Belum ada toko terhubung
            </h3>
            <p className="text-sm text-muted-foreground">
              Klik untuk menghubungkan toko pertama Anda
            </p>
          </button>
        )}

        {/* Store Cards */}
        {stores.map((store) => {
          const config = getPlatformConfig(store.platform);
          return (
            <Card
              key={store.id}
              className="relative overflow-hidden glass-card hover:shadow-xl transition-all duration-300 group border-border/50"
            >
              {/* Platform Badge */}
              <div
                className={`absolute top-0 right-0 px-3 py-1.5 text-xs font-bold rounded-bl-2xl ${config.badgeColor} z-10`}
              >
                {config.label}
              </div>

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${config.iconBg} ${config.iconText}`}
                  >
                    {store.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">
                      {store.name}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="w-2 h-2 rounded-full mr-2 bg-green-500"></span>
                      Aktif
                    </div>
                  </div>
                </div>

                {/* Info Rows */}
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shop ID</span>
                    <code className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                      {store.shop_id || "-"}
                    </code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span className="text-foreground">
                      {store.last_sync
                        ? new Date(store.last_sync).toLocaleDateString()
                        : "Belum pernah"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="secondary"
                    className="flex-1 font-bold"
                    onClick={() => handleOpenModal(store)}
                  >
                    <Edit2 size={14} className="mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleDelete(store.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "Edit Toko" : "Hubungkan Toko Baru"}
            </DialogTitle>
            <DialogDescription>
              Masukkan detail otentikasi toko marketplace Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label>Platform Marketplace</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["shopee", "tiktok", "tokopedia"] as const).map((p) => {
                  const isActive = formData.platform === p;
                  const config = getPlatformConfig(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: p })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                        isActive
                          ? "border-orange-500 bg-orange-50/50 text-orange-700 dark:text-orange-400"
                          : "border-muted hover:border-orange-200 hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <ShoppingBag
                        size={20}
                        className={`mb-1 ${isActive ? "text-orange-500" : ""}`}
                      />
                      <span className="text-xs font-bold capitalize">
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Toko</Label>
              <Input
                id="name"
                placeholder="Contoh: Toko Sepatu Jaya"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Shop ID */}
            <div className="space-y-2">
              <Label htmlFor="shop_id">Shop ID (Opsional)</Label>
              <Input
                id="shop_id"
                placeholder="ID Toko dari Marketplace"
                value={formData.shop_id}
                onChange={(e) =>
                  setFormData({ ...formData, shop_id: e.target.value })
                }
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="font-bold"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                {editingStore ? "Simpan Perubahan" : "Hubungkan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManagement;
