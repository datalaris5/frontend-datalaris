/**
 * Utility Functions
 * -----------------
 * Fungsi utilitas umum untuk seluruh aplikasi.
 *
 * cn(): Menggabungkan class names dengan clsx dan tailwind-merge
 *       untuk menghindari konflik class Tailwind.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
