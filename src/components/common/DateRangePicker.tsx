/**
 * DateRangePicker
 * ---------------
 * Komponen pemilih rentang tanggal dengan dual calendar.
 * Terintegrasi dengan FilterContext untuk state management global.
 *
 * Fitur:
 * - Dual calendar untuk mempermudah pemilihan range yang panjang
 * - Preset cepat (Hari Ini, 7 Hari Terakhir, 30 Hari Terakhir, dll)
 * - Selector bulan dan tahun untuk navigasi cepat
 * - Styling Glass iOS dengan animasi smooth
 */

import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  subDays,
  startOfYear,
  isAfter,
  isBefore,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFilter } from "@/context/FilterContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tipe untuk range tanggal yang dipilih
interface DateRange {
  from: Date | null;
  to: Date | null;
}

// Props untuk komponen kalender internal
interface CustomCalendarProps {
  month: Date;
  selectedRange: DateRange;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
  isStartCalendar: boolean;
  showNavigation?: boolean;
}

/**
 * Komponen kalender satu bulan
 * Menampilkan grid tanggal dengan highlighting untuk range
 */
const CustomCalendar: React.FC<CustomCalendarProps> = ({
  month,
  selectedRange,
  onSelectDate,
  onMonthChange,
  minDate,
  maxDate,
  isStartCalendar,
  showNavigation = true,
}) => {
  // Hitung tanggal awal dan akhir yang perlu ditampilkan
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const startDate = startOfWeek(monthStart, { locale: id });
  const endDate = endOfWeek(monthEnd, { locale: id });

  // Label hari dalam bahasa Indonesia (singkat)
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Handler navigasi bulan (memanggil parent)
  const handlePrevMonth = () => onMonthChange(subMonths(month, 1));
  const handleNextMonth = () => onMonthChange(addMonths(month, 1));

  // Helper functions untuk cek status tanggal
  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange?.from || !selectedRange?.to) return false;
    return isWithinInterval(date, {
      start: selectedRange.from,
      end: selectedRange.to,
    });
  };

  const isRangeStart = (date: Date): boolean =>
    !!selectedRange?.from && isSameDay(date, selectedRange.from);
  const isRangeEnd = (date: Date): boolean =>
    !!selectedRange?.to && isSameDay(date, selectedRange.to);
  const isTodayDate = (date: Date): boolean => isSameDay(date, new Date());

  return (
    <div className="w-full">
      {/* Header dengan navigasi bulan/tahun */}
      <div className="flex items-center justify-between mb-4 h-8">
        {showNavigation ? (
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
          >
            <ChevronLeft size={14} className="text-muted-foreground" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <div className="flex items-center gap-1">
          {/* Selector Bulan */}
          <div className="relative group">
            <select
              value={month.getMonth()}
              onChange={(e) =>
                onMonthChange(
                  new Date(month.getFullYear(), parseInt(e.target.value), 1)
                )
              }
              className="appearance-none bg-transparent hover:bg-muted font-semibold text-sm py-1 pl-2 pr-6 rounded-md cursor-pointer focus:outline-none text-foreground transition-colors z-10 relative"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>
                  {format(new Date(2000, i, 1), "MMMM", { locale: id })}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>

          {/* Selector Tahun */}
          <div className="relative group">
            <select
              value={month.getFullYear()}
              onChange={(e) =>
                onMonthChange(
                  new Date(parseInt(e.target.value), month.getMonth(), 1)
                )
              }
              className="appearance-none bg-transparent hover:bg-muted font-semibold text-sm py-1 pl-2 pr-6 rounded-md cursor-pointer focus:outline-none text-foreground transition-colors z-10 relative"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        {showNavigation ? (
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
          >
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Label hari */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid tanggal */}
      <div className="grid grid-cols-7 gap-1">
        {dateRange.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, month);
          const inRange = isDateInRange(date);
          const isStart = isRangeStart(date);
          const isEnd = isRangeEnd(date);
          const isDateToday = isTodayDate(date);
          const isDisabled =
            (minDate && date < minDate) || (maxDate && date > maxDate);

          // Build class names berdasarkan state
          let cellClasses =
            "h-8 w-8 flex flex-col items-center justify-center text-sm rounded-md transition-all cursor-pointer relative font-medium ";

          if (isDisabled) {
            cellClasses += "text-muted-foreground/50 cursor-not-allowed ";
          } else if (isStart || isEnd) {
            // Tanggal awal/akhir range - highlight orange
            cellClasses +=
              "bg-primary text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90 z-10 ";
          } else if (inRange) {
            // Dalam range - background subtle
            cellClasses +=
              "bg-primary/10 dark:bg-primary/20 text-primary rounded-none font-medium ";
          } else if (!isCurrentMonth) {
            // Di luar bulan aktif - subtle
            cellClasses += "text-muted-foreground/50 ";
          } else if (isDateToday) {
            // Hari ini - border highlight
            cellClasses +=
              "text-primary bg-primary/5 dark:bg-primary/10 font-bold border border-primary/20 dark:border-primary/20 ";
          } else {
            // Normal state
            cellClasses += "text-foreground hover:bg-muted ";
          }

          return (
            <div
              key={i}
              onClick={() => !isDisabled && onSelectDate(date)}
              className={cellClasses}
            >
              {format(date, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Props untuk komponen DateRangePicker utama
interface DateRangePickerProps {
  minDate?: Date;
  maxDate?: Date | null;
  availableDateRange?: {
    minDate?: Date;
    maxDate?: Date;
  } | null;
}

/**
 * Komponen DateRangePicker utama
 * Menampilkan button trigger dan popover dengan dual calendar
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  minDate = new Date(2020, 0, 1),
  maxDate = null,
  availableDateRange = null,
}) => {
  const { dateRange, setDateRange } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();

  // State navigasi kalender
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const defaultMaxDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  // Tentukan batas tanggal yang efektif
  const effectiveMinDate = availableDateRange?.minDate || minDate;
  const effectiveMaxDate =
    availableDateRange?.maxDate || maxDate || defaultMaxDate;

  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: dateRange.startDate || today,
    to: dateRange.endDate || today,
  });
  const [tempLabel, setTempLabel] = useState(dateRange.label);

  // Sinkronkan state saat popover dibuka
  useEffect(() => {
    if (isOpen) {
      setSelectedRange({
        from: dateRange.startDate,
        to: dateRange.endDate,
      });
      setTempLabel(dateRange.label);
    }
  }, [isOpen, dateRange]);

  /**
   * Handler pemilihan tanggal
   * Logika: jika belum ada range atau range sudah lengkap, mulai baru
   */
  const handleDateSelect = (date: Date): void => {
    if (!selectedRange?.from || (selectedRange?.from && selectedRange?.to)) {
      // Mulai range baru
      setSelectedRange({ from: date, to: null });
      setTempLabel("Custom");
    } else {
      // Lengkapi range
      let finalRange: DateRange;
      if (date < selectedRange.from) {
        finalRange = { from: date, to: selectedRange.from };
      } else {
        finalRange = { from: selectedRange.from, to: date };
      }

      setSelectedRange(finalRange);
      setTempLabel("Custom");

      // Auto-apply saat range selesai dipilih
      if (finalRange.from && finalRange.to) {
        setDateRange({
          startDate: finalRange.from,
          endDate: finalRange.to,
          label: "Custom",
        });
        setIsOpen(false);
      }
    }
  };

  /**
   * Handler untuk preset cepat
   * Menghitung tanggal berdasarkan preset dan langsung apply
   */
  const handlePreset = (days: number | string, label: string): void => {
    let end = effectiveMaxDate;
    let start = new Date();

    if (label === "Bulan Ini") {
      start = startOfMonth(new Date());
    } else if (label === "Bulan Lalu") {
      const lastMonth = subMonths(new Date(), 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth); // Override end date for this case
    } else if (label === "Tahun Ini") {
      start = startOfYear(new Date());
    } else if (typeof days === "number") {
      start = subDays(end, days - 1);
    }

    // Pastikan tidak melebihi batas
    if (start < effectiveMinDate) start = effectiveMinDate;
    if (start > effectiveMaxDate) start = effectiveMaxDate;

    setDateRange({
      startDate: start,
      endDate: end,
      label: label,
    });
    setIsOpen(false);
  };

  // Format tanggal untuk display
  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "d MMM yy", { locale: id });
  };

  // Konfigurasi preset
  const presets = [
    { l: "Hari Ini", d: 1 },
    { l: "Kemarin", d: 2 },
    { l: "7 Hari Terakhir", d: 7 },
    { l: "30 Hari Terakhir", d: 30 },
    { l: "Bulan Ini", d: "month" },
    { l: "Bulan Lalu", d: "last_month" },
    { l: "Tahun Ini", d: "year" },
  ] as const;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="ghost" // Use ghost to avoid conflicting background/borders
          className={cn(
            "w-auto h-10 px-3 justify-between group gap-3 min-w-[200px] glass-card border-white/10 text-foreground shadow-sm hover:bg-white/5 active:scale-[0.98] transition-all bg-background/20 backdrop-blur-md hover:text-foreground rounded-xl",
            isOpen && "ring-2 ring-primary/20 border-primary/50 bg-white/10"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden text-left">
            <CalendarIcon size={16} className="text-primary" />
            <span className="text-sm font-semibold truncate text-foreground/90 leading-tight">
              {dateRange.label === "Custom" &&
              selectedRange?.from &&
              selectedRange?.to
                ? `${formatDate(selectedRange.from)} - ${formatDate(
                    selectedRange.to
                  )}`
                : dateRange.label}
            </span>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground/50 group-hover:text-foreground transition-transform duration-300 ml-1",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      {/* Popover Content */}
      <PopoverContent
        align="end"
        className="w-auto p-0 glass-card border-white/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl shadow-2xl"
      >
        <div className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">
          {/* Sidebar Preset */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border/50 p-2 flex-shrink-0 bg-muted/20">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pilihan Cepat
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.l}
                  onClick={() => handlePreset(preset.d, preset.l)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all relative overflow-hidden",
                    tempLabel === preset.l
                      ? "bg-primary/10 text-primary dark:bg-primary/20 font-semibold shadow-sm"
                      : "text-foreground/80 hover:bg-background hover:text-foreground hover:shadow-sm"
                  )}
                >
                  {preset.l}
                  {tempLabel === preset.l && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Area Kalender */}
          <div className="p-4 min-w-[580px]">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Pilih Rentang Tanggal
              </span>
              <div className="px-3 py-1.5 rounded-lg bg-muted text-xs font-mono font-medium text-foreground border border-border">
                {selectedRange?.from
                  ? format(selectedRange.from, "dd MMM yyyy", { locale: id })
                  : "..."}
                <span className="mx-2 text-muted-foreground">→</span>
                {selectedRange?.to
                  ? format(selectedRange.to, "dd MMM yyyy", { locale: id })
                  : "..."}
              </div>
            </div>

            {/* Dual Calendars */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <CustomCalendar
                  month={currentMonth}
                  selectedRange={selectedRange}
                  onSelectDate={handleDateSelect}
                  onMonthChange={setCurrentMonth}
                  minDate={effectiveMinDate}
                  maxDate={effectiveMaxDate}
                  isStartCalendar={true}
                  showNavigation={true}
                />
              </div>
              <div>
                <CustomCalendar
                  month={addMonths(currentMonth, 1)}
                  selectedRange={selectedRange}
                  onSelectDate={handleDateSelect}
                  onMonthChange={(date) => setCurrentMonth(subMonths(date, 1))}
                  minDate={effectiveMinDate}
                  maxDate={effectiveMaxDate}
                  isStartCalendar={false}
                  showNavigation={false}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
