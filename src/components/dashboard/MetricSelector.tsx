import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendIndicator } from "@/hooks/useEnhancedTrendChart";

interface MetricSelectorProps {
  value: TrendIndicator;
  onValueChange: (value: TrendIndicator) => void;
  className?: string;
}

/**
 * MetricSelector
 * --------------
 * Reusable dropdown untuk memilih indikator metrik pada chart.
 * Menggunakan style standar: width 200px, glassmorphism background.
 */
export function MetricSelector({
  value,
  onValueChange,
  className,
}: MetricSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onValueChange(val as TrendIndicator)}
    >
      <SelectTrigger
        className={`w-[200px] border border-white/10 text-foreground font-medium shadow-sm hover:bg-white/5 active:scale-[0.98] transition-all bg-black/5 dark:bg-white/5 backdrop-blur-md hover:text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 data-[state=open]:bg-white/10 rounded-xl ${className}`}
      >
        <SelectValue placeholder="Pilih Indikator" />
      </SelectTrigger>
      <SelectContent className="glass-card border-white/10 backdrop-blur-xl">
        <SelectItem
          value="sales"
          className="focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          Penjualan
        </SelectItem>
        <SelectItem
          value="orders"
          className="focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          Pesanan
        </SelectItem>
        <SelectItem
          value="visitors"
          className="focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          Pengunjung
        </SelectItem>
        <SelectItem
          value="conversionRate"
          className="focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          Conversion Rate
        </SelectItem>
        <SelectItem
          value="basketSize"
          className="focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          Basket Size
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
