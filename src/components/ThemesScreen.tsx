/**
 * Themes Screen - My Style Theme Selector
 *
 * Reproduces the approved reference design:
 * - Lavender header with sparkle title
 * - 2-column grid of 8 theme cards
 * - Each card contains preview + name + selection indicator
 * - White translucent bottom navigation
 * - All SVG backgrounds use theme previewTokens
 */

import { useThemeStore } from "@/store/themeStore";
import { getVisibleThemes, isThemeUnlocked } from "@/lib/themes";
import { useProgress } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { ThemeCard } from "./ThemeCard";

export function ThemesScreen() {
  const { currentTheme, setTheme } = useThemeStore();
  const progress = useProgress();
  const themes = getVisibleThemes();

  const handleThemeSelect = (themeId: string) => {
    fxTap();
    setTheme(themeId as string);
  };

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: "#f5f0ff",
      }}
    >
      {/* Header with lavender background */}
      <div
        className="flex flex-col items-center text-center relative"
        style={{
          background: "linear-gradient(to bottom, #ece8fb 0%, #f0ecfe 100%)",
          paddingTop: "max(8px, env(safe-area-inset-top))",
          paddingBottom: "16px",
          paddingLeft: "28px",
          paddingRight: "28px",
        }}
      >
        {/* Back Button */}
        <div className="w-full flex items-center justify-start mb-3" style={{ marginBottom: "10px" }}>
          <button
            onClick={() => {
              fxTap();
              window.history.back();
            }}
            aria-label="Go back"
            className="rounded-full flex items-center justify-center font-bold transition-transform hover:scale-110 active:scale-95"
            style={{
              width: "37px",
              height: "37px",
              backgroundColor: "white",
              color: "#7c5cf0",
              fontSize: "20px",
              boxShadow: "0 2px 8px rgba(124, 92, 240, 0.15)",
            }}
          >
            ‹
          </button>
        </div>

        {/* Title with Sparkle */}
        <h1
          className="font-extrabold"
          style={{
            color: "#2d2650",
            letterSpacing: "-0.5px",
            fontSize: "27px",
            marginBottom: "8px",
            margin: "0 0 8px 0",
          }}
        >
          ✨ My Style
        </h1>

        {/* Subtitle */}
        <p
          className="font-medium"
          style={{
            color: "#2d2650",
            opacity: 0.75,
            fontSize: "14px",
            marginBottom: "0px",
            margin: "0",
          }}
        >
          Choose your favorite look for the app
        </p>

        {/* Curved wave transition at bottom of header */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: "12px",
            overflow: "visible",
          }}
          viewBox="0 0 1080 30"
          preserveAspectRatio="none"
        >
          <path
            d="M0,15 Q270,5 540,15 T1080,15 L1080,30 L0,30 Z"
            fill="#f5f0ff"
          />
        </svg>
      </div>

      {/* Themes Grid */}
      <div
        className="flex-1 overflow-auto w-full"
        style={{
          paddingLeft: "28px",
          paddingRight: "28px",
          paddingTop: "10px",
          paddingBottom: "calc(var(--nav-h, 80px) + 8px)",
          scrollPaddingBottom: "calc(var(--nav-h, 80px) + 8px)",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px 12px",
          }}
        >
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
