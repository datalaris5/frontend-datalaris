import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Save, RotateCcw, Palette, Layout, Type } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const ThemeSettings = () => {
  const {
    themeColors,
    updateColors,
    resetColors,
    backgroundPattern,
    setBackgroundPattern,
  } = useTheme();

  const handleColorChange = (key, value) => {
    updateColors({ [key]: value });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to default colors?")) {
      resetColors();
      toast.success("Theme reset to default");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-8 h-8 text-primary" />
            Theme Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize the look and feel of your application.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Color Palette
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-10 overflow-hidden rounded-md border border-input">
                    <input
                      type="color"
                      value={themeColors.primary}
                      onChange={(e) =>
                        handleColorChange("primary", e.target.value)
                      }
                      className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {themeColors.primary}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for main actions, links, and active states.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-10 overflow-hidden rounded-md border border-input">
                    <input
                      type="color"
                      value={themeColors.secondary}
                      onChange={(e) =>
                        handleColorChange("secondary", e.target.value)
                      }
                      className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {themeColors.secondary}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for accents, info states, and secondary buttons.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-gray-400 bg-gray-100 dark:bg-gray-700"></div>
              Background Style
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setBackgroundPattern("plain")}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  backgroundPattern === "plain"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-full aspect-video rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"></div>
                <span className="text-xs font-medium">Plain</span>
              </button>

              <button
                onClick={() => setBackgroundPattern("mesh")}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  backgroundPattern === "mesh"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-full aspect-video rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mesh-gradient"></div>
                <span className="text-xs font-medium">Grid/Mesh</span>
              </button>

              <button
                onClick={() => setBackgroundPattern("dot")}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  backgroundPattern === "dot"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-full aspect-video rounded bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 bg-dot-pattern"></div>
                <span className="text-xs font-medium">Dots</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Smart Harmony
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Changing the base color automatically generates 10 harmonious
                  shades (50-950) for perfect contrast and consistency across
                  the app.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Live Preview
            </h2>

            <div className="space-y-8">
              {/* Buttons */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Buttons
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                    Primary Action
                  </button>
                  <button className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors shadow-sm">
                    Secondary Action
                  </button>
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>

              {/* Alerts/Cards */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Components
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <h4 className="text-primary-800 font-medium">
                      Primary Alert
                    </h4>
                    <p className="text-primary-600 text-sm mt-1">
                      This is how a primary alert looks with the current theme.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <h4 className="text-secondary-800 font-medium">
                      Secondary Info
                    </h4>
                    <p className="text-secondary-600 text-sm mt-1">
                      This is how secondary info blocks appear.
                    </p>
                  </div>
                </div>
              </div>

              {/* Typography & Links */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Typography
                </h3>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Heading 1
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    This is a paragraph with a{" "}
                    <a
                      href="#"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      primary link
                    </a>{" "}
                    inside it. The colors adjust automatically to ensure
                    readability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
