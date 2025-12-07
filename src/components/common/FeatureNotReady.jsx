import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FeatureNotReady = ({
  children,
  blur = true,
  overlay = true,
  message = "Segera Hadir",
}) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl h-full">
      <div
        className={cn(
          "h-full transition-all duration-300",
          blur &&
            "blur-[2px] opacity-60 pointer-events-none select-none grayscale-[0.5]"
        )}
      >
        {children}
      </div>

      {overlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/10 backdrop-blur-[1px]">
          <Card className="glass-card px-6 py-3 shadow-lg transform transition-transform duration-300 hover:scale-105 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
              {message}
            </span>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeatureNotReady;
