/**
 * Language Selector Component
 * Displays current language with optional dropdown for language switching
 * Shows text label instead of icon-only toggle
 */

import { useState, useRef, useEffect } from "react";
import type { LanguageCode } from "./LanguageToggle";

const LANGUAGE_DISPLAY_NAMES: Record<LanguageCode, string> = {
  en: "English",
  te: "Telugu",
  hi: "Hindi",
  ta: "Tamil",
  gu: "Gujarati",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  bn: "Bengali",
  pa: "Punjabi",
  kok: "Konkani",
  as: "Assamese",
  mni: "Manipuri",
  kha: "Khasi",
  miz: "Mizoram",
  hne: "Chhattisgarhi",
  ks: "Kashmiri",
  lbj: "Ladakhi",
  ne: "Nepali",
};

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  availableLanguages: LanguageCode[];
  onLanguageChange: (language: LanguageCode) => void;
}

export function LanguageSelector({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
}: LanguageSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isBilingual = availableLanguages.length > 1;
  const currentDisplayName = LANGUAGE_DISPLAY_NAMES[currentLanguage];

  // Single language only - show as plain text
  if (!isBilingual) {
    return (
      <div className="px-(--padding-base) py-(--padding-xs) rounded-2xl bg-surface-card/80 text-sm font-semibold text-accent-1">
        {currentDisplayName}
      </div>
    );
  }

  // Multiple languages - show as dropdown button
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-(--padding-base) py-(--padding-xs) rounded-2xl bg-surface-card/80 flex items-center gap-(--gap-xs) text-sm font-semibold text-accent-1 hover:bg-surface-card/90 transition-all active:scale-95"
        title="Switch language"
      >
        <span>{currentDisplayName}</span>
        <span className="text-xs">▼</span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-(--space-0-25) right-0 bg-white rounded-2xl shadow-lg z-50 min-w-[160px] overflow-hidden border border-blue-100">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                setShowDropdown(false);
              }}
              className={`w-full px-(--padding-md) py-(--padding-xs) text-left text-sm font-semibold transition-colors ${
                lang === currentLanguage
                  ? "bg-accent-1-soft text-accent-1"
                  : "text-muted-foreground hover:bg-muted-light"
              }`}
            >
              {lang === currentLanguage ? "✓ " : "  "}
              {LANGUAGE_DISPLAY_NAMES[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

