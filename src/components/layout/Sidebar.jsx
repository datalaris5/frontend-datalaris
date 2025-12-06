import React from 'react';
import { LayoutDashboard, Store, UploadCloud, LogOut, ChevronLeft, ChevronRight, CreditCard, Settings, ShoppingBag } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingBag, label: 'Pesanan Toko', path: '/orders' },
    { icon: Store, label: 'Toko Saya', path: '/stores' },
    { icon: UploadCloud, label: 'Upload Data', path: '/upload' },
    { icon: CreditCard, label: 'Langganan', path: '/pricing' },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700">
        {isOpen ? (
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Datalaris
          </span>
        ) : (
          <span className="text-xl font-bold text-orange-500 mx-auto">D</span>
        )}
        
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={20} className={`${isActive ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {isOpen && <span className="ml-3 font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {useAuth().user?.role === 'admin' && (
          <Link 
            to="/admin/builder"
            className={`flex items-center w-full px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group mb-2`}
          >
            <Settings size={20} className="text-gray-400 group-hover:text-orange-500" />
            {isOpen && <span className="ml-3 font-medium text-sm">Page Builder</span>}
          </Link>
        )}
        <button 
          onClick={handleLogout}
          className={`flex items-center w-full px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group`}
        >
          <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
          {isOpen && <span className="ml-3 font-medium text-sm">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
