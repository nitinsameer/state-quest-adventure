/**
 * Themes Screen - Theme Picker UI
 *
 * Shows a 2-column grid of theme tiles with live previews.
 * Users can tap to apply a theme instantly.
 * Choice persists to localStorage and applies immediately.
 */

import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getVisibleThemes } from "@/lib/themes";
import { fxTap } from "@/lib/fx";

export function ThemesScreen() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isChanging, setIsChanging] = useState(false);
  const themes = getVisibleThemes();

  const handleThemeSelect = (themeId: string) => {
    fxTap();
    setIsChanging(true);
    setTheme(themeId as "clay" | "aero" | "cartoon-comic" | "glassmorphism" | "skeumorphism");
    setTimeout(() => setIsChanging(false), 200);
  };

  return (
    <div className="h-full w-full bg-bg-page flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-b-[32px]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              fxTap();
              window.history.back();
            }}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
          >
            ‹
          </button>
          <h1 className="text-display font-extrabold text-white text-center flex-1">My Style</h1>
          <div className="w-10" />
        </div>
        <p className="text-white/90 text-sm text-center mt-2">
          Choose your favorite theme — changes apply instantly
        </p>
      </div>

      {/* Themes Grid */}
      <div className="px-4 py-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`rounded-2xl p-4 transition-all duration-200 relative border-4 ${
                currentTheme === theme.id
                  ? "border-accent-1 shadow-lg scale-105"
                  : "border-transparent hover:shadow-md"
              }`}
              style={{ backgroundColor: theme.previewTokens.bg }}
            >
              {/* Tick icon for selected */}
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-accent-1 flex items-center justify-center text-white text-sm font-bold">
                  ✓
                </div>
              )}

              {/* Live Preview Card */}
              <div className="space-y-3 mb-3">
                {/* Mini card preview */}
                <div
                  className="h-20 rounded-xl p-3 flex flex-col items-center justify-center gap-1"
                  style={{
                    backgroundColor: theme.previewTokens.accent + "20",
                    border: `2px solid ${theme.previewTokens.accent}`,
                  }}
                >
                  {/* Accent color dots */}
                  <div className="flex gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: theme.previewTokens.accent }}
                    />
                    <div
                      className="h-2 w-2 rounded-full opacity-60"
                      style={{ backgroundColor: theme.previewTokens.accent }}
                    />
                    <div
                      className="h-2 w-2 rounded-full opacity-30"
                      style={{ backgroundColor: theme.previewTokens.accent }}
                    />
                  </div>

                  {/* Text preview */}
                  <div className="text-xs font-bold" style={{ color: theme.previewTokens.text }}>
                    Aa
                  </div>
                  <div
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: theme.previewTokens.accent,
                      color: theme.previewTokens.bg,
                    }}
                  >
                    Play
                  </div>
                </div>
              </div>

              {/* Theme Name and Description */}
              <div className="text-left">
                <h3 className="text-sm font-extrabold" style={{ color: theme.previewTokens.text }}>
                  {theme.name}
                </h3>
                <p className="text-xs opacity-70 mt-1" style={{ color: theme.previewTokens.text }}>
                  {theme.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
