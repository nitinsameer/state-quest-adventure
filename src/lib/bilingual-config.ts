/**
 * Bilingual States Configuration
 * 
 * Central source of truth for which states support bilingual content.
 * This allows scaling to multiple states without changing core logic.
 * 
 * Each state can have multiple language variants (en + native language).
 * Benchmark: Andhra Pradesh (English + Telugu)
 * 
 * Adding a new bilingual state:
 * 1. Add entry to BILINGUAL_STATES below
 * 2. Ensure content in states.json has {en: {...}, langCode: {...}} format for all cards
 * 3. Update LanguageToggle component if adding 3+ languages for a state
 * 4. Test language toggle in learning hub
 * 5. Verify quiz uses English (by design)
 */

import type { LanguageCode } from "@/components/LanguageToggle";

export interface BilingualStateConfig {
  stateName: string;
  /** Available language codes for this state */
  languages: LanguageCode[];
  /** Native/primary language for TTS and default display */
  nativeLanguage: LanguageCode;
  /** Display name of native language */
  nativeLanguageName: string;
}

/**
 * All bilingual states
 * 
 * Benchmark Pattern (Andhra Pradesh):
 * - English + Telugu
 * - Content stored as {en: {...}, te: {...}} in states.json
 * - Language toggle in learning hub only
 * - Quiz always in English
 * - User can switch in learning hub, state not persisted
 * 
 * To add new bilingual state:
 * 1. Duplicate AP pattern in states.json (create {en: {...}, langCode: {...}})
 * 2. Add entry to this array
 * 3. Deploy (UI automatically shows language toggle)
 */
export const BILINGUAL_STATES: BilingualStateConfig[] = [
  // Existing 6 states
  {
    stateName: "Andhra Pradesh",
    languages: ["en", "te"],
    nativeLanguage: "te",
    nativeLanguageName: "Telugu",
  },
  {
    stateName: "Gujarat",
    languages: ["en", "gu"],
    nativeLanguage: "gu",
    nativeLanguageName: "Gujarati",
  },
  {
    stateName: "Karnataka",
    languages: ["en", "kn"],
    nativeLanguage: "kn",
    nativeLanguageName: "Kannada",
  },
  {
    stateName: "Maharashtra",
    languages: ["en", "mr"],
    nativeLanguage: "mr",
    nativeLanguageName: "Marathi",
  },
  {
    stateName: "Tamil Nadu",
    languages: ["en", "ta"],
    nativeLanguage: "ta",
    nativeLanguageName: "Tamil",
  },
  {
    stateName: "West Bengal",
    languages: ["en", "bn"],
    nativeLanguage: "bn",
    nativeLanguageName: "Bengali",
  },

  // New 30 states/UTs
  // Group 1: Hindi-speaking states
  {
    stateName: "Rajasthan",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Madhya Pradesh",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Uttar Pradesh",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Bihar",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Jharkhand",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Uttarakhand",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Haryana",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Delhi",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Andaman & Nicobar Islands",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },

  // Group 2: Odisha, Kerala, Telangana
  {
    stateName: "Odisha",
    languages: ["en", "or"],
    nativeLanguage: "or",
    nativeLanguageName: "Odia",
  },
  {
    stateName: "Kerala",
    languages: ["en", "ml"],
    nativeLanguage: "ml",
    nativeLanguageName: "Malayalam",
  },
  {
    stateName: "Telangana",
    languages: ["en", "te"],
    nativeLanguage: "te",
    nativeLanguageName: "Telugu",
  },

  // Group 3: Western states
  {
    stateName: "Goa",
    languages: ["en", "kok"],
    nativeLanguage: "kok",
    nativeLanguageName: "Konkani",
  },
  {
    stateName: "Punjab",
    languages: ["en", "pa"],
    nativeLanguage: "pa",
    nativeLanguageName: "Punjabi",
  },

  // Group 4: Himalayan & Northeast states
  {
    stateName: "Himachal Pradesh",
    languages: ["en", "hi"],
    nativeLanguage: "hi",
    nativeLanguageName: "Hindi",
  },
  {
    stateName: "Assam",
    languages: ["en", "as"],
    nativeLanguage: "as",
    nativeLanguageName: "Assamese",
  },
  {
    stateName: "Arunachal Pradesh",
    languages: ["en"],
    nativeLanguage: "en",
    nativeLanguageName: "English",
  },
  {
    stateName: "Manipur",
    languages: ["en", "mni"],
    nativeLanguage: "mni",
    nativeLanguageName: "Meitei",
  },
  {
    stateName: "Meghalaya",
    languages: ["en", "kha"],
    nativeLanguage: "kha",
    nativeLanguageName: "Khasi",
  },
  {
    stateName: "Mizoram",
    languages: ["en", "miz"],
    nativeLanguage: "miz",
    nativeLanguageName: "Mizo",
  },
  {
    stateName: "Nagaland",
    languages: ["en"],
    nativeLanguage: "en",
    nativeLanguageName: "English",
  },

  // Group 5: Chhattisgarh
  {
    stateName: "Chhattisgarh",
    languages: ["en", "hne"],
    nativeLanguage: "hne",
    nativeLanguageName: "Chhattisgarhi",
  },

  // Union Territories
  {
    stateName: "Jammu & Kashmir",
    languages: ["en", "ks"],
    nativeLanguage: "ks",
    nativeLanguageName: "Kashmiri",
  },
  {
    stateName: "Ladakh",
    languages: ["en", "lbj"],
    nativeLanguage: "lbj",
    nativeLanguageName: "Ladakhi",
  },
  {
    stateName: "Sikkim",
    languages: ["en", "ne"],
    nativeLanguage: "ne",
    nativeLanguageName: "Nepali",
  },
  {
    stateName: "Tripura",
    languages: ["en", "bn"],
    nativeLanguage: "bn",
    nativeLanguageName: "Bengali",
  },
  {
    stateName: "Puducherry",
    languages: ["en", "ta"],
    nativeLanguage: "ta",
    nativeLanguageName: "Tamil",
  },
  {
    stateName: "Chandigarh",
    languages: ["en", "pa"],
    nativeLanguage: "pa",
    nativeLanguageName: "Punjabi",
  },
  {
    stateName: "Lakshadweep",
    languages: ["en", "ml"],
    nativeLanguage: "ml",
    nativeLanguageName: "Malayalam",
  },
  {
    stateName: "Dadra & Nagar Haveli and Daman & Diu",
    languages: ["en", "gu"],
    nativeLanguage: "gu",
    nativeLanguageName: "Gujarati",
  },
];

/**
 * Check if a state is bilingual
 * 
 * @param stateName - State name to check
 * @returns true if state has multiple languages
 * 
 * Usage:
 * ```tsx
 * if (isBilingual("Andhra Pradesh")) {
 *   // Show language toggle
 * }
 * ```
 */
export function isBilingual(stateName: string): boolean {
  return BILINGUAL_STATES.some((state) => state.stateName === stateName);
}

/**
 * Get available languages for a state
 * 
 * @param stateName - State name
 * @returns Array of language codes, defaults to ["en"] if not bilingual
 * 
 * Usage:
 * ```tsx
 * const langs = getAvailableLanguages("Andhra Pradesh"); // ["en", "te"]
 * const langs = getAvailableLanguages("Delhi"); // ["en"]
 * ```
 */
export function getAvailableLanguages(stateName: string): LanguageCode[] {
  const state = BILINGUAL_STATES.find((s) => s.stateName === stateName);
  return state?.languages ?? ["en"];
}

/**
 * Get native language for a state
 * 
 * @param stateName - State name
 * @returns Native language code, defaults to "en" if not bilingual
 * 
 * Usage:
 * ```tsx
 * const native = getNativeLanguage("Andhra Pradesh"); // "te"
 * const native = getNativeLanguage("Delhi"); // "en"
 * ```
 */
export function getNativeLanguage(stateName: string): LanguageCode {
  const state = BILINGUAL_STATES.find((s) => s.stateName === stateName);
  return state?.nativeLanguage ?? "en";
}

/**
 * Get bilingual state config
 * 
 * @param stateName - State name
 * @returns Config object or undefined if not bilingual
 */
export function getBilingualStateConfig(
  stateName: string
): BilingualStateConfig | undefined {
  return BILINGUAL_STATES.find((s) => s.stateName === stateName);
}
