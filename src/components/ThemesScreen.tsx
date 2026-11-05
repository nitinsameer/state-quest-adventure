/**
 * Themes Screen - Theme Picker UI with Single Tab
 *
 * Shows a simple header and a responsive grid of all 8 visible themes.
 * Themes show live previews; unlocked themes are tappable, locked themes
 * show a lock icon.
 * Choice persists to localStorage and applies immediately.
 */

import { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getVisibleThemes, isThemeUnlocked } from "@/lib/themes";
import { useProgress } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { ThemeCard } from "./ThemeCard";

export function ThemesScreen() {
  const { currentTheme, setTheme } = useThemeStore();
  const progress = useProgress();
  const [isChanging, setIsChanging] = useState(false);
  const themes = getVisibleThemes();

  const handleThemeSelect = (themeId: string) => {
    fxTap();
    setIsChanging(true);
    setTheme(themeId as string);
    setTimeout(() => setIsChanging(false), 200);
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-6" style={{ backgroundColor: "var(--bg-header)" }}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              fxTap();
              window.history.back();
            }}
            aria-label="Go back"
            className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
            style={{
              backgroundColor: "var(--text-on-header)",
              opacity: 0.25,
              color: "var(--text-on-header)",
            }}
          >
            ‹
          </button>
          <h1
            className="text-display font-extrabold text-center flex-1"
            style={{ color: "var(--text-on-header)" }}
          >
            My Style
          </h1>
          <div className="w-10" />
        </div>
        <p
          className="text-sm text-center mt-2"
          style={{ color: "var(--text-on-header)", opacity: 0.9 }}
        >
          Choose your favorite look
        </p>
      </div>

      {/* Themes Grid - responsive */}
      <div className="px-4 py-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {themes.map((theme) => {
            const isUnlocked = isThemeUnlocked(theme, progress);
            const isSelected = currentTheme === theme.id;

            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isUnlocked={isUnlocked}
                isSelected={isSelected}
                onSelect={() => handleThemeSelect(theme.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
