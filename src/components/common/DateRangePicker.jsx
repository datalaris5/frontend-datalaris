import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfWeek, endOfWeek, subDays, startOfMonth as getStartOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';

const CustomCalendar = ({ month, selectedRange, onSelectDate, minDate, maxDate, isStartCalendar }) => {
  const [currentMonth, setCurrentMonth] = useState(month);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: id });
  const endDate = endOfWeek(monthEnd, { locale: id });
  
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
  
  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  
  const isDateInRange = (date) => {
    if (!selectedRange?.from || !selectedRange?.to) return false;
    return isWithinInterval(date, { start: selectedRange.from, end: selectedRange.to });
  };
  
  const isRangeStart = (date) => selectedRange?.from && isSameDay(date, selectedRange.from);
  const isRangeEnd = (date) => selectedRange?.to && isSameDay(date, selectedRange.to);
  const isToday = (date) => isSameDay(date, new Date());
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <select
            value={currentMonth.getMonth()}
            onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
            className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {format(new Date(2000, i, 1), 'MMMM', { locale: id })}
              </option>
            ))}
          </select>
          <select
            value={currentMonth.getFullYear()}
            onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
            className="px-2 py-1 text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - 5 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {/* Week Days */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-gray-500 dark:text-gray-400 py-1.5">
            {day}
          </div>
        ))}
      </div>
      
      {/* Dates */}
      <div className="grid grid-cols-7 gap-0.5">
        {dateRange.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const inRange = isDateInRange(date);
          const isStart = isRangeStart(date);
          const isEnd = isRangeEnd(date);
          const isTodayDate = isToday(date);
          const isDisabled = (minDate && date < minDate) || (maxDate && date > maxDate);
          
          let cellClasses = "h-7 w-7 flex flex-col items-center justify-center text-xs rounded-md transition-all cursor-pointer relative ";
          
          if (isDisabled) {
            cellClasses += "text-gray-300 dark:text-gray-600 cursor-not-allowed ";
          } else if (isStart || isEnd) {
            cellClasses += "bg-orange-600 text-white font-bold hover:bg-orange-700 ";
          } else if (inRange) {
            cellClasses += "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 ";
          } else if (!isCurrentMonth) {
            cellClasses += "text-gray-300 dark:text-gray-600 ";
          } else if (isTodayDate) {
            cellClasses += "text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 ";
          } else {
            cellClasses += "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ";
          }
          
          return (
            <div
              key={i}
              onClick={() => !isDisabled && onSelectDate(date)}
              className={cellClasses}
            >
              {format(date, 'd')}
              {/* Today Indicator - Small Orange Dot */}
              {isTodayDate && !isStart && !isEnd && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-orange-600 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DateRangePicker = ({ 
  minDate = new Date(2020, 0, 1), 
  maxDate = null, // Will default to today if not provided
  availableDateRange = null // { minDate: Date, maxDate: Date } from database
}) => {
  const { dateRange, setDateRange } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use database date range if available, otherwise use props
  // Always normalize to end of day to ensure today is always selectable
  const today = new Date();
  const defaultMaxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const effectiveMinDate = availableDateRange?.minDate || minDate;
  const effectiveMaxDate = availableDateRange?.maxDate || maxDate || defaultMaxDate;
  
  const [selectedRange, setSelectedRange] = useState({
    from: dateRange.startDate,
    to: dateRange.endDate
  });
  const [tempLabel, setTempLabel] = useState(dateRange.label);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedRange({
        from: dateRange.startDate,
        to: dateRange.endDate
      });
      setTempLabel(dateRange.label);
    }
  }, [isOpen, dateRange]);

  const handleApply = () => {
    setDateRange({
      startDate: selectedRange?.from,
      endDate: selectedRange?.to,
      label: tempLabel
    });
    setIsOpen(false);
  };

  const handleDateSelect = (date) => {
    if (!selectedRange?.from || (selectedRange?.from && selectedRange?.to)) {
      // Start new range
      setSelectedRange({ from: date, to: null });
      setTempLabel('Custom');
    } else {
      // Complete range and auto-apply
      let finalRange;
      if (date < selectedRange.from) {
        finalRange = { from: date, to: selectedRange.from };
      } else {
        finalRange = { from: selectedRange.from, to: date };
      }
      
      setSelectedRange(finalRange);
      setTempLabel('Custom');
      
      // Auto-apply and close
      setDateRange({
        startDate: finalRange.from,
        endDate: finalRange.to,
        label: 'Custom'
      });
      setIsOpen(false);
    }
  };

  const handlePreset = (days, label) => {
    const end = effectiveMaxDate; // Use database max date if available
    let start = new Date();
    
    if (label === 'Bulan Ini') {
       start = getStartOfMonth(new Date());
    } else if (typeof days === 'number') {
       start = subDays(end, days - 1);
    }
    
    // Ensure start is within available range
    if (start < effectiveMinDate) start = effectiveMinDate;
    if (start > effectiveMaxDate) start = effectiveMaxDate;

    // Auto-apply preset and close
    setDateRange({
      startDate: start,
      endDate: end,
      label: label
    });
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'd MMM yyyy', { locale: id });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2 w-[260px] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <CalendarIcon size={16} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Periode</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate max-w-[170px]">
              {dateRange.label === 'Custom' && selectedRange?.from && selectedRange?.to
                ? `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`
                : dateRange.label}
            </span>
          </div>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 animate-fade-in overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Presets */}
            <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex-shrink-0">
              <div className="space-y-1">
                {[
                  { l: 'Hari Ini', d: 1 },
                  { l: 'Kemarin', d: 2 },
                  { l: '1 Minggu Terakhir', d: 7 },
                  { l: '1 Bulan Terakhir', d: 30 },
                  { l: '3 Bulan Terakhir', d: 90 },
                  { l: 'Bulan Ini', d: 'month' },
                ].map((preset) => (
                  <button
                    key={preset.l}
                    onClick={() => handlePreset(preset.d, preset.l)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      tempLabel === preset.l 
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Area */}
            <div className="p-4 bg-white dark:bg-gray-800 min-w-[540px]">
              {/* Date Display */}
              <div className="flex justify-end mb-3">
                <div className="px-2.5 py-1 border border-gray-200 dark:border-gray-600 rounded-md text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 shadow-sm flex items-center gap-2">
                  <CalendarIcon size={12} className="text-gray-400" />
                  {selectedRange?.from ? format(selectedRange.from, 'dd/MM/yyyy') : '...'} - {selectedRange?.to ? format(selectedRange.to, 'dd/MM/yyyy') : '...'}
                </div>
              </div>

              {/* Dual Calendars */}
              <div className="grid grid-cols-2 gap-5 mb-3">
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai</h3>
                  <CustomCalendar
                    month={selectedRange?.from || new Date()}
                    selectedRange={selectedRange}
                    onSelectDate={handleDateSelect}
                    minDate={effectiveMinDate}
                    maxDate={effectiveMaxDate}
                    isStartCalendar={true}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Akhir</h3>
                  <CustomCalendar
                    month={selectedRange?.to || addMonths(selectedRange?.from || new Date(), 1)}
                    selectedRange={selectedRange}
                    onSelectDate={handleDateSelect}
                    minDate={effectiveMinDate}
                    maxDate={effectiveMaxDate}
                    isStartCalendar={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
