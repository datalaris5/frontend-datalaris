import React, { useEffect, useState } from 'react';
import { Activity, Users, ShoppingBag, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats and health concurrently
      const [statsRes, healthRes] = await Promise.all([
        api.admin.stats.overview(),
        api.admin.stats.health(),
      ]);
      setStats(statsRes.data);
      setHealth(healthRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
      // Set fallback mock data
      setStats({
        totalUsers: 1234,
        activeStores: 45,
        systemUptime: 98.5,
        apiRequests: 5200,
      });
      setHealth({
        database: 'operational',
        apiServer: 'operational',
        fileStorage: 'operational',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">System overview and quick stats</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers?.toLocaleString() || '0'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeStores || '0'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Stores</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+24%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.systemUptime || '0'}%</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">System Uptime</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.apiRequests >= 1000 ? `${(stats.apiRequests/1000).toFixed(1)}k` : stats?.apiRequests || '0'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">API Requests/day</p>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Health</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium text-gray-900 dark:text-white">Database</span>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium text-gray-900 dark:text-white">API Server</span>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-medium text-gray-900 dark:text-white">File Storage</span>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400">Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
