import React from "react";

const FeatureNotReady = ({
  children,
  blur = true,
  overlay = true,
  message = "Segera Hadir",
}) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl h-full">
      <div
        className={`h-full transition-all duration-300 ${
          blur
            ? "blur-[2px] opacity-60 pointer-events-none select-none grayscale-[0.5]"
            : ""
        }`}
      >
        {children}
      </div>

      {overlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50/10 dark:bg-gray-900/10 backdrop-blur-[1px]">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                {message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureNotReady;
