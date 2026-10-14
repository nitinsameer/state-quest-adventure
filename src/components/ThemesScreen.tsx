/**
 * Themes Screen - Theme Picker UI
 * 
 * Shows a 2-column grid of theme tiles with live previews.
 * Users can tap to apply a theme instantly.
 * Choice persists to localStorage and applies immediately.
 */

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

// Theme registry - must match src/lib/themes.ts
interface Theme {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  // Token values for preview
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

const THEMES: Theme[] = [
  {
    id: 'clay',
    name: 'Clay',
    description: 'Warm, earthy tones',
    accentColor: '#FF7A1A',
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
  },
  {
    id: 'clay-dark',
    name: 'Clay Dark',
    description: 'Dark mode with warmth',
    accentColor: '#FF9944',
    backgroundColor: '#1A1A1A',
    textColor: '#F5F5F5',
  },
  {
    id: 'neobrutalism',
    name: 'Neobrutalism',
    description: 'Bold, geometric style',
    accentColor: '#000000',
    backgroundColor: '#F0F0F0',
    textColor: '#000000',
  },
  {
    id: 'minimal-flat',
    name: 'Minimal Flat',
    description: 'Clean and simple',
    accentColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Vivid rangoli-inspired',
    accentColor: '#FF6FB1',
    backgroundColor: '#FFF6E5',
    textColor: '#131A33',
  },
];

export function ThemesScreen() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeSelect = (themeId: string) => {
    setIsChanging(true);
    setTheme(themeId as any);
    setTimeout(() => setIsChanging(false), 200);
  };

  return (
    <div className="h-full w-full bg-bg-page flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-b-[32px]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center text-white text-xl"
          >
            ‹
          </button>
          <h1 className="text-display font-extrabold text-white text-center flex-1">
            My Style
          </h1>
          <div className="w-10" />
        </div>
        <p className="text-white/90 text-sm text-center mt-2">
          Choose your favorite theme — changes apply instantly
        </p>
      </div>

      {/* Themes Grid */}
      <div className="px-4 py-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`rounded-2xl p-4 transition-all duration-200 relative border-4 ${
                currentTheme === theme.id
                  ? 'border-accent-1 shadow-lg scale-105'
                  : 'border-transparent hover:shadow-md'
              }`}
              style={{ backgroundColor: theme.backgroundColor }}
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
                  style={{ backgroundColor: theme.accentColor + '20', border: `2px solid ${theme.accentColor}` }}
                >
                  {/* Accent color dots */}
                  <div className="flex gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div
                      className="h-2 w-2 rounded-full opacity-60"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div
                      className="h-2 w-2 rounded-full opacity-30"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>

                  {/* Text preview */}
                  <div className="text-xs font-bold" style={{ color: theme.textColor }}>
                    Aa
                  </div>
                  <div
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ backgroundColor: theme.accentColor, color: theme.backgroundColor }}
                  >
                    Play
                  </div>
                </div>
              </div>

              {/* Theme Name and Description */}
              <div className="text-left">
                <h3
                  className="text-sm font-extrabold"
                  style={{ color: theme.textColor }}
                >
                  {theme.name}
                </h3>
                <p
                  className="text-xs opacity-70 mt-1"
                  style={{ color: theme.textColor }}
                >
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
