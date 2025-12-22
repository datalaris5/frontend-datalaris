/**
 * ChartEmptyState
 * ---------------
 * Komponen untuk menampilkan state kosong pada chart.
 * Digunakan saat data tidak tersedia atau belum di-upload.
 *
 * Layout: Horizontal (icon kiri, teks kanan) untuk ruang yang lebih compact.
 * Design: Muted colors untuk subtle, non-intrusive appearance.
 *
 * Props:
 * - icon: Lucide icon component
 * - title: Judul pesan
 * - message: Deskripsi pesan
 */

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, BarChart3 } from "lucide-react";
import { fadeInVariants } from "@/config/animationConfig";

interface ChartEmptyStateProps {
  /** Icon to display (from lucide-react) */
  icon?: LucideIcon;
  /** Main title text */
  title?: string;
  /** Secondary description text */
  message?: string;
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  icon: Icon = BarChart3,
  title = "Data Belum Tersedia",
  message = "Upload data untuk melihat visualisasi chart.",
}) => {
  return (
    <motion.div
      className="flex items-center justify-center h-full w-full p-4"
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Horizontal Layout Container */}
      <div className="flex items-center gap-3 max-w-sm">
        {/* Icon Container (Left) */}
        <div className="flex-shrink-0">
          <div className="p-2.5 rounded-full bg-muted/40 border border-border/30">
            <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text Content (Right) */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-medium text-muted-foreground mb-0.5 truncate">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartEmptyState;
