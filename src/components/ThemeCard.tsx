/**
 * ThemeCard Component
 *
 * Individual theme card with animations, glow effects, and smooth transitions.
 * Features:
 * - Hover glow on unlocked cards
 * - Smooth scale and shadow transitions
 * - Sparkle/pulse on selection
 * - Full prefers-reduced-motion support
 * - Compact and beautiful with just theme name and preview
 */

import { useState, useEffect } from "react";
import { type Theme } from "@/lib/themes";
import { EMOJI } from "@/constants/emoji";

interface ThemeCardProps {
  theme: Theme;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ theme, isUnlocked, isSelected, onSelect }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  // Respect prefers-reduced-motion for all animations
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Trigger sparkle animation when selected
  useEffect(() => {
    if (isSelected) {
      setSparkle(true);
      const t = setTimeout(() => setSparkle(false), 600);
      return () => clearTimeout(t);
    }
  }, [isSelected]);

  // Handle click - all themes are selectable (locked or not)
  const handleCardClick = () => {
    onSelect();
  };

  return (
    <>
      <style>{`
        @keyframes ringPulse {
          0% {
            box-shadow: 0 0 0 0 ${theme.previewTokens.accent}66;
          }
          70% {
            box-shadow: 0 0 0 10px ${theme.previewTokens.accent}00;
          }
          100% {
            box-shadow: 0 0 0 10px ${theme.previewTokens.accent}00;
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 8px 2px ${theme.previewTokens.accent}66;
          }
          50% {
            box-shadow: 0 0 16px 4px ${theme.previewTokens.accent}88;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .card-sparkle {
            animation: ringPulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
          }
          .preview-glow {
            animation: glowPulse 1.5s ease-in-out;
          }
        }
      `}</style>

      <div className="relative">
        <button
          onClick={handleCardClick}
          className={`rounded-2xl p-3 flex flex-col min-h-[200px] border-4 w-full ${
            isSelected ? "border-accent-1" : "border-transparent"
          } ${!prefersReducedMotion ? "transition-all duration-200" : ""} ${
            sparkle ? "card-sparkle" : ""
          }`}
          style={{
            backgroundColor: theme.previewTokens.bg,
            transform: isSelected ? "scale(1.04)" : "scale(1)",
            boxShadow:
              isSelected
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Preview Box - Fixed Height with glow effect */}
          <div
            className={`relative h-24 rounded-xl p-3 flex flex-col items-center justify-center gap-1 mb-2 ${
              !isUnlocked ? "opacity-50 grayscale" : ""
            } ${!prefersReducedMotion ? "transition-all duration-200" : ""} ${
              isHovered && isUnlocked && !prefersReducedMotion ? "preview-glow" : ""
            }`}
            style={{
              backgroundColor: theme.previewTokens.accent + "20",
              border: `2px solid ${theme.previewTokens.accent}`,
            }}
            onMouseEnter={() => {
              if (isUnlocked) setIsHovered(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Lock Icon - Top Left of Preview Box */}
            {!isUnlocked && (
              <div className="absolute top-2 left-2 flex items-center justify-center">
                {/* Gold background circle */}
                <div
                  className="absolute w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: "var(--accent-4)",
                    opacity: 0.4,
                  }}
                />
                {/* Lock emoji on top */}
                <div className="relative z-10 text-lg">{EMOJI.action.lock}</div>
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

          {/* Theme Name - Wrap text, don't truncate */}
          <h3
            className="text-sm font-extrabold text-center"
            style={{ color: theme.previewTokens.text, wordWrap: "break-word" }}
          >
            {theme.name}
          </h3>
        </button>
      </div>
    </>
  );
}
