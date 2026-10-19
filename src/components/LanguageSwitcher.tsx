/**
 * LanguageSwitcher
 *
 * Compact flag-based language toggle component for bilingual states.
 * Shows side-by-side flag buttons (globe for English, flag for native language).
 *
 * Usage:
 * ```tsx
 * <LanguageSwitcher
 *   language="en"
 *   onChange={(lang) => setDisplayLanguage(lang)}
 * />
 * ```
 */

import React from "react";
import { EMOJI } from "@/constants/emoji";

interface LanguageSwitcherProps {
  /** Current language selection: 'en' or 'native' */
  language: "en" | "native";
  /** Callback when user selects a different language */
  onChange: (lang: "en" | "native") => void;
  /** Optional CSS class for additional styling */
  className?: string;
}

export function LanguageSwitcher({
  language,
  onChange,
  className = "",
}: LanguageSwitcherProps): React.JSX.Element {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {/* English button (Globe emoji) */}
      <button
        onClick={() => onChange("en")}
        style={{
          height: "48px",
          width: "48px",
          fontSize: "32px",
          cursor: "pointer",
          border: language === "en" ? "2px solid var(--color-primary)" : "2px solid transparent",
          background: "transparent",
          padding: "4px",
          opacity: language === "en" ? 1 : 0.5,
          transform: language === "en" ? "scale(1.0)" : "scale(0.9)",
          filter:
            language === "en" ? "drop-shadow(0 2px 4px var(--color-primary))" : "drop-shadow(none)",
          transition: "all 0.15s ease",
          borderRadius: "4px",
        }}
        aria-label="English"
        aria-pressed={language === "en"}
      >
        {EMOJI.language.globe}
      </button>

      {/* Native language button (Flag emoji) */}
      <button
        onClick={() => onChange("native")}
        style={{
          height: "48px",
          width: "48px",
          fontSize: "32px",
          cursor: "pointer",
          border:
            language === "native" ? "2px solid var(--color-primary)" : "2px solid transparent",
          background: "transparent",
          padding: "4px",
          opacity: language === "native" ? 1 : 0.5,
          transform: language === "native" ? "scale(1.0)" : "scale(0.9)",
          filter:
            language === "native"
              ? "drop-shadow(0 2px 4px var(--color-primary))"
              : "drop-shadow(none)",
          transition: "all 0.15s ease",
          borderRadius: "4px",
        }}
        aria-label="Native language"
        aria-pressed={language === "native"}
      >
        {EMOJI.language.indFlag}
      </button>
    </div>
  );
}
