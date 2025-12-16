/**
 * Theme Context
 * -------------
 * Context untuk manajemen tema aplikasi.
 *
 * Menyediakan:
 * - theme: Mode tema (light/dark/system)
 * - themeColors: Warna primary dan secondary
 * - backgroundPattern: Pola background (mesh/dot/plain)
 * - toggleTheme(): Ganti mode tema
 * - updateColors(): Update warna dinamis
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { generateShades } from "@/utils/colorUtils";

type ThemeMode = "light" | "dark" | "system";
type BackgroundPattern = "mesh" | "dot" | "plain";

interface ThemeColors {
  primary: string;
  secondary: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  themeColors: ThemeColors;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  resetColors: () => void;
  backgroundPattern: BackgroundPattern;
  setBackgroundPattern: React.Dispatch<React.SetStateAction<BackgroundPattern>>;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Theme Mode (Light/Dark)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });

  // Theme Colors (Primary/Secondary)
  const [themeColors, setThemeColors] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem("themeColors");
    return saved
      ? JSON.parse(saved)
      : {
          primary: "#f97316", // Default Orange-500
          secondary: "#3b82f6", // Default Blue-500
        };
  });

  // Apply Dark/Light Mode
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyThemeMode = (): void => {
      if (theme === "dark") {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else if (theme === "light") {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      } else {
        if (mediaQuery.matches) {
          root.classList.add("dark");
          root.style.colorScheme = "dark";
        } else {
          root.classList.remove("dark");
          root.style.colorScheme = "light";
        }
      }
    };

    applyThemeMode();
    const handleChange = (): void => {
      if (theme === "system") applyThemeMode();
    };

    mediaQuery.addEventListener("change", handleChange);
    localStorage.setItem("theme", theme);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply Dynamic Colors
  useEffect(() => {
    const root = window.document.documentElement;

    const applyColorPalette = (name: string, hex: string): void => {
      const shades = generateShades(hex);
      if (!shades) return;

      // Set base color
      root.style.setProperty(`--color-${name}`, shades[500]);

      // Set all shades
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${name}-${shade}`, value);
      });
    };

    applyColorPalette("primary", themeColors.primary);
    applyColorPalette("secondary", themeColors.secondary);

    localStorage.setItem("themeColors", JSON.stringify(themeColors));
  }, [themeColors]);

  const toggleTheme = (): void => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  const updateColors = (newColors: Partial<ThemeColors>): void => {
    setThemeColors((prev) => ({ ...prev, ...newColors }));
  };

  const resetColors = (): void => {
    setThemeColors({
      primary: "#f97316",
      secondary: "#3b82f6",
    });
  };

  // Background Pattern State
  const [backgroundPattern, setBackgroundPattern] = useState<BackgroundPattern>(
    () => {
      const stored = localStorage.getItem("backgroundPattern");
      if (stored === "mesh" || stored === "dot" || stored === "plain") {
        return stored;
      }
      return "mesh";
    }
  );

  // Apply Background Pattern
  useEffect(() => {
    const root = window.document.body;
    // Remove all pattern classes first
    root.classList.remove("mesh-gradient", "bg-dot-pattern");

    // Add selected pattern
    if (backgroundPattern === "mesh") {
      root.classList.add("mesh-gradient");
    } else if (backgroundPattern === "dot") {
      root.classList.add("bg-dot-pattern");
    }
    // 'plain' adds no class

    localStorage.setItem("backgroundPattern", backgroundPattern);
  }, [backgroundPattern]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        themeColors,
        updateColors,
        resetColors,
        backgroundPattern,
        setBackgroundPattern,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
