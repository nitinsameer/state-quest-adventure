import statesData from './content/states.json';

/**
 * Enhanced state content with kid-friendly data for each card.
 * Content is loaded from centralized JSON file: src/lib/content/states.json
 */

export type CardContent = {
  title: string;
  emoji: string;
  mainText: string;
  keyFacts: string[];
  narration: string;
  coolFacts?: string[]; // Additional cool facts for expanded section
  didYouKnow?: string; // Single trivia fact
  tryThis?: string; // Activity suggestion
};

export type StateEnrichedContent = {
  stateName: string;
  capital: CardContent;
  language: CardContent;
  food: CardContent;
  places: CardContent;
  animal: CardContent;
  funFact: CardContent;
};

// Load all state contents from JSON
export const ALL_STATE_CONTENTS: Record<string, StateEnrichedContent> = {};

// Initialize from JSON
Object.entries(statesData.states).forEach(([stateName, stateData]) => {
  ALL_STATE_CONTENTS[stateName] = stateData as StateEnrichedContent;
});

export function getStateContent(stateName: string): StateEnrichedContent | null {
  return ALL_STATE_CONTENTS[stateName] ?? null;
}
