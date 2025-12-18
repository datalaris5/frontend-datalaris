/**
 * ChartEmptyState
 * ---------------
 * Komponen untuk menampilkan state kosong pada chart.
 * Digunakan saat data tidak tersedia atau belum di-upload.
 *
 * Props:
 * - icon: Lucide icon component
 * - title: Judul pesan
 * - message: Deskripsi pesan
 * - action: Optional CTA button
 */

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInVariants } from "@/config/animationConfig";

interface ChartEmptyStateProps {
  /** Icon to display (from lucide-react) */
  icon?: LucideIcon;
  /** Main title text */
  title?: string;
  /** Secondary description text */
  message?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  icon: Icon = BarChart3,
  title = "Data Belum Tersedia",
  message = "Upload data untuk melihat visualisasi chart.",
  action,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full w-full py-12 px-6 text-center"
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Icon Container with Glass Effect */}
      <div className="relative mb-4">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
        {/* Icon Circle */}
        <div className="relative p-4 rounded-full bg-muted/50 border border-border/50">
          <Icon
            className="w-10 h-10 text-muted-foreground/50"
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>

      {/* Optional Action Button */}
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};

export default ChartEmptyState;
