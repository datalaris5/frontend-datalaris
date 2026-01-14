import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MetricOption = {
  value: string;
  label: string;
};

interface MetricSelectorProps {
  value: string;
  onValueChange: (value: any) => void;
  className?: string;
  options?: MetricOption[];
}

const defaultOptions: MetricOption[] = [
  { value: "sales", label: "Penjualan" },
  { value: "orders", label: "Pesanan" },
  { value: "visitors", label: "Pengunjung" },
  { value: "conversionRate", label: "Conversion Rate" },
  { value: "basketSize", label: "Basket Size" },
];

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
  options = defaultOptions,
}: MetricSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-[200px] border border-white/10 text-foreground font-medium shadow-sm hover:bg-white/5 active:scale-[0.98] transition-all bg-black/5 dark:bg-white/5 backdrop-blur-md hover:text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 data-[state=open]:bg-white/10 rounded-xl ${className}`}
      >
        <SelectValue placeholder="Pilih Indikator" />
      </SelectTrigger>
      <SelectContent className="glass-card border-white/10 backdrop-blur-xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="focus:bg-primary/10 focus:text-primary cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
