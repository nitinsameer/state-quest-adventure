import statesData from './content/states.json';

/**
 * Enhanced state content with kid-friendly data for each card.
 * Content is loaded from centralized JSON file: src/lib/content/states.json
 */

export type CardContent = {
  title: string;
  emoji: string;
  mainText: string;
  keyFacts: string[] | AgeTaggedContent[];
  narration: string;
  coolFacts?: string[] | AgeTaggedContent[];
  didYouKnow?: string | AgeTaggedContent;
  tryThis?: string | AgeTaggedContent;
};

// Age-tagged content type for age-based filtering
export type AgeTaggedContent = {
  text: string;
  minAge: number;
  maxAge: number;
};

// Language variant type for bilingual states (e.g., Andhra Pradesh with en/te)
export type LanguageVariant = Record<string, CardContent>; // e.g., { en: CardContent, te: CardContent }

// For backward compatibility, CardType can be either a single CardContent or language variants
export type CardType = CardContent | LanguageVariant;

export type StateEnrichedContent = {
  stateName: string;
  languageCode?: string; // e.g., "te" for Telugu, "hi" for Hindi - used for state-native TTS
  capital: CardType;
  language: CardType;
  food: CardType;
  places: CardType;
  animal: CardType;
  funFact: CardType;
};

/**
 * Helper function to get the correct card content based on language
 * Handles both old format (CardContent directly) and new format (language variants)
 * 
 * @param cardContent - The card content (either CardContent or LanguageVariant)
 * @param language - The language to retrieve ("en", "te", etc.)
 * @returns The appropriate CardContent for the language
 */
export function getCardContentByLanguage(cardContent: CardType, language: string): CardContent {
  // If it's a language variant (has 'en', 'te', etc. keys)
  if (typeof cardContent === 'object' && !('title' in cardContent)) {
    const variant = cardContent as LanguageVariant;
    return variant[language] ?? variant['en'] ?? Object.values(variant)[0];
  }
  // Otherwise it's a direct CardContent
  return cardContent as CardContent;
}

// Load all state contents from JSON
export const ALL_STATE_CONTENTS: Record<string, StateEnrichedContent> = {};

// Initialize from JSON
Object.entries(statesData.states).forEach(([stateName, stateData]) => {
  ALL_STATE_CONTENTS[stateName] = stateData as StateEnrichedContent;
});

export function getStateContent(stateName: string): StateEnrichedContent | null {
  return ALL_STATE_CONTENTS[stateName] ?? null;
}

/**
 * Get the language code for a state's native language.
 * Used for TTS to play narration in the state's native language.
 * Falls back to "en" if not specified.
 * 
 * @param stateName - The name of the state
 * @returns Language code (e.g., "te" for Telugu, "hi" for Hindi, "en" for fallback)
 */
export function getStateLanguageCode(stateName: string): string {
  const content = getStateContent(stateName);
  return content?.languageCode ?? "en"; // Default to English if not specified
}

/**
 * Get card content with language support
 * For bilingual states, returns content in specified language
 * For other states, returns the card content as-is
 * 
 * @param stateName - The name of the state
 * @param cardType - The type of card ("capital", "language", "food", etc.)
 * @param language - The language to retrieve ("en", "te", etc.) - defaults to "en"
 * @returns The card content for the specified language, or null if not found
 */
export function getCardContent(
  stateName: string,
  cardType: 'capital' | 'language' | 'food' | 'places' | 'animal' | 'funFact',
  language: string = 'en'
): CardContent | null {
  const stateContent = getStateContent(stateName);
  if (!stateContent) return null;

  const card = stateContent[cardType];
  if (!card) return null;

  return getCardContentByLanguage(card, language);
}

/**
 * Convert age band string to numeric age for comparison
 * Used for age-based content filtering
 * 
 * @param ageBand - Age band string (e.g., "3-5", "6-7", "8-9", "10-12")
 * @returns Numeric age (middle of the range) for comparison
 */
function getNumericAge(ageBand: string): number {
  switch (ageBand) {
    case "3-5":
      return 4;    // Sprout: midpoint of 3-5
    case "6-7":
      return 6.5;  // Seedling: midpoint of 6-7
    case "8-9":
      return 8.5;  // Sapling: midpoint of 8-9
    case "10-12":
      return 11;   // Mighty Tree: midpoint of 10-12
    default:
      return 8.5;  // Default to Sapling (8-9) if unknown
  }
}

/**
 * Filter array content based on age band
 * Returns only items where: minAge <= userAge <= maxAge
 * 
 * @param content - Array of strings or AgeTaggedContent objects
 * @param ageBand - User's age band (e.g., "3-5", "6-7", "8-9", "10-12")
 * @returns Array of strings filtered by age appropriateness
 */
function filterByAge(content: (string | AgeTaggedContent)[] | undefined, ageBand: string): string[] {
  if (!content) return [];

  const userAge = getNumericAge(ageBand);
  
  return content
    .filter((item) => {
      // If it's a string (old format), show it to everyone
      if (typeof item === 'string') return true;
      
      // If it's age-tagged, check if user's age falls within range
      const tagged = item as AgeTaggedContent;
      return userAge >= tagged.minAge && userAge <= tagged.maxAge;
    })
    .map((item) => {
      // Extract text from age-tagged content or return string as-is
      return typeof item === 'string' ? item : (item as AgeTaggedContent).text;
    });
}

/**
 * Filter a single fact (didYouKnow or tryThis) based on age band
 * 
 * @param content - Single fact (string or AgeTaggedContent)
 * @param ageBand - User's age band
 * @returns Fact text or empty string if not age-appropriate
 */
function filterFactByAge(content: string | AgeTaggedContent | undefined, ageBand: string): string {
  if (!content) return '';
  
  // If it's a string (old format), show it to everyone
  if (typeof content === 'string') return content;
  
  // If it's age-tagged, check if user's age falls within range
  const userAge = getNumericAge(ageBand);
  const tagged = content as AgeTaggedContent;
  
  if (userAge >= tagged.minAge && userAge <= tagged.maxAge) {
    return tagged.text;
  }
  
  return '';
}

/**
 * Get card content filtered by age and language
 * Returns content appropriate for the user's age band
 * 
 * @param stateName - Name of the state
 * @param cardType - Type of card ("capital", "language", "food", etc.)
 * @param language - Language code ("en", "te", etc.)
 * @param ageBand - User's age band ("3-5", "6-7", "8-9", "10-12")
 * @returns Age-filtered CardContent or null if not found
 */
export function getCardContentByAge(
  stateName: string,
  cardType: 'capital' | 'language' | 'food' | 'places' | 'animal' | 'funFact',
  language: string = 'en',
  ageBand: string = '8-9'  // Default to Sapling if not provided
): CardContent | null {
  const content = getCardContent(stateName, cardType, language);
  if (!content) return null;

  // Filter age-appropriate content
  return {
    title: content.title,
    emoji: content.emoji,
    mainText: content.mainText,
    keyFacts: filterByAge(content.keyFacts, ageBand),
    narration: content.narration,
    coolFacts: filterByAge(content.coolFacts, ageBand),
    didYouKnow: filterFactByAge(content.didYouKnow, ageBand),
    tryThis: filterFactByAge(content.tryThis, ageBand),
  };
}
