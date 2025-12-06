import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, LabelList 
} from 'recharts';
import { TrendingUp, TrendingDown, UploadCloud, DollarSign, ShoppingBag, MousePointer, Users, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  // Data for Main Chart (Tren Penjualan)
  const salesData = [
    { name: 'Jan', value: 44.1 },
    { name: 'Feb', value: 56.3 },
    { name: 'Mar', value: 39.7 },
    { name: 'Apr', value: 72.8 },
    { name: 'Mei', value: 136.9 },
    { name: 'Jun', value: 261.8 },
    { name: 'Jul', value: 365.1 },
    { name: 'Agu', value: 24.5 },
    { name: 'Sep', value: 23.6 },
    { name: 'Okt', value: 26.3 },
    { name: 'Nov', value: 14.3 },
    { name: 'Des', value: null }, // Placeholder for future
  ];

  // Data for Bottom Left Chart (Total Pesanan by Day)
  const dailyOrdersData = [
    { name: 'Min', value: 60 },
    { name: 'Sen', value: 68 },
    { name: 'Sel', value: 97 },
    { name: 'Rab', value: 93 },
    { name: 'Kam', value: 74 },
    { name: 'Jum', value: 72 },
    { name: 'Sab', value: 65 },
  ];

  // Data for Bottom Right Chart (YoY Growth)
  const yoyData = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 100 },
    { name: 'Mar', value: 100 },
    { name: 'Apr', value: 100 },
    { name: 'Mei', value: 100 },
    { name: 'Jun', value: 100 },
    { name: 'Jul', value: 8083 },
    { name: 'Agu', value: -31 },
    { name: 'Sep', value: -4 },
    { name: 'Okt', value: 11 },
    { name: 'Nov', value: 276 },
    { name: 'Des', value: -100 },
  ];

  // Metric Cards Data
  const metrics = [
    { title: 'Total Penjualan', value: 'Rp40,5 jt', trend: '-89.5%', trendUp: false, data: [40, 35, 45, 30, 25, 20, 15], icon: DollarSign, highlight: true },
    { title: 'Total Pesanan', value: '529', trend: '-93.0%', trendUp: false, data: [50, 45, 40, 35, 30, 25, 20], icon: ShoppingBag },
    { title: 'Convertion Rate', value: '0', trend: '-2.5%', trendUp: false, data: [2, 2.1, 1.9, 1.5, 1.2, 0.8, 0], icon: MousePointer },
    { title: 'Basket Size', value: 'Rp76,6 rb', trend: '+50.1%', trendUp: true, data: [60, 65, 70, 75, 72, 74, 76], icon: ShoppingBag },
    { title: 'Total Pengunjung', value: '8,6 rb', trend: '-92.9%', trendUp: false, data: [90, 85, 80, 70, 60, 50, 40], icon: Users },
    { title: 'Total Pembeli Baru', value: '413', trend: '-94.1%', trendUp: false, data: [45, 40, 35, 30, 25, 20, 15], icon: UserPlus },
  ];

  // Custom Label for Line Chart
  const CustomLabel = (props) => {
    const { x, y, value } = props;
    if (value === null) return null;
    return (
      <text x={x} y={y} dy={-10} fill="#666" fontSize={10} textAnchor="middle">
        Rp{value} jt
      </text>
    );
  };

  // Custom Label for Bar Chart
  const BarLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y} dy={-5} fill="#666" fontSize={10} textAnchor="middle">
        {value}
      </text>
    );
  };

  // Custom Label for YoY Chart
  const YoYLabel = (props) => {
    const { x, y, width, value } = props;
    const isPositive = value >= 0;
    return (
      <text x={x + width / 2} y={isPositive ? y - 5 : y + 15} fill="#666" fontSize={10} textAnchor="middle">
        {value}%
      </text>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      <div className="flex items-center justify-between flex-none">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Tinjauan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan performa toko Anda</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/upload" className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition-all flex items-center shadow-sm hover:shadow-md">
            <UploadCloud size={16} className="mr-2" />
            Upload Data
          </Link>
        </div>
      </div>

      {/* Metric Cards Row - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 flex-none">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-3 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden ${
            metric.highlight 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent' 
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
          }`}>
            {/* Faint Background Icon for Highlighted Card */}
            {metric.highlight && (
              <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12 pointer-events-none">
                <metric.icon size={80} />
              </div>
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-[10px] uppercase tracking-wider font-semibold ${
                  metric.highlight ? 'text-orange-100' : 'text-gray-500 dark:text-gray-400'
                }`}>{metric.title}</h3>
                <div className={`p-1 rounded-md ${
                  metric.highlight ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <metric.icon size={12} />
                </div>
              </div>
              <p className={`text-lg font-bold mb-1 ${
                metric.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>{metric.value}</p>
              
              <div className="flex items-end justify-between">
                <span className={`flex items-center text-[10px] font-medium ${
                  metric.highlight ? 'text-white/90' : (metric.trendUp ? 'text-teal-500' : 'text-red-500')
                }`}>
                  {metric.trendUp ? '↑' : '↓'} {metric.trend}
                </span>
                
                {/* Mini Sparkline */}
                <div className="w-12 h-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.data.map((v, i) => ({ i, v }))}>
                      <Line 
                        type="monotone" 
                        dataKey="v" 
                        stroke={metric.highlight ? '#ffffff' : (metric.trendUp ? '#14b8a6' : '#ef4444')} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Area - Flexible */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Tren Penjualan</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={5} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList content={<CustomLabel />} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Charts Column */}
        <div className="flex flex-col gap-4">
          {/* Total Pesanan (Daily) */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Total Pesanan</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyOrdersData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={5} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30}>
                     <LabelList content={<BarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* YoY Growth */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">YoY Growth</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} dy={5} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#f97316" radius={[2, 2, 0, 0]}>
                    <LabelList content={<YoYLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
