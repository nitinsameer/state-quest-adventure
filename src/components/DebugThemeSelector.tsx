/**
 * Debug Theme Selector Component
 *
 * Only visible in development mode (process.env.NODE_ENV === 'development').
 * Allows quick preview of all available themes by clicking buttons.
 * Displays theme names with color previews and highlights the current theme.
 */

import { useThemeStore } from "@/store/themeStore";
import { THEMES } from "@/lib/themes";
import { fxTap } from "@/lib/fx";

export function DebugThemeSelector() {
  const { currentTheme, setTheme } = useThemeStore();

  // Only show in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleThemeSelect = (themeId: string) => {
    fxTap();
    setTheme(themeId as Record<string, unknown>);
  };

  return (
    <div className="animate-fade-in" style={{ animationDelay: "280ms" }}>
      <div className="ui-card ui-accent-1-soft p-4 space-y-3">
        {/* Debug Header */}
        <div className="text-xs font-extrabold text-text-secondary uppercase tracking-wider px-1">
          🐛 Debug: Theme Preview
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`relative p-3 rounded-xl border-2 transition transform active:scale-95 ${
                currentTheme === theme.id
                  ? "border-accent-3 shadow-[var(--shadow-glow-orange)] scale-105 bg-surface-raised"
                  : "border-border-color hover:scale-102 bg-surface-sunken"
              }`}
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-2">
                <div
                  className="h-4 w-4 rounded flex-shrink-0"
                  style={{ backgroundColor: theme.previewTokens.bg }}
                  title="Background"
                />
                <div
                  className="h-4 w-4 rounded flex-shrink-0"
                  style={{ backgroundColor: theme.previewTokens.surface }}
                  title="Surface"
                />
                <div
                  className="h-4 w-4 rounded flex-shrink-0"
                  style={{ backgroundColor: theme.previewTokens.accent }}
                  title="Accent"
                />
              </div>

              {/* Theme Name */}
              <div className="text-left">
                <div className="text-[11px] font-extrabold text-text-primary truncate">
                  {theme.name}
                </div>
                <div className="text-[9px] font-bold text-text-secondary truncate">{theme.id}</div>
              </div>

              {/* Current Indicator */}
              {currentTheme === theme.id && (
                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-accent-3 flex items-center justify-center text-xs font-extrabold text-text-on-header">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Debug Info */}
        <div className="text-[9px] font-mono text-text-secondary bg-surface-sunken p-2 rounded">
          <div>
            Current: <span className="font-extrabold">{currentTheme}</span>
          </div>
          <div>
            Total themes: <span className="font-extrabold">{THEMES.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
