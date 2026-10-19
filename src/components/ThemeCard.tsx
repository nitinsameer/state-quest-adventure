/**
 * ThemeCard Component
 *
 * Individual theme card with animations, glow effects, and smooth transitions.
 * Features:
 * - Hover glow on unlocked cards
 * - Smooth scale and shadow transitions
 * - Unlock badge fade-in animation
 * - Sparkle/pulse on selection
 * - Full prefers-reduced-motion support
 */

import { useState, useEffect } from "react";
import { getUnlockBadgeInfo, formatUnlockCondition, type Theme } from "@/lib/themes";
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

  // Glow color from theme accent with 40% opacity
  const glowColor = theme.previewTokens.accent + "66";

  return (
    <>
      <style>{`
        @keyframes fadeInBadge {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ringPulse {
          0% {
            box-shadow: 0 0 0 0 ${theme.previewTokens.accent}40;
          }
          70% {
            box-shadow: 0 0 0 4px ${theme.previewTokens.accent}00;
          }
          100% {
            box-shadow: 0 0 0 4px ${theme.previewTokens.accent}00;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .badge-anim {
            animation: fadeInBadge 0.4s ease forwards;
          }
          .card-sparkle {
            animation: ringPulse 0.6s cubic-bezier(0.4, 0, 0.6, 1);
          }
        }
      `}</style>

      <button
        onClick={() => {
          if (isUnlocked) {
            onSelect();
          }
        }}
        disabled={!isUnlocked}
        className={`rounded-2xl p-3 flex flex-col min-h-[200px] border-4 ${
          isSelected && isUnlocked ? "border-accent-1" : "border-transparent"
        } ${!isUnlocked ? "cursor-not-allowed" : ""} ${!prefersReducedMotion ? "transition-all duration-200" : ""}`}
        style={{
          backgroundColor: theme.previewTokens.bg,
          transform: isSelected && isUnlocked ? "scale(1.04)" : "scale(1)",
          boxShadow:
            isSelected && isUnlocked
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          ...(sparkle && {
            animation: `ringPulse 0.6s cubic-bezier(0.4, 0, 0.6, 1)`,
          }),
        }}
      >
        {/* Preview Box - Fixed Height with glow effect */}
        <div
          className={`relative h-24 rounded-xl p-3 flex flex-col items-center justify-center gap-1 mb-2 ${
            !isUnlocked ? "opacity-50 grayscale" : ""
          } ${!prefersReducedMotion ? "transition-all duration-200" : ""}`}
          style={{
            backgroundColor: theme.previewTokens.accent + "20",
            border: `2px solid ${theme.previewTokens.accent}`,
            ...(isHovered &&
              isUnlocked &&
              !prefersReducedMotion && {
                boxShadow: `0 0 16px 4px ${glowColor}`,
              }),
          }}
          onMouseEnter={() => {
            if (isUnlocked) setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Lock Icon - Top Left of Preview Box */}
          {!isUnlocked && <div className="absolute top-2 left-2 text-lg">{EMOJI.action.lock}</div>}

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
          <div className="mt-auto pt-2 flex items-center gap-1 badge-anim">
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
    </>
  );
}
