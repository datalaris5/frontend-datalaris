import React, { useState } from "react";
import { Store, Plus, Search, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FeatureNotReady from "../../components/common/FeatureNotReady";

const StoreManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const stores = [
    {
      id: 1,
      name: "Main Store",
      platform: "Shopee",
      owner: "John Doe",
      revenue: "Rp 125,000,000",
      status: "Active",
    },
    {
      id: 2,
      name: "Fashion Outlet",
      platform: "Tokopedia",
      owner: "Jane Smith",
      revenue: "Rp 89,500,000",
      status: "Active",
    },
    {
      id: 3,
      name: "Electronics Hub",
      platform: "TikTok Shop",
      owner: "Bob Wilson",
      revenue: "Rp 202,000,000",
      status: "Active",
    },
  ];

  const handleCreateStore = () => {
    toast.success("Store creation coming soon");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Store Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage stores and assign users
          </p>
        </div>
        <button
          onClick={handleCreateStore}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create Store
        </button>
      </div>

      <FeatureNotReady
        message="Manajemen Toko (Admin) Menggunakan Data Dummy"
        overlay={true}
      >
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  {store.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {store.name}
              </h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Platform
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {store.platform}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Owner
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {store.owner}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Revenue
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {store.revenue}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <Edit size={14} className="inline mr-1" />
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </FeatureNotReady>
    </div>
  );
};

export default StoreManagement;
