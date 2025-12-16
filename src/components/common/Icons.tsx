/**
 * Icons
 * -----
 * Kumpulan komponen icon custom untuk marketplace.
 * Menggunakan icon dari Icons8 dengan format PNG.
 *
 * Digunakan untuk:
 * - Platform selector di Header
 * - Indikator toko di berbagai halaman
 */

import React from "react";

// Tipe props untuk semua icon
interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

/**
 * Logo Shopee berwarna (oranye)
 * Digunakan di Platform Selector saat Shopee dipilih
 */
export const ShopeeLogo: React.FC<IconProps> = ({ className, ...props }) => (
  <img
    src="https://img.icons8.com/?size=100&id=mBkyWceUPlkM&format=png&color=EE4D2D"
    alt="Shopee"
    className={className}
    {...props}
  />
);

/**
 * Logo TikTok berwarna
 * Digunakan di Platform Selector saat TikTok dipilih
 */
export const TikTokLogo: React.FC<IconProps> = ({ className, ...props }) => (
  <img
    src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000"
    alt="TikTok"
    className={className}
    {...props}
  />
);

/**
 * Logo Shopee monokrom (hitam)
 * Digunakan untuk tampilan yang lebih subtle
 */
export const ShopeeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <img
    src="https://img.icons8.com/?size=100&id=mBkyWceUPlkM&format=png&color=000000"
    alt="Shopee"
    className={className}
    {...props}
  />
);

/**
 * Logo TikTok monokrom (hitam)
 * Digunakan untuk tampilan yang lebih subtle
 */
export const TikTokIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <img
    src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000"
    alt="TikTok"
    className={className}
    {...props}
  />
);
