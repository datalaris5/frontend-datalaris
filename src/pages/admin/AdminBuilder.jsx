import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Save, Plus, Layout, BarChart2, PieChart, Activity, DollarSign, ShoppingBag, Users, Trash2, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import _ from 'lodash';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Types Definition
const WIDGET_TYPES = {
  STAT_CARD: { id: 'stat_card', name: 'Stat Card', icon: Activity, w: 2, h: 2, minW: 2, minH: 2 },
  LINE_CHART: { id: 'line_chart', name: 'Line Chart', icon: BarChart2, w: 4, h: 4, minW: 3, minH: 3 },
  BAR_CHART: { id: 'bar_chart', name: 'Bar Chart', icon: BarChart2, w: 4, h: 4, minW: 3, minH: 3 },
  PIE_CHART: { id: 'pie_chart', name: 'Pie Chart', icon: PieChart, w: 3, h: 3, minW: 3, minH: 3 },
};

const AdminBuilder = () => {
  const [layouts, setLayouts] = useState({ lg: [] });
  const [widgets, setWidgets] = useState([]);
  const [counter, setCounter] = useState(0);

  // Load saved layout on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard_layout');
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      setLayouts(parsed.layouts || { lg: [] });
      setWidgets(parsed.widgets || []);
      setCounter(parsed.widgets ? parsed.widgets.length : 0);
    }
  }, []);

  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
  };

  const addWidget = (typeKey) => {
    const type = WIDGET_TYPES[typeKey];
    const newId = `widget_${counter + 1}`;
    const newWidget = {
      i: newId,
      x: (widgets.length * 2) % 12,
      y: Infinity, // puts it at the bottom
      w: type.w,
      h: type.h,
      minW: type.minW,
      minH: type.minH,
      type: typeKey,
      title: `${type.name} ${counter + 1}`
    };

    setWidgets([...widgets, newWidget]);
    setCounter(counter + 1);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.i !== id));
  };

  const saveLayout = () => {
    const dataToSave = {
      layouts,
      widgets
    };
    localStorage.setItem('dashboard_layout', JSON.stringify(dataToSave));
    toast.success('Layout dashboard berhasil disimpan!');
  };

  const resetLayout = () => {
    if (window.confirm('Reset layout ke default?')) {
      localStorage.removeItem('dashboard_layout');
      setWidgets([]);
      setLayouts({ lg: [] });
      setCounter(0);
      toast.success('Layout di-reset.');
    }
  };

  // Render Widget Content based on Type
  const renderWidgetContent = (widget) => {
    const type = WIDGET_TYPES[widget.type];
    
    switch (widget.type) {
      case 'STAT_CARD':
        return (
          <div className="h-full flex flex-col justify-center items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 mb-2">
              <type.icon size={24} />
            </div>
            <h3 className="text-gray-500 text-sm">{widget.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
          </div>
        );
      case 'LINE_CHART':
      case 'BAR_CHART':
        return (
          <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">{widget.title}</h3>
            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              [Chart Visualization Placeholder]
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            Unknown Widget
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center">
          <a href="/dashboard" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Layout className="mr-2 text-orange-600" />
              Admin Page Builder
            </h1>
            <p className="text-xs text-gray-500">Drag & drop widgets to customize the user dashboard.</p>
          </div>
        </div>
        <div className="flex gap-2">

          <button onClick={resetLayout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Reset
          </button>
          <button onClick={saveLayout} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg flex items-center shadow-sm">
            <Save size={16} className="mr-2" />
            Save Layout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Widget Library */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-10 shadow-lg">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Widget Library</h3>
          <div className="space-y-3">
            {Object.keys(WIDGET_TYPES).map((key) => {
              const type = WIDGET_TYPES[key];
              return (
                <div 
                  key={key}
                  onClick={() => addWidget(key)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3 text-gray-500 group-hover:text-orange-600 transition-colors">
                      <type.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{type.name}</p>
                      <p className="text-[10px] text-gray-400">{type.w}x{type.h} Grid Units</p>
                    </div>
                    <Plus size={16} className="ml-auto text-gray-300 group-hover:text-orange-500" />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-300">
              <strong>Tip:</strong> Drag widgets to resize or move them. Click "Save Layout" to apply changes to the user dashboard.
            </p>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-900/50 relative">
            {/* Grid Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            onLayoutChange={onLayoutChange}
            isDraggable={true}
            isResizable={true}
            margin={[16, 16]}
          >
            {widgets.map((widget) => (
              <div key={widget.i} data-grid={widget} className="group relative">
                {/* Widget Content */}
                {renderWidgetContent(widget)}
                
                {/* Delete Button (Visible on Hover) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); removeWidget(widget.i); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 z-20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </ResponsiveGridLayout>
          
          {widgets.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Layout size={48} className="mb-4 opacity-20" />
              <p>Canvas kosong. Tambahkan widget dari sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBuilder;
