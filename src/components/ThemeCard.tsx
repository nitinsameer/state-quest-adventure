/**
 * ThemeCard Component - Reference Design Implementation
 *
 * Compact 50% size version with SVG backgrounds from theme-selector-svg-pack
 */

import { type Theme } from "@/lib/themes";
import { EMOJI } from "@/constants/emoji";
import { ThemeCardDecoration } from "./ThemeCardDecoration";

interface ThemeCardProps {
  theme: Theme;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ theme, isUnlocked, isSelected, onSelect }: ThemeCardProps) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col transition-all duration-200 w-full ${
        !prefersReducedMotion ? "active:scale-95" : ""
      }`}
      style={{
        aspectRatio: "220 / 128",
        backgroundColor: "#fff",
        border: isSelected ? "2px solid #7c5cf0" : "1px solid #e8e8f0",
        boxShadow: isSelected ? "0 4px 12px rgba(124, 92, 240, 0.12)" : "0 1px 4px rgba(0, 0, 0, 0.06)",
        opacity: !isUnlocked ? 0.65 : 1,
        borderRadius: "max(24px, 8%)",
        overflow: "hidden",
      }}
    >
      {/* Preview Area - SVG Background + Content */}
      <div
        className={`relative flex flex-col items-center justify-center flex-1 ${
          !isUnlocked ? "grayscale" : ""
        }`}
        style={{
          backgroundColor: theme.previewTokens.bg,
          padding: "10px 11px",
          borderRadius: "max(23px, 7%)",
          overflow: "hidden",
        }}
      >
        {/* SVG Decoration Background - fills the entire preview */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <ThemeCardDecoration themeId={theme.id} theme={theme} />
        </div>

        {/* Content Layer - sits above SVG */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full">
          {/* Accent color dots */}
          <div className="flex gap-1.5" style={{ marginBottom: "2px" }}>
            <div
              className="rounded-full"
              style={{
                width: "clamp(3px, 1.5vw, 5px)",
                height: "clamp(3px, 1.5vw, 5px)",
                backgroundColor: theme.previewTokens.accent,
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: "clamp(3px, 1.5vw, 5px)",
                height: "clamp(3px, 1.5vw, 5px)",
                backgroundColor: theme.previewTokens.accent,
                opacity: 0.6,
              }}
            />
            <div
              className="rounded-full"
              style={{
                width: "clamp(3px, 1.5vw, 5px)",
                height: "clamp(3px, 1.5vw, 5px)",
                backgroundColor: theme.previewTokens.accent,
                opacity: 0.3,
              }}
            />
          </div>

          {/* Text preview - Aa */}
          <div
            className="font-extrabold leading-tight"
            style={{ 
              color: theme.previewTokens.text, 
              fontSize: "clamp(12px, 3vw, 18px)",
            }}
          >
            Aa
          </div>
        </div>

        {/* Lock Icon - Top Left of preview */}
        {!isUnlocked && (
          <div
            className="absolute top-1 left-1 flex items-center justify-center z-20"
            style={{
              fontSize: "clamp(14px, 2.5vw, 20px)",
              textShadow: "0 0 2px rgba(255,255,255,0.8)",
            }}
          >
            {EMOJI.action.lock}
          </div>
        )}

        {/* Selection Checkmark - Top Right of preview (when selected) */}
        {isSelected && (
          <div
            className="absolute top-1 right-1 rounded-full flex items-center justify-center font-bold z-20 animate-bounce"
            style={{
              width: "clamp(16px, 4vw, 24px)",
              height: "clamp(16px, 4vw, 24px)",
              backgroundColor: "#10b981",
              color: "white",
              fontSize: "clamp(9px, 2vw, 14px)",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Footer - Theme Name + Selection Indicator */}
      <div
        className="flex items-center justify-between px-2 flex-shrink-0"
        style={{
          backgroundColor: "#fff",
          height: "30px",
          minHeight: "30px",
          borderTop: "0.5px solid #f0f0f5",
        }}
      >
        {/* Theme Name - left */}
        <h3
          className="font-bold flex-1 truncate"
          style={{
            color: isSelected ? "#7c5cf0" : "#2d2650",
            fontSize: "clamp(10px, 2vw, 13px)",
          }}
        >
          {theme.name}
        </h3>

        {/* Selection Indicator - right */}
        <div
          className="flex-shrink-0"
          style={{
            width: "clamp(14px, 2.5vw, 18px)",
            height: "clamp(14px, 2.5vw, 18px)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isSelected ? "none" : "1.5px solid #d0d0d8",
            backgroundColor: isSelected ? "#10b981" : "white",
            fontSize: "clamp(8px, 1.5vw, 11px)",
            fontWeight: "bold",
            color: isSelected ? "white" : "transparent",
            boxShadow: isSelected ? "0 0 6px rgba(16, 185, 129, 0.5)" : "none",
            marginLeft: "6px",
          }}
        >
          {isSelected ? "✓" : ""}
        </div>
      </div>
    </button>
  );
}
