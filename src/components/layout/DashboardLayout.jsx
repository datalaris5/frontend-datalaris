import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useFilter } from '../../context/FilterContext';
import ComingSoon from '../ComingSoon';
import { Outlet } from 'react-router-dom';


const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { platform } = useFilter();
  const isComingSoon = platform === 'tiktok-tokopedia';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <main className="flex-1 overflow-hidden p-6 relative">
          {isComingSoon ? <ComingSoon /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
