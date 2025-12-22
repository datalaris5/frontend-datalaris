/**
 * Formatter Utilities
 * --------------------
 * Fungsi-fungsi untuk format angka, currency, dll.
 * Reusable across all dashboards.
 */

/**
 * Format angka ke format Rupiah
 *
 * @param value - Angka yang akan diformat
 * @returns String dalam format "Rp 1.500.000"
 *
 * @example
 * formatCurrency(1500000) // "Rp 1.500.000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format currency ke format ringkas (untuk chart labels)
 *
 * @param value - Angka yang akan diformat
 * @returns String dalam format ringkas "1.5jt", "500rb", etc
 *
 * @example
 * formatShortCurrency(1500000) // "Rp1.5jt"
 * formatShortCurrency(500000) // "Rp500rb"
 */
export function formatShortCurrency(value: number): string {
  if (value >= 1000000000) {
    return `Rp${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `Rp${(value / 1000).toFixed(0)}rb`;
  }
  return `Rp${value}`;
}

/**
 * Format angka biasa (non-currency)
 *
 * @param value - Angka yang akan diformat
 * @returns String dengan thousand separator
 *
 * @example
 * formatNumber(1500000) // "1.500.000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Format persentase
 *
 * @param value - Angka dalam bentuk decimal (0.15 = 15%)
 * @param decimals - Jumlah decimal places (default: 1)
 * @returns String dengan format "15.0%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
