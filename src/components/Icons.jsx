import React from 'react';

export const ShopeeLogo = ({ className, ...props }) => (
  <img 
    src="https://img.icons8.com/?size=100&id=mBkyWceUPlkM&format=png&color=EE4D2D" 
    alt="Shopee" 
    className={className} 
    {...props} 
  />
);

export const TikTokLogo = ({ className, ...props }) => (
  <img 
    src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000" 
    alt="TikTok" 
    className={className} 
    {...props} 
  />
);

// Keep the monochrome versions pointing to the same logos for now, 
// or we could use the black version for ShopeeIcon if strictly monochrome is needed.
export const ShopeeIcon = ({ className, ...props }) => (
  <img 
    src="https://img.icons8.com/?size=100&id=mBkyWceUPlkM&format=png&color=000000" 
    alt="Shopee" 
    className={className} 
    {...props} 
  />
);

export const TikTokIcon = ({ className, ...props }) => (
  <img 
    src="https://img.icons8.com/?size=100&id=118640&format=png&color=000000" 
    alt="TikTok" 
    className={className} 
    {...props} 
  />
);
