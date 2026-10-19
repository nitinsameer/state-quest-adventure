/**
 * Theme Unlock Celebration Modal
 *
 * Shows when a new theme is unlocked via state completion or streak milestones.
 * Displays theme name and a live mini-preview using the theme's previewTokens.
 * Offers "Try it now" to apply the theme immediately, or "Maybe later" to dismiss.
 */

import React, { useState } from "react";
import { useThemeStore } from "@/store/themeStore";
import { StandardModal } from "@/components/StandardModal";
import { THEMES, getTheme } from "@/lib/themes";
import { dismissPendingCelebration } from "@/lib/progress";
import { fxTap } from "@/lib/fx";
import { EMOJI } from "@/constants/emoji";

interface ThemeUnlockCelebrationProps {
  themeId: string;
  themeName: string;
}

export function ThemeUnlockCelebration({ themeId, themeName }: ThemeUnlockCelebrationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const { setTheme } = useThemeStore();
  const theme = getTheme(themeId);

  const handleTryNow = () => {
    fxTap();
    setIsExiting(true);
    setTimeout(() => {
      setTheme(themeId);
      dismissPendingCelebration();
    }, 300);
  };

  const handleMaybeLater = () => {
    fxTap();
    setIsExiting(true);
    setTimeout(() => {
      dismissPendingCelebration();
    }, 300);
  };

  return (
    <StandardModal
      open={!isExiting}
      onClose={handleMaybeLater}
      maxWidth="max-w-sm"
      header={{
        icon: EMOJI.feedback.unlocked,
        title: "New Theme Unlocked!",
        subtitle: themeName,
        floatingIcon: true,
      }}
      content={[
        {
          type: "custom",
          children: (
            <div className="flex flex-col items-center gap-4 py-4">
              {/* Theme preview swatch showing the theme's colors */}
              <div className="w-48 h-32 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                {/* Top section: background + surface */}
                <div className="flex-1 flex">
                  <div className="flex-1" style={{ backgroundColor: theme.previewTokens.bg }} />
                  <div
                    className="flex-1"
                    style={{ backgroundColor: theme.previewTokens.surface }}
                  />
                </div>
                {/* Bottom section: text + accent */}
                <div className="flex-1 flex">
                  <div
                    className="flex-1 flex items-center justify-center text-sm font-bold"
                    style={{
                      color: theme.previewTokens.text,
                      backgroundColor: theme.previewTokens.surface,
                    }}
                  >
                    Text
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: theme.previewTokens.accent }}
                  >
                    Action
                  </div>
                </div>
              </div>

              {/* Theme description */}
              <p
                className="text-sm text-center leading-relaxed"
                style={{ color: "var(--text-primary)" }}
              >
                {theme.description}
              </p>

              {/* Theme features/effects if any */}
              {(theme.effects.blur || theme.effects.glow) && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {theme.effects.blur && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold ui-accent-2-soft text-accent-2-ink">
                      Blur Effects
                    </span>
                  )}
                  {theme.effects.glow && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold ui-accent-5-soft text-accent-5-ink">
                      Glow Effect
                    </span>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ]}
      buttons={[
        {
          label: "Try it now",
          onClick: handleTryNow,
          variant: "primary",
          emoji: EMOJI.action.celebration,
        },
        {
          label: "Maybe later",
          onClick: handleMaybeLater,
          variant: "secondary",
        },
      ]}
      buttonsLayout="stack"
    />
  );
}
