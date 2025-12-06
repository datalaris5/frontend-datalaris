import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, TrendingUp, ShoppingBag, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Search, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const DashboardOrders = () => {
  const [loading, setLoading] = useState(false); // For initial fetch
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    est_sales: 0,
    total_orders: 0,
    gross_profit: 0,
    gross_margin: 0,
    orders_by_day: [],
    top_products: []
  });

  // Mock data for initial render if backend is empty
  const mockData = {
    est_sales: 29200000,
    total_orders: 166,
    gross_profit: 9800000,
    gross_margin: 41.9,
    orders_by_day: [
      { date: 'Min', count: 45 },
      { date: 'Sen', count: 52 },
      { date: 'Sel', count: 38 },
      { date: 'Rab', count: 65 },
      { date: 'Kam', count: 48 },
      { date: 'Jum', count: 55 },
      { date: 'Sab', count: 60 },
    ],
    top_products: [
      { product_name: 'Copic Spidol Warna Set 72', total_sales: 2800000, quantity: 5 },
      { product_name: 'Daler Rowney System3 500ml', total_sales: 2600000, quantity: 12 },
      { product_name: 'DAS Modelling Clay 500g', total_sales: 2200000, quantity: 45 },
      { product_name: 'Canson Watercolor Pad A4', total_sales: 1100000, quantity: 20 },
      { product_name: 'Giotto Decor Wax Block', total_sales: 948400, quantity: 15 },
    ]
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/fin/v1/api/analytics/orders');
      if (response.ok) {
        const data = await response.json();
        // Use backend data if available and has content, otherwise fallback to mock for demo
        if (data.total_orders > 0) {
            setStats(data);
        } else {
            setStats(mockData);
        }
      } else {
        setStats(mockData); // Fallback on error
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setStats(mockData); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    const loadingToast = toast.loading('Mengupload data pesanan...');

    try {
      const response = await fetch('http://localhost:8080/fin/v1/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Data pesanan berhasil diupload!', { id: loadingToast });
        fetchAnalytics(); // Refresh data
      } else {
        const err = await response.json();
        toast.error(`Upload gagal: ${err.error || 'Terjadi kesalahan'}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server', { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header & Upload */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-none">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Pesanan Toko</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Analisis performa penjualan berdasarkan data pesanan.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link to="/upload" className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition-all flex items-center shadow-sm hover:shadow-md">
                <UploadCloud size={16} className="mr-2" />
                Upload Data
            </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
        <StatsCard 
          title="Est. Penjualan" 
          value={formatCurrency(stats.est_sales)} 
          trend="-5.0%" 
          trendUp={false} 
          icon={DollarSign}
          highlight={true}
          data={[40, 35, 45, 30, 25, 20, 15]}
        />
        <StatsCard 
          title="Total Pesanan" 
          value={stats.total_orders.toString()} 
          trend="-33.3%" 
          trendUp={false} 
          icon={ShoppingBag}
          data={[50, 45, 40, 35, 30, 25, 20]}
        />
        <StatsCard 
          title="Gross Profit" 
          value={formatCurrency(stats.gross_profit)} 
          trend="-15.7%" 
          trendUp={false} 
          icon={TrendingUp}
          data={[30, 25, 35, 20, 15, 10, 5]}
        />
        <StatsCard 
          title="Gross Margin" 
          value={`${stats.gross_margin}%`} 
          trend="+6.1%" 
          trendUp={true} 
          icon={ArrowUpRight}
          data={[60, 65, 70, 75, 72, 74, 76]}
        />
      </div>

      {/* Content Area - Flexible */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Left Column: Charts */}
          <div className="flex-[2] flex flex-col gap-4 min-h-0">
            {/* Main Chart */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2 flex-none">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tren Penjualan</h3>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"><Filter size={16} /></button>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.orders_by_day.length > 0 ? stats.orders_by_day : mockData.orders_by_day}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                        itemStyle={{color: '#1F2937'}}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Orders Chart */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex-none">Pesanan Harian</h3>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.orders_by_day.length > 0 ? stats.orders_by_day : mockData.orders_by_day}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} dy={5} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Top Products Table */}
          <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center flex-none">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Produk</h3>
                <a href="/orders/products" className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline">Lihat Semua &rarr;</a>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produk</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jual</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {stats.top_products.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2 text-gray-400 flex-shrink-0">
                                <ShoppingBag size={12} />
                            </div>
                            <span className="line-clamp-1" title={product.product_name}>{product.product_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 text-right">{product.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-900 dark:text-white text-right">{formatCurrency(product.total_sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, trend, trendUp, icon: Icon, highlight, data }) => {
    return (
        <div className={`p-3 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
            highlight 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent' 
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
          }`}>
            {/* Faint Background Icon for Highlighted Card */}
            {highlight && (
              <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12 pointer-events-none">
                <Icon size={100} />
              </div>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xs font-medium ${
                    highlight ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>{title}</h3>
                  <div className={`p-1.5 rounded-lg ${
                    highlight ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Icon size={14} />
                  </div>
                </div>
                <p className={`text-lg font-bold mb-2 ${
                  highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>{value}</p>
                
                <div className="flex items-end justify-between">
                  <span className={`flex items-center text-xs font-medium ${
                    highlight ? 'text-white/90' : (trendUp ? 'text-teal-500' : 'text-red-500')
                  }`}>
                    {trendUp ? '↑' : '↓'} {trend}
                  </span>
                  
                  {/* Mini Sparkline */}
                  {data && (
                      <div className="w-16 h-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.map((v, i) => ({ i, v }))}>
                            <Line 
                              type="monotone" 
                              dataKey="v" 
                              stroke={highlight ? '#ffffff' : (trendUp ? '#14b8a6' : '#ef4444')} 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                  )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOrders;
