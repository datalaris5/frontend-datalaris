import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Store, ShoppingBag, Lock, Plus, Trash2, Edit2 } from 'lucide-react';
import { ShopeeLogo, TikTokLogo } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [marketplace, setMarketplace] = useState('shopee');
  const { user } = useAuth();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await api.stores.list();
      setStores(response.data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      // Fallback for demo if backend is not ready
      if (process.env.NODE_ENV === 'development') {
        setStores([]); 
      }
    }
  };

  // Mock store count check
  const currentStoreCount = stores.length;
  const isStarter = user?.subscription === 'starter' || !user?.subscription;
  const isLimitReached = isStarter && currentStoreCount >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLimitReached) return;
    
    if (marketplace === 'tiktok') {
      toast.error('Integrasi TikTok Shop segera hadir!');
      return;
    }

    try {
      await api.stores.create({
        name: storeName,
        marketplace: marketplace,
      });

      toast.success('Toko berhasil dibuat!');
      setIsCreating(false);
      setStoreName('');
      fetchStores(); // Refresh list from backend
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Gagal membuat toko');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between flex-none">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kelola Toko</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daftar toko yang terhubung dengan akun Anda</p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-sm text-sm"
          >
            <Plus size={18} className="mr-2" />
            Tambah Toko
          </button>
        )}
      </div>

      {/* Store List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {stores.map((store) => (
            <div key={store.ID || store.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${
                  store.Marketplace === 'shopee' ? 'bg-white border border-gray-100' : 
                  store.Marketplace === 'tiktok' ? 'bg-white border border-gray-100' : 'bg-blue-100 text-blue-600'
                }`}>
                  {store.Marketplace === 'shopee' ? <ShopeeLogo className="w-6 h-6" /> : <TikTokLogo className="w-6 h-6" />}
                </div>
                <div className="flex space-x-1">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">{store.Name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-3">{store.Marketplace}</p>
              <div className="flex items-center text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                Terhubung
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Store Form / Upgrade Prompt */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-8 relative shadow-2xl">
            <button 
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>

            {isLimitReached ? (
              <div className="text-center py-6">
                <div className="bg-orange-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Batas Toko Tercapai</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Paket Starter hanya mengizinkan 1 toko. Upgrade ke Pro untuk menambah lebih banyak toko.
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tambah Toko Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Toko</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      placeholder="Contoh: Toko Sepatu Keren"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marketplace</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setMarketplace('shopee')}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                          marketplace === 'shopee' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <ShopeeLogo className="w-10 h-10 mb-2" />
                        <span className="font-medium text-gray-900 dark:text-white">Shopee</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Integrasi TikTok Shop x Tokopedia segera hadir!', { icon: '🚧' })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-700`}
                      >
                        <TikTokLogo className="w-10 h-10 mb-2" />
                        <span className="font-medium text-center text-gray-900 dark:text-white">TikTok Shop x<br/>Tokopedia</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full mt-1">Soon</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
                  >
                    Simpan Toko
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
