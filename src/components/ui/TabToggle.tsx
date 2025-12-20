/**
 * TabToggle
 * ---------
 * Komponen reusable untuk toggle/tab buttons.
 * Digunakan di Dashboard untuk switch data (Penjualan/Pesanan/Basket Size)
 * dan periode (Bulanan/Kuartal).
 */

import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export interface TabToggleProps<T extends string> {
  items: TabItem<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

/**
 * TabToggle - Reusable toggle component
 *
 * @example
 * <TabToggle
 *   items={[
 *     { value: "sales", label: "Penjualan" },
 *     { value: "orders", label: "Pesanan" },
 *   ]}
 *   activeValue={activeTab}
 *   onChange={setActiveTab}
 *   variant="primary"
 * />
 */
function TabToggle<T extends string>({
  items,
  activeValue,
  onChange,
  variant = "primary",
  size = "sm",
  className,
}: TabToggleProps<T>) {
  // Style variants
  const activeStyles = {
    primary:
      "bg-primary/20 text-primary font-medium border border-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.3)] backdrop-blur-md",
    secondary: "bg-secondary text-secondary-foreground shadow-sm",
  };

  const inactiveStyles =
    "text-muted-foreground hover:text-foreground hover:bg-white/5";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 border border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md p-1 rounded-xl",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "font-semibold rounded-lg transition-all",
            sizeStyles[size],
            activeValue === item.value ? activeStyles[variant] : inactiveStyles
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default TabToggle;
