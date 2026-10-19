/**
 * Themes Screen - Theme Picker UI with Category Chips
 *
 * Shows a horizontal category chip picker at the top with unlock counts,
 * then a 2-column grid of theme tiles filtered by selected category.
 * Themes show live previews; unlocked themes are tappable, locked themes
 * show a lock icon and unlock condition.
 * Choice persists to localStorage and applies immediately.
 */

import { useState, useMemo } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getVisibleThemes, isThemeUnlocked, formatUnlockCondition, getUnlockBadgeInfo, type Theme, type ThemeCategory } from "@/lib/themes";
import { useProgress } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { EMOJI, CATEGORY_LABELS } from "@/constants/emoji";

const CATEGORY_ORDER: ThemeCategory[] = ["classic", "bright", "clean", "night", "fancy"];

export function ThemesScreen() {
  const { currentTheme, setTheme } = useThemeStore();
  const progress = useProgress();
  const [isChanging, setIsChanging] = useState(false);
  const themes = getVisibleThemes();

  // Determine default category from current theme
  const currentThemeObj = themes.find((t) => t.id === currentTheme);
  const defaultCategory: ThemeCategory = currentThemeObj?.category || "classic";
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>(defaultCategory);

  // Group themes by category and compute unlock counts
  const categoryStats = useMemo(() => {
    const stats: Record<ThemeCategory, { unlocked: number; total: number }> = {
      bright: { unlocked: 0, total: 0 },
      night: { unlocked: 0, total: 0 },
      fancy: { unlocked: 0, total: 0 },
      clean: { unlocked: 0, total: 0 },
      classic: { unlocked: 0, total: 0 },
    };

    themes.forEach((theme) => {
      stats[theme.category].total += 1;
      if (isThemeUnlocked(theme, progress)) {
        stats[theme.category].unlocked += 1;
      }
    });

    return stats;
  }, [themes, progress]);

  // Filter themes by selected category
  const categoryThemes = useMemo(
    () => themes.filter((t) => t.category === selectedCategory),
    [themes, selectedCategory],
  );

  const handleThemeSelect = (themeId: string) => {
    fxTap();
    setIsChanging(true);
    setTheme(themeId as string);
    setTimeout(() => setIsChanging(false), 200);
  };

  const handleCategorySelect = (category: ThemeCategory) => {
    fxTap();
    setSelectedCategory(category);
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
          Choose your favorite theme — changes apply instantly
        </p>
      </div>

      {/* Category Chip Picker */}
      <div
        className="px-4 py-4 flex gap-2 overflow-x-auto flex-shrink-0 border-b"
        style={{ backgroundColor: "var(--surface-card)", borderColor: "var(--border-color)" }}
      >
        {CATEGORY_ORDER.map((category) => {
          const stats = categoryStats[category];
          const isActive = selectedCategory === category;
          const info = CATEGORY_LABELS[category];

          return (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className="flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 border-2"
              style={{
                backgroundColor: isActive ? "var(--accent-1)" : "var(--surface-muted)",
                borderColor: isActive ? "var(--accent-1)" : "var(--border-color)",
                color: isActive ? "var(--accent-1-ink)" : "var(--text-primary)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.875rem",
              }}
            >
              <span className="text-base">{info.emoji}</span>
              <span>{info.fun}</span>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: isActive ? "rgba(0,0,0,0.15)" : "var(--accent-1)",
                  color: isActive ? "var(--accent-1-ink)" : "var(--accent-1-ink)",
                }}
              >
                {stats.unlocked}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Themes Grid */}
      <div className="px-4 py-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          {categoryThemes.map((theme) => {
            const isUnlocked = isThemeUnlocked(theme, progress);
            const isSelected = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (isUnlocked) {
                    handleThemeSelect(theme.id);
                  }
                }}
                disabled={!isUnlocked}
                className={`rounded-2xl p-3 transition-all duration-200 flex flex-col min-h-[200px] border-4 ${
                  isSelected && isUnlocked
                    ? "border-accent-1 shadow-lg scale-105"
                    : "border-transparent hover:shadow-md"
                } ${!isUnlocked ? "cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: theme.previewTokens.bg,
                }}
              >
                {/* Preview Box - Fixed Height with relative positioning */}
                <div
                  className={`relative h-24 rounded-xl p-3 flex flex-col items-center justify-center gap-1 mb-2 ${
                    !isUnlocked ? "opacity-50 grayscale" : ""
                  }`}
                  style={{
                    backgroundColor: theme.previewTokens.accent + "20",
                    border: `2px solid ${theme.previewTokens.accent}`,
                  }}
                >
                  {/* Lock Icon - Top Left of Preview Box */}
                  {!isUnlocked && (
                    <div
                      className="absolute top-2 left-2 text-lg"
                    >
                      {EMOJI.action.lock}
                    </div>
                  )}

                  {/* Checkmark - Top Right of Preview Box */}
                  {isSelected && isUnlocked && (
                    <div
                      className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: "var(--accent-1)",
                        color: "var(--accent-1-ink)",
                      }}
                    >
                      ✓
                    </div>
                  )}

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

                  {/* Button preview */}
                  <div
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: theme.previewTokens.accent,
                      color: theme.previewTokens.bg,
                    }}
                  >
                    Play
                  </div>
                </div>

                {/* Theme Name - 1 line, no overflow */}
                <h3
                  className="text-sm font-extrabold line-clamp-1"
                  style={{ color: theme.previewTokens.text }}
                >
                  {theme.name}
                </h3>

                {/* Description - 2 lines max */}
                <p
                  className="text-xs mt-1 overflow-hidden"
                  style={{
                    color: theme.previewTokens.text,
                    opacity: isUnlocked ? 0.8 : 0.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {theme.description}
                </p>

                {/* Unlock Badge Pill - Only if locked */}
                {!isUnlocked && theme.unlockRule && (
                  <div className="mt-auto pt-2 flex items-center gap-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{
                        backgroundColor: getUnlockBadgeInfo(theme.unlockRule).color + "22",
                        color: getUnlockBadgeInfo(theme.unlockRule).color,
                        border: `1px solid ${getUnlockBadgeInfo(theme.unlockRule).color}44`,
                      }}
                    >
                      <span>{getUnlockBadgeInfo(theme.unlockRule).icon}</span>
                      <span>{formatUnlockCondition(theme.unlockRule)}</span>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
