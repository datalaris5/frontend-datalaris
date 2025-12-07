import React, { createContext, useContext, useState, useEffect } from "react";
import { generateShades } from "../utils/colorUtils";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme Mode (Light/Dark)
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    return "system";
  });

  // Theme Colors (Primary/Secondary)
  const [themeColors, setThemeColors] = useState(() => {
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

    const applyThemeMode = () => {
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
    const handleChange = () => {
      if (theme === "system") applyThemeMode();
    };

    mediaQuery.addEventListener("change", handleChange);
    localStorage.setItem("theme", theme);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply Dynamic Colors
  useEffect(() => {
    const root = window.document.documentElement;

    const applyColorPalette = (name, hex) => {
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

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  const updateColors = (newColors) => {
    setThemeColors((prev) => ({ ...prev, ...newColors }));
  };

  const resetColors = () => {
    setThemeColors({
      primary: "#f97316",
      secondary: "#3b82f6",
    });
  };

  // Background Pattern State
  const [backgroundPattern, setBackgroundPattern] = useState(() => {
    return localStorage.getItem("backgroundPattern") || "mesh";
  });

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

export const useTheme = () => useContext(ThemeContext);
