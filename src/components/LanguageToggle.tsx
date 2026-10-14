/**
 * Language Toggle Component
 * Allows users to switch between English and native language for card content
 * Displays as a simple toggle button showing current language
 */

import { useState } from "react";

export type LanguageCode = "en" | "te" | "hi" | "ta" | "gu" | "mr" | "kn" | "ml" | "or" | "bn" | "pa" | "kok" | "as" | "mni" | "kha" | "miz" | "hne" | "ks" | "lbj" | "ne";

export interface LanguageToggleProps {
  /** Current selected language */
  currentLanguage: LanguageCode;
  /** Available languages for this state (e.g., ["en", "te"] for Andhra Pradesh) */
  availableLanguages: LanguageCode[];
  /** Callback when language changes */
  onLanguageChange: (language: LanguageCode) => void;
  /** Optional variant: "header" for compact header button, default is card button */
  variant?: "card" | "header";
}

/**
 * Map language codes to display names (in English for readability)
 * This way, anyone can understand which language they're switching to,
 * even if they don't speak that language yet.
 */
const LANGUAGE_DISPLAY_NAMES: Record<LanguageCode, string> = {
  en: "English",
  te: "Telugu",   // English name for Telugu
  hi: "Hindi",    // English name for Hindi
  ta: "Tamil",    // English name for Tamil
  gu: "Gujarati", // English name for Gujarati
  mr: "Marathi",  // English name for Marathi
  kn: "Kannada",  // English name for Kannada
  ml: "Malayalam",// English name for Malayalam
  or: "Odia",     // English name for Odia
  bn: "Bengali",  // English name for Bengali
  pa: "Punjabi",  // English name for Punjabi
  kok: "Konkani", // English name for Konkani
  as: "Assamese", // English name for Assamese
  mni: "Manipuri", // English name for Manipuri
  kha: "Khasi",   // English name for Khasi
  miz: "Mizoram", // English name for Mizoram
  hne: "Chhattisgarhi", // English name for Chhattisgarhi
  ks: "Kashmiri", // English name for Kashmiri
  lbj: "Ladakhi", // English name for Ladakhi
  ne: "Nepali",   // English name for Nepali
};

export function LanguageToggle({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  variant = "card",
}: LanguageToggleProps) {
  // Only show toggle if there's more than one language available
  if (availableLanguages.length <= 1) {
    return null;
  }

  // Find the other language (toggle between two languages)
  const otherLanguage = availableLanguages.find((lang) => lang !== currentLanguage);
  if (!otherLanguage) {
    return null;
  }

  const handleToggle = () => {
    onLanguageChange(otherLanguage);
  };

  const currentDisplayName = LANGUAGE_DISPLAY_NAMES[currentLanguage];
  const otherDisplayName = LANGUAGE_DISPLAY_NAMES[otherLanguage];

  // Header variant - compact button suitable for header
  if (variant === "header") {
    return (
      <button
        onClick={handleToggle}
        className="h-10 w-10 rounded-full bg-surface-card shadow-soft flex items-center justify-center text-lg transition-all active:scale-95 hover:shadow-md border border-info"
        title={`Switch to ${otherDisplayName}`}
      >
        {currentLanguage === "en" ? "ðŸ“–" : "ðŸŒ"}
      </button>
    );
  }

  // Single toggle chip - shows ONLY the current active language
  // Click to switch to the other language (acts like a toggle/switch)
  return (
    <div className="mt-(--space-0-25) flex items-center justify-center">
      <button
        onClick={handleToggle}
        className="px-(--padding-lg) py-(--padding-base) rounded-full text-sm font-bold transition-all ui-button ui-accent-2 text-ink shadow-md hover:shadow-lg active:scale-95"
        title={`Switch to ${otherDisplayName}`}
      >
        ðŸ“– {currentDisplayName}
      </button>
    </div>
  );
}


