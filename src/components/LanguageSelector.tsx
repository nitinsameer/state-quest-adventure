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
      <div className="px-3 py-1 rounded-2xl bg-white/80 text-sm font-semibold text-blue-600">
        {currentDisplayName}
      </div>
    );
  }

  // Multiple languages - show as dropdown button
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-1 rounded-2xl bg-white/80 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:bg-white/90 transition-all active:scale-95"
        title="Switch language"
      >
        <span>{currentDisplayName}</span>
        <span className="text-xs">▼</span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-lg z-50 min-w-[160px] overflow-hidden border border-blue-100">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onLanguageChange(lang);
                setShowDropdown(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm font-semibold transition-colors ${
                lang === currentLanguage
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
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
