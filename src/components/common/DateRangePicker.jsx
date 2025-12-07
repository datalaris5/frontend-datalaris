import React, { useState, useRef, useEffect } from "react";
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
  startOfMonth as getStartOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFilter } from "../../context/FilterContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CustomCalendar = ({
  month,
  selectedRange,
  onSelectDate,
  minDate,
  maxDate,
  isStartCalendar,
}) => {
  const [currentMonth, setCurrentMonth] = useState(month);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: id });
  const endDate = endOfWeek(monthEnd, { locale: id });

  // Use id locale for day names but short format
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  useEffect(() => {
    setCurrentMonth(month);
  }, [month]);

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const isDateInRange = (date) => {
    if (!selectedRange?.from || !selectedRange?.to) return false;
    return isWithinInterval(date, {
      start: selectedRange.from,
      end: selectedRange.to,
    });
  };

  const isRangeStart = (date) =>
    selectedRange?.from && isSameDay(date, selectedRange.from);
  const isRangeEnd = (date) =>
    selectedRange?.to && isSameDay(date, selectedRange.to);
  const isToday = (date) => isSameDay(date, new Date());

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
        >
          <ChevronLeft size={14} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-1">
          {/* Month Selector */}
          <div className="relative group">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    parseInt(e.target.value),
                    1
                  )
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

          {/* Year Selector */}
          <div className="relative group">
            <select
              value={currentMonth.getFullYear()}
              onChange={(e) =>
                setCurrentMonth(
                  new Date(parseInt(e.target.value), currentMonth.getMonth(), 1)
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

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
        >
          <ChevronRight size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Week Days */}
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

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1">
        {dateRange.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const inRange = isDateInRange(date);
          const isStart = isRangeStart(date);
          const isEnd = isRangeEnd(date);
          const isTodayDate = isToday(date);
          const isDisabled =
            (minDate && date < minDate) || (maxDate && date > maxDate);

          let cellClasses =
            "h-8 w-8 flex flex-col items-center justify-center text-sm rounded-md transition-all cursor-pointer relative font-medium ";

          if (isDisabled) {
            cellClasses += "text-muted-foreground/30 cursor-not-allowed ";
          } else if (isStart || isEnd) {
            cellClasses +=
              "bg-orange-600 text-white shadow-md shadow-orange-500/30 hover:bg-orange-700 z-10 ";
          } else if (inRange) {
            cellClasses +=
              "bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 rounded-none font-medium ";
            // Add rounded corners for ends of rows for visual polish if needed, but simple is okay
          } else if (!isCurrentMonth) {
            cellClasses += "text-muted-foreground/30 ";
          } else if (isTodayDate) {
            cellClasses +=
              "text-orange-600 bg-orange-50 dark:bg-orange-900/10 font-bold border border-orange-200 dark:border-orange-800 ";
          } else {
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

const DateRangePicker = ({
  minDate = new Date(2020, 0, 1),
  maxDate = null,
  availableDateRange = null,
}) => {
  const { dateRange, setDateRange } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  const defaultMaxDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59
  );

  const effectiveMinDate = availableDateRange?.minDate || minDate;
  const effectiveMaxDate =
    availableDateRange?.maxDate || maxDate || defaultMaxDate;

  const [selectedRange, setSelectedRange] = useState({
    from: dateRange.startDate || today,
    to: dateRange.endDate || today,
  });
  const [tempLabel, setTempLabel] = useState(dateRange.label);

  useEffect(() => {
    if (isOpen) {
      setSelectedRange({
        from: dateRange.startDate,
        to: dateRange.endDate,
      });
      setTempLabel(dateRange.label);
    }
  }, [isOpen, dateRange]);

  const handleDateSelect = (date) => {
    // Logic for range selection
    // If range is complete or empty, start a new one
    if (!selectedRange?.from || (selectedRange?.from && selectedRange?.to)) {
      setSelectedRange({ from: date, to: null });
      setTempLabel("Custom");
    } else {
      // Logic for completing the range
      let finalRange;
      if (date < selectedRange.from) {
        finalRange = { from: date, to: selectedRange.from };
      } else {
        finalRange = { from: selectedRange.from, to: date };
      }

      setSelectedRange(finalRange);
      setTempLabel("Custom");

      // Auto apply when range is selected
      setDateRange({
        startDate: finalRange.from,
        endDate: finalRange.to,
        label: "Custom",
      });
      setIsOpen(false);
    }
  };

  const handlePreset = (days, label) => {
    const end = effectiveMaxDate;
    let start = new Date();

    if (label === "Bulan Ini") {
      start = getStartOfMonth(new Date());
    } else if (label === "Tahun Ini") {
      start = startOfYear(new Date());
    } else if (typeof days === "number") {
      start = subDays(end, days - 1);
    }

    // Boundary checks
    if (start < effectiveMinDate) start = effectiveMinDate;
    if (start > effectiveMaxDate) start = effectiveMaxDate;

    setDateRange({
      startDate: start,
      endDate: end,
      label: label,
    });
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return format(date, "d MMM yy", { locale: id });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="filter"
          className={cn(
            "w-[220px] sm:w-[260px] h-12 px-4 justify-between group",
            isOpen && "ring-2 ring-orange-500/20 border-orange-500/50"
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden text-left">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 transition-colors">
              <CalendarIcon size={20} />
            </div>
            <div className="flex flex-col items-start gap-0.5 overflow-hidden">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-none">
                Periode
              </span>
              <span className="text-sm font-bold truncate text-foreground/90 max-w-[170px] leading-tight">
                {dateRange.label === "Custom" &&
                selectedRange?.from &&
                selectedRange?.to
                  ? `${formatDate(selectedRange.from)} - ${formatDate(
                      selectedRange.to
                    )}`
                  : dateRange.label}
              </span>
            </div>
          </div>
          <div className="pr-3">
            <ChevronDown
              size={16}
              className={cn(
                "text-muted-foreground/50 group-hover:text-foreground transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-auto p-0 glass-card overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex flex-col md:flex-row max-h-[80vh] overflow-y-auto">
          {/* Sidebar Presets */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border/50 p-2 flex-shrink-0 bg-muted/20">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pilihan Cepat
              </div>
              {[
                { l: "Hari Ini", d: 1 },
                { l: "Kemarin", d: 2 },
                { l: "7 Hari Terakhir", d: 7 },
                { l: "30 Hari Terakhir", d: 30 },
                { l: "Bulan Ini", d: "month" },
                { l: "Tahun Ini", d: "year" },
              ].map((preset) => (
                <button
                  key={preset.l}
                  onClick={() => handlePreset(preset.d, preset.l)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-all relative overflow-hidden",
                    tempLabel === preset.l
                      ? "bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-semibold shadow-sm"
                      : "text-foreground/80 hover:bg-background hover:text-foreground hover:shadow-sm"
                  )}
                >
                  {preset.l}
                  {tempLabel === preset.l && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Area */}
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
                  month={selectedRange?.from || new Date()}
                  selectedRange={selectedRange}
                  onSelectDate={handleDateSelect}
                  minDate={effectiveMinDate}
                  maxDate={effectiveMaxDate}
                  isStartCalendar={true}
                />
              </div>
              <div>
                <CustomCalendar
                  month={
                    selectedRange?.to ||
                    addMonths(selectedRange?.from || new Date(), 1)
                  }
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
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
