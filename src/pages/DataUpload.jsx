import React, { useState } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileSpreadsheet, CheckCircle, Loader2, TrendingUp, MessageCircle, Megaphone } from 'lucide-react';

import { useFilter } from '../context/FilterContext';
import { ShopeeLogo, TikTokLogo } from '../components/Icons';

const DataUpload = () => {
  const { store, platform } = useFilter(); // Platform sudah dari Header!
  const [activeTab, setActiveTab] = useState('overview');
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus(null);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    // Cek platform harus Shopee
    if (platform !== 'shopee') {
      toast.error('Saat ini hanya support upload untuk Shopee');
      return;
    }
    
    setUploading(true);
    const loadingToast = toast.loading('Mengupload data...');

    const formData = new FormData();
    formData.append('file', file);
    
    if (store !== 'all') {
        formData.append('store_id', store);
    } else {
        toast.error('Silakan pilih toko terlebih dahulu di bagian atas halaman', { id: loadingToast });
        setUploading(false);
        return;
    }

    try {
      // Gunakan centralized API service
      await api.upload.send(platform, activeTab, formData);

      setUploadStatus('success');
      toast.success('Data berhasil diupload!', { id: loadingToast });
      setTimeout(() => {
        setFile(null);
        setUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      const errMsg = error.response?.data?.error || 'Terjadi kesalahan saat upload';
      toast.error(`Upload gagal: ${errMsg}`, { id: loadingToast });
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const dataTypes = {
    shopee: [
      { id: 'overview', label: 'Shopee Tinjauan', icon: TrendingUp, color: 'blue', desc: 'Ringkasan harian performa toko' },
      { id: 'orders', label: 'Shopee Pesanan', icon: FileSpreadsheet, color: 'orange', desc: 'Detail pesanan per item' },
      { id: 'ads', label: 'Shopee Iklan', icon: Megaphone, color: 'purple', desc: 'Data performa iklan Shopee' },
      { id: 'chat', label: 'Shopee Chat', icon: MessageCircle, color: 'green', desc: 'Data customer service chat' }
    ]
  };

  // Get platform name for display
  const platformNames = {
    'shopee': 'Shopee',
    'tiktok-tokopedia': 'TikTok & Tokopedia',
    'all': 'Semua Platform'
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-none">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pusat Upload Data</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Platform: <span className="font-medium text-gray-700 dark:text-gray-300">{platformNames[platform]}</span>
            {platform !== 'shopee' && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">Coming Soon</span>
            )}
          </p>
        </div>
      </div>

      {/* Warning: No Store Selected */}
      {store === 'all' && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-orange-500 p-4 rounded-xl flex-none">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">
                Pilih Toko Terlebih Dahulu
              </h3>
              <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                Silakan pilih toko dari dropdown di pojok kanan atas sebelum mengupload data. 
                Data akan disimpan berdasarkan toko yang Anda pilih.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Type Selection (hanya show kalau Shopee) */}
      {platform === 'shopee' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-none">
          {dataTypes.shopee.map((type) => {
            const Icon = type.icon;
            const isActive = activeTab === type.id;
            const colorClasses = {
              blue: {
                active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500',
                inactive: 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700',
                iconActive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                textActive: 'text-orange-700 dark:text-orange-400'
              },
              orange: {
                active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500',
                inactive: 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700',
                iconActive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                textActive: 'text-orange-700 dark:text-orange-400'
              },
              purple: {
                active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500',
                inactive: 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700',
                iconActive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                textActive: 'text-orange-700 dark:text-orange-400'
              },
              green: {
                active: 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500',
                inactive: 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700',
                iconActive: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                textActive: 'text-green-700 dark:text-green-400'
              }
            };

            const colors = colorClasses[type.color];

            return (
              <button
                key={type.id}
                onClick={() => { setActiveTab(type.id); setFile(null); setUploadStatus(null); }}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  isActive ? colors.active : `${colors.inactive} bg-white dark:bg-gray-800`
                }`}
              >
                <div className="flex items-center mb-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? colors.iconActive : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <h3 className={`font-bold text-xs mb-1 ${isActive ? colors.textActive : 'text-gray-700 dark:text-gray-300'}`}>
                  {type.label}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  {type.desc}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Upload Area */}
      <div className="flex-1 min-h-0 flex flex-col gap-6">
        <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center flex-1 min-h-0 ${
            store === 'all' 
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                : dragActive 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-600 bg-white dark:bg-gray-800 hover:shadow-md'
            }`}
            onDragEnter={store !== 'all' ? handleDrag : null}
            onDragLeave={store !== 'all' ? handleDrag : null}
            onDragOver={store !== 'all' ? handleDrag : null}
            onDrop={store !== 'all' ? handleDrop : null}
        >
            <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".xlsx,.xls,.csv"
            disabled={uploading || store === 'all'}
            />
            
            <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`p-3 rounded-full transition-colors ${
                uploadStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                file ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}>
                {uploadStatus === 'success' ? <CheckCircle size={28} /> :
                file ? <FileSpreadsheet size={28} /> : <UploadCloud size={28} />}
            </div>
            
            <div>
                {uploadStatus === 'success' ? (
                <div className="text-green-600 dark:text-green-400 font-medium text-lg">Upload Berhasil!</div>
                ) : file ? (
                <>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                </>
                ) : (
                <>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                    Drag & drop file Excel di sini, atau <span className="text-orange-600 dark:text-orange-400">pilih file</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mendukung format .xlsx, .xls, .csv (Maks. 10MB)
                    </p>
                </>
                )}
            </div>
            </div>
        </div>

        {file && !uploadStatus && (
            <div className="flex justify-end flex-none">
            <button
                onClick={handleUpload}
                disabled={uploading || store === 'all'}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center ${
                uploading || store === 'all'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 hover:scale-[1.02] shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30'
                }`}
            >
                {uploading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                {uploading ? 'Memproses...' : 'Proses Data'}
            </button>
            </div>
        )}

        {/* Upload History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Riwayat Upload</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">30 hari terakhir</span>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {[
              { name: 'Shopee_Tinjauan_Nov_2024.xlsx', date: '29 Nov 2024, 10:30', status: 'success', type: 'overview' },
              { name: 'Shopee_Pesanan_Nov_2024.xlsx', date: '28 Nov 2024, 14:15', status: 'success', type: 'orders' },
              { name: 'Shopee_Iklan_Nov_2024.xlsx', date: '27 Nov 2024, 09:45', status: 'success', type: 'ads' },
            ].map((item, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    item.status === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  }`}>
                    <FileSpreadsheet size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Diupload pada {item.date}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                  item.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {item.status === 'success' ? 'Berhasil' : 'Gagal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
