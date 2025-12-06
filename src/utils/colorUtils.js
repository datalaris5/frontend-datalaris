// Helper to convert Hex to RGB object
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Helper to convert RGB object to "r g b" string for Tailwind
export const rgbToString = (rgb) => {
  return `${rgb.r} ${rgb.g} ${rgb.b}`;
};

// Generate shades from a base color
// This is a simplified algorithm. For production, consider using libraries like 'chroma-js' or 'tinycolor2'
// But for "No-Code" philosophy without extra deps, we'll use a custom mixer.
export const generateShades = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return null;

  const mix = (color1, color2, weight) => {
    const w = 2 * weight - 1;
    const a = 0; // alpha
    const w1 = (w / 1 + 1) / 2;
    const w2 = 1 - w1;
    return {
      r: Math.round(color1.r * w1 + color2.r * w2),
      g: Math.round(color1.g * w1 + color2.g * w2),
      b: Math.round(color1.b * w1 + color2.b * w2),
    };
  };

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  return {
    50: rgbToString(mix(white, rgb, 0.95)),
    100: rgbToString(mix(white, rgb, 0.9)),
    200: rgbToString(mix(white, rgb, 0.75)),
    300: rgbToString(mix(white, rgb, 0.6)),
    400: rgbToString(mix(white, rgb, 0.3)),
    500: rgbToString(rgb), // Base color
    600: rgbToString(mix(black, rgb, 0.1)),
    700: rgbToString(mix(black, rgb, 0.3)),
    800: rgbToString(mix(black, rgb, 0.45)),
    900: rgbToString(mix(black, rgb, 0.6)),
    950: rgbToString(mix(black, rgb, 0.75)),
  };
};
