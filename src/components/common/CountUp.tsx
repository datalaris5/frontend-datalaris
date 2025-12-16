/**
 * CountUp
 * -------
 * Komponen animasi angka yang menghitung dari 0 ke nilai target.
 * Menggunakan requestAnimationFrame untuk animasi yang smooth.
 *
 * Digunakan di:
 * - Metric Cards (Total Penjualan, Total Pesanan, dll)
 * - Statistik dashboard
 *
 * Props:
 * - end: Nilai akhir yang akan ditampilkan
 * - duration: Durasi animasi dalam detik (default: 2)
 * - decimals: Jumlah angka di belakang koma (default: 0)
 * - prefix: Teks sebelum angka (misal: "Rp ")
 * - suffix: Teks setelah angka (misal: " unit")
 * - separator: Pemisah ribuan (default: ".")
 */

import React, { useState, useEffect } from "react";

interface CountUpProps {
  end?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  end = 0,
  duration = 2,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = ".",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const durationMs = duration * 1000;

      // Fungsi easing untuk animasi yang natural (easeOutExpo)
      // Animasi cepat di awal, melambat di akhir
      const easeOutExpo = (x: number): number => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
      };

      const percent = Math.min(progress / durationMs, 1);
      const easedProgress = easeOutExpo(percent);

      const currentCount = easedProgress * end;

      setCount(currentCount);

      // Lanjutkan animasi jika belum selesai
      if (progress < durationMs) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Pastikan nilai akhir tepat
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup: hentikan animasi jika komponen di-unmount
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  // Format angka dengan locale Indonesia (titik sebagai pemisah ribuan)
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return (
    <span>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default CountUp;
