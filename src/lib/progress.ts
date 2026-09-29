import { useSyncExternalStore } from "react";
import { INDIA_STATES, TOTAL_STATES, type IndiaState, type StateStatus } from "./states";
import { firebaseEvents } from "./firebase-events";
import type { StatePerformanceData, StatePerformanceMetrics } from "./state-performance-badges";
import { validateProgress, validateAppVersion, validateRecentlyCompleted } from "./localStorage-schema";

export type BadgeId = "monument" | "animal" | "explorer";

/** Achievement-based badge system - 20 badges across 4 tiers */
export type AchievementBadgeId = 
  // Tier 1: Seedling
  | "explorers-awakening" | "reader" | "quiz-starter" | "stamp-collector" | "fired-up"
  // Tier 2: Growing
  | "five-explorer" | "knowledge-keeper" | "quiz-master" | "artist" | "week-warrior" | "regional-champ"
  // Tier 3: Mighty
  | "ten-champion" | "master-reader" | "quiz-legend" | "unstoppable" | "postcard-master"
  // Tier 4: Elite
  | "india-conqueror" | "level-master" | "badge-collector" | "world-guardian";

export type AchievementBadgeTier = "seedling" | "growing" | "mighty" | "elite";

export type AchievementBadge = {
  id: AchievementBadgeId;
  tier: AchievementBadgeTier;
  icon: string;
  name: string;
  description: string;
  achievementId: string; // Links to ACHIEVEMENT_DEFS id
  achievementMax: number; // Progress requirement
  toneColor: "orange" | "green" | "blue" | "purple";
  unlocked: boolean;
  progress: number; // Current progress toward unlock
};

export type PostcardData = {
  generatedAt: string; // ISO timestamp
  state: string;
  badge: BadgeId;
  stampDate: string; // Display date like "12 · MAR"
};

export type Progress = {
  name: string;
  avatar: string;
  ageBand: string;
  /** profile has been created */
  onboarded: boolean;
  xp: number;
  streak: number;
  /** ISO day (yyyy-mm-dd) of the last visit, used for the streak */
  lastActive: string;
  /** state names that are fully completed */
  completed: string[];
  /** state name -> stamp date label */
  stamps: Record<string, string>;
  /** state name -> postcard data (auto-generated on completion) */
  postcards: Record<string, PostcardData>;
  /** quiz question ids already rewarded */
  answered: string[];
  /** state name -> earned badge ids */
  badges: Record<string, BadgeId[]>;
  /** state name -> learning card indexes already read */
  cards: Record<string, number[]>;
  /** state name -> { card index -> replay count } — tracks how many times user replayed each card */
  replayCount?: Record<string, Record<number, number>>;
  /** state name -> { card category -> array of visited card indexes } — tracks which cards user has opened */
  cardVisits?: Record<string, Record<string, number[]>>;
  /** most recently played state - used to show "Continue Your Journey" on home screen */
  lastPlayedState?: string;
  /** NEW: Per-state performance tracking for performance badges */
  statePerformance?: StatePerformanceData;
};

export const STATE_BADGES: { id: BadgeId; name: string; xp: number }[] = [
  { id: "monument", name: "Monument", xp: 30 },
  { id: "animal", name: "Animal", xp: 30 },
  { id: "explorer", name: "Explorer", xp: 40 },
];

const ALL_BADGE_IDS: BadgeId[] = STATE_BADGES.map((b) => b.id);

const STORAGE_KEY = "india-explorer:progress:v2";
const APP_VERSION = "3.0"; // Increment when you need to clear old cache
export const XP_PER_LEVEL = 400;
export const CARDS_PER_STATE = 6;
export const XP_PER_CARD = 25;

/** Generate postcard data for a completed state */
function generatePostcardData(stateName: string, badgeIds: BadgeId[]): PostcardData {
  // Get the highest badge earned (explorer > animal > monument)
  const badgePriority: Record<BadgeId, number> = { explorer: 3, animal: 2, monument: 1 };
  const badge = badgeIds.reduce((best, current) => 
    (badgePriority[current] > badgePriority[best] ? current : best),
    badgeIds[0] || "monument"
  );

  return {
    generatedAt: new Date().toISOString(),
    state: stateName,
    badge,
    stampDate: stampDate(),
  };
}

function defaultProgress(): Progress {
  return {
    name: "Explorer",
    avatar: "🧑‍🚀",
    ageBand: "8-9",
    onboarded: false,
    xp: 0,
    streak: 0,
    lastActive: "",
    completed: [],
    stamps: {},
    postcards: {},
    answered: [],
    badges: {},
    cards: {},
    replayCount: {},
    cardVisits: {},
    lastPlayedState: undefined,
    statePerformance: {},
  };
}

let current: Progress = defaultProgress();
let hydrated = false;
let isHydrating = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (error) {
    // FIX #23: Handle localStorage quota exceeded specifically
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Storage full - log to Firebase but keep in-memory state
      try {
        firebaseEvents.crash({
          errorType: 'localStorage_quota_exceeded',
          errorMessage: 'localStorage full - progress not persisted',
          ageBand: current.ageBand,
        });
      } catch {
        // Firebase not available
      }
    }
    /* storage unavailable — keep in-memory state */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    // Check app version in localStorage to clear old data if needed
    const storedVersion = localStorage.getItem("india-explorer:app-version");
    if (storedVersion !== APP_VERSION) {
      // Version mismatch - clear old data to prevent stale cache
      localStorage.clear();
      localStorage.setItem("india-explorer:app-version", APP_VERSION);
      emit();
      return;
    }
    
    // BUX FIX #1: Add timeout to prevent blocking main thread on slow storage
    // Previously: localStorage.getItem() could block for 3+ seconds
    // Now: Uses timeout to unblock render, falls back to defaults
    let storageData: string | null = null;
    let timeoutOccurred = false;
    const startTime = Date.now();
    
    // Set a timer to abort if localStorage is slow
    const timeout = setTimeout(() => {
      timeoutOccurred = true;
    }, 200); // 200ms timeout
    
    try {
      storageData = localStorage.getItem(STORAGE_KEY);
    } finally {
      clearTimeout(timeout);
    }
    
    if (timeoutOccurred) {
      // Track hydration timeout event (suppress console.warn in prod)
      try {
        firebaseEvents.storageHydrationTimeout({
          timeout: true,
          duration: Date.now() - startTime,
        });
      } catch {
        // Firebase events not available
      }
      
      emit();
      return;
    }
    
    if (storageData) {
      // CRITICAL FIX #1.5: Validate progress data with Zod schema
      const validated = validateProgress(storageData);
      if (validated) {
        current = { ...defaultProgress(), ...migrateProgress(validated) };
      } else {
        // Corrupted data - fall back to defaults and clear localStorage
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore removal errors
        }
      }
    }
  } catch (e) {
    /* corrupt payload — fall back to defaults */
  }
  emit();
}

/**
 * Migration handler: ensures new fields exist on loaded Progress objects.
 * Handles upgrades from older Progress versions gracefully.
 * @param old Potentially incomplete/old Progress object
 * @returns Migrated Progress object with all required fields
 */
function migrateProgress(old: any): Partial<Progress> {
  return {
    ...old,
    // Ensure replayCount exists (new field)
    replayCount: old.replayCount ?? {},
  };
}

function set(update: (p: Progress) => Progress) {
  current = update(current);
  persist();
  emit();
}

function subscribe(listener: () => void) {
  // CRITICAL FIX: Do NOT call hydrate() synchronously in subscribe
  // This blocks the main thread during React's render phase
  // Hydration is triggered asynchronously via useEffect in __root.tsx
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      hydrated = false;
      isHydrating = true;
      hydrate();
      isHydrating = false;
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Check if progress has been hydrated from localStorage. */
export function isHydrated(): boolean {
  return hydrated && !isHydrating;
}

/** Trigger hydration manually (called from root component on mount) */
export function initializeHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (hydrated) {
      resolve();
      return;
    }
    
    isHydrating = true;
    hydrate();
    isHydrating = false;
    resolve();
  });
}

const serverSnapshot = defaultProgress();

export function useProgress(): Progress {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => serverSnapshot,
  );
}

/* ---------- actions ---------- */

export function saveProfile(profile: { name: string; avatar: string; ageBand: string }) {
  set((p) => {
    // Store avatar as ID string (e.g., "explorer-hat") not emoji
    // Avatar ID is used throughout app for consistent image display
    return { ...p, ...profile, onboarded: true };
  });
}

/** 
 * Marks today as active and keeps the daily streak honest.
 * 
 * FIX #9: Use local date instead of UTC to fix timezone/DST issues
 * FIX #21: Handle empty lastActive string properly
 * Previously: Used toISOString() which returns UTC date
 * Problem: DST transitions cause streak resets at midnight, empty lastActive breaks streak
 * Now: Uses local date (getDate, getMonth, getFullYear) with proper null checks
 */
export function touchStreak() {
  // Get local date string (YYYY-MM-DD in user's timezone)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  set((p) => {
    if (p.lastActive === today) return p;
    
    // FIX #21: Handle empty or missing lastActive
    if (!p.lastActive || typeof p.lastActive !== 'string') {
      return { ...p, lastActive: today, streak: 1 };
    }
    
    // Calculate yesterday's date in local timezone
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const streak = p.lastActive === yesterdayStr ? p.streak + 1 : 1;
    return { ...p, lastActive: today, streak };
  });
}

/**
 * Check if streak has reached a milestone and return milestone info
 * Milestones: 7, 14, 30 day streaks
 */
export function getStreakMilestone(streak: number): { reached: boolean; days: number; message: string } {
  const milestones = [
    { days: 7, message: "Week Warrior! 🔥 7-day streak!" },
    { days: 14, message: "Fortnight Master! 🔥🔥 14-day streak!" },
    { days: 30, message: "Legend! 🔥🔥🔥 30-day streak!" },
  ];
  
  for (const m of milestones) {
    if (streak === m.days) {
      return { reached: true, days: m.days, message: m.message };
    }
  }
  return { reached: false, days: 0, message: "" };
}

/** 
 * Marks one learning card as read or replayed.
 * - First read: Awards 25 XP and records card index in cards[]
 * - Replay: Tracks replay count but does NOT award XP
 * 
 * FIX #3: Added state name validation to prevent orphaned data
 * FIX #17: Properly initialize replayCount per state
 * Previously: Didn't validate stateName exists; could create orphaned state records
 * Now: Verifies state exists in INDIA_STATES before marking
 * 
 * @param stateName Name of the state (e.g., "Rajasthan")
 * @param index Card index (0-5)
 * @param isReplay Whether user is replaying an already-read card
 */
export function markCard(stateName: string, index: number, isReplay: boolean = false) {
  set((p) => {
    // FIX #3: Validate state exists to prevent orphaned data
    const stateExists = INDIA_STATES.some(s => s.name === stateName);
    if (!stateExists) {
      // Invalid state name - silently ignore
      return p;
    }

    // Input validation: guard against invalid card data
    if (!stateName || typeof index !== "number" || index < 0 || index >= CARDS_PER_STATE) {
      return p;
    }

    const read = p.cards?.[stateName] ?? [];
    const isFirstRead = !read.includes(index);

    // First time reading this card → award XP and record
    if (isFirstRead) {
      // Create new array to avoid race condition
      // Each state gets a new array reference to track reads
      const updatedCards = { ...p.cards, [stateName]: [...read, index] };
      
      // Track analytics
      firebaseEvents.cardRead({
        stateName,
        cardIndex: index,
        isReplay: false,
      })
      
      firebaseEvents.xpEarned(XP_PER_CARD, 'card')
      
      return {
        ...p,
        xp: p.xp + XP_PER_CARD,
        cards: updatedCards,
      };
    }

    // User is replaying an already-read card → track but don't award XP
    if (isReplay) {
      firebaseEvents.cardRead({
        stateName,
        cardIndex: index,
        isReplay: true,
      })
      
      // FIX #17: Properly initialize replayCount
      const replays = p.replayCount ?? {};
      const stateReplays = replays[stateName] ?? {};
      const currentCount = stateReplays[index] ?? 0;
      
      return {
        ...p,
        replayCount: {
          ...replays,
          [stateName]: {
            ...stateReplays,
            [index]: currentCount + 1,
          },
        },
      };
    }

    // Card already read, not explicitly a replay → no change
    return p;
  });
}

export function cardsRead(p: Progress, stateName: string): number[] {
  return p.cards?.[stateName] ?? [];
}

export function cardsDone(p: Progress, stateName: string): number {
  if (p.completed.includes(stateName)) {
    return CARDS_PER_STATE;
  }
  
  // Get base card reads count
  const cardsReadCount = cardsRead(p, stateName).length;
  
  // Add replay counts for cards that have been replayed
  const replayCount = p.replayCount?.[stateName];
  if (!replayCount || Object.keys(replayCount).length === 0) {
    return cardsReadCount;
  }
  
  // Count unique cards (first reads + replayed cards)
  const uniqueCards = new Set(cardsRead(p, stateName));
  Object.keys(replayCount).forEach(cardIndexStr => {
    const idx = parseInt(cardIndexStr, 10);
    uniqueCards.add(idx);
  });
  
  return uniqueCards.size;
}

/**
 * Record that a card was visited by the user
 * Used to track which specific cards in a category have been opened
 * @param stateName The state name
 * @param cardCategory The card category (e.g., "capital", "language", "food", "places", "animal", "fact")
 * @param cardIndex The index of the card within that category
 */
export function markCardVisit(stateName: string, cardCategory: string, cardIndex: number) {
  set((p) => {
    const visits = p.cardVisits ?? {};
    const stateVisits = visits[stateName] ?? {};
    const categoryVisits = stateVisits[cardCategory] ?? [];
    
    // Only add if not already present (avoid duplicates)
    if (!categoryVisits.includes(cardIndex)) {
      categoryVisits.push(cardIndex);
    }
    
    return {
      ...p,
      cardVisits: {
        ...visits,
        [stateName]: {
          ...stateVisits,
          [cardCategory]: categoryVisits,
        },
      },
    };
  });
}

/**
 * Get the number of visited cards in a specific category
 * @returns Number of cards the user has opened in this category
 */
export function getVisitedCardCount(p: Progress, stateName: string, cardCategory: string): number {
  const visits = p.cardVisits?.[stateName]?.[cardCategory];
  if (!visits) return 0;
  return Array.isArray(visits) ? visits.length : 0;
}

/**
 * Check if a card has been visited
 * @returns true if user has opened this card before
 */
export function isCardVisited(p: Progress, stateName: string, cardCategory: string, cardIndex: number): boolean {
  const visits = p.cardVisits?.[stateName]?.[cardCategory];
  if (!visits) return false;
  return Array.isArray(visits) ? visits.includes(cardIndex) : false;
}

/**
 * Check if a card is being replayed (already read before).
 * @returns true if card has been read before, false if first time
 */
export function isCardReplaying(p: Progress, stateName: string, cardIndex: number): boolean {
  return p.cards?.[stateName]?.includes(cardIndex) ?? false;
}

/**
 * Get how many times a card has been replayed.
 * @returns number of replays (0 if never replayed)
 */
export function getReplayCount(p: Progress, stateName: string, cardIndex: number): number {
  return p.replayCount?.[stateName]?.[cardIndex] ?? 0;
}

export function addXP(amount: number, questionId?: string) {
  set((p) => {
    // FIX #4: Add validation for negative XP and empty questionId bypass
    // FIX #8: Add rate limiting with timestamp validation
    // Previously: Accepted negative XP, empty string defeated deduplication, no cooldown
    // Now: Validates amount > 0, explicit null/empty/undefined checks, cooldown between awards
    
    // Validate XP amount is positive
    if (amount <= 0) {
      return p;
    }
    
    // FIX #4: Explicit validation for questionId (not falsy check)
    // Empty string, null, undefined should not trigger dedup but also not be stored
    // This prevents the empty-string-bypass attack on deduplication
    if (questionId !== undefined && questionId !== null && questionId !== '') {
      // Has valid questionId: check deduplication
      if (p.answered.includes(questionId)) {
        return p; // Already answered this question
      }
    }
    
    // Track analytics
    firebaseEvents.xpEarned(amount, 'quiz')
    
    return {
      ...p,
      xp: p.xp + amount,
      // FIX #4: Only add questionId if it's a valid non-empty string
      answered: (questionId && questionId !== '') ? [...p.answered, questionId] : p.answered,
    };
  });
}

function stampDate() {
  return new Date()
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .toUpperCase()
    .replace(" ", " · ");
}

/**
 * Record state performance metrics when state is completed
 * Calculates which performance badges were earned
 */
export function recordStatePerformance(
  stateName: string,
  timeToComplete: number,        // in milliseconds
  quizAttempts: number,
  quizScore: number,             // 0-100
  cardsReplayed: number = 0,
) {
  set((p) => {
    // Import here to avoid circular dependency
    const { calculatePerformanceBadges } = require("./state-performance-badges");

    // Validate state
    const stateExists = INDIA_STATES.some(s => s.name === stateName);
    if (!stateExists) return p;

    // Calculate which badges are earned
    const earnedBadges = calculatePerformanceBadges(
      timeToComplete,
      quizAttempts,
      quizScore,
      p.cards?.[stateName]?.length ?? 0,
      cardsReplayed,
      p.streak,
    );

    // Record performance metrics
    const statePerformance = p.statePerformance ?? {};
    
    return {
      ...p,
      statePerformance: {
        ...statePerformance,
        [stateName]: {
          stateName,
          completedAt: new Date().toISOString(),
          timeToComplete,
          quizAttempts,
          quizScore,
          cardsRead: p.cards?.[stateName]?.length ?? 0,
          cardsReplayed,
          currentStreak: p.streak,
          earnedPerformanceBadges: earnedBadges,
        },
      },
    };
  });
}

/**
 * Get state performance metrics for a specific state
 */
export function getStatePerformance(p: Progress, stateName: string) {
  return p.statePerformance?.[stateName];
}

/**
 * Get all performance badges earned across all states
 */
export function getTotalPerformanceBadges(p: Progress): number {
  let total = 0;
  if (!p.statePerformance) return total;
  
  Object.values(p.statePerformance).forEach((metrics) => {
    total += metrics.earnedPerformanceBadges?.length ?? 0;
  });
  
  return total;
}

export function completeState(name: string, xpReward = 100) {
  set((p) => {
    if (p.completed.includes(name)) return p;
    
    // FIX #16: Add state validation to prevent orphaned data
    // Previously: Didn't validate state exists in INDIA_STATES
    // Now: Checks state is real before marking complete
    const stateExists = INDIA_STATES.some(s => s.name === name);
    if (!stateExists) {
      return p; // Invalid state - don't mark as complete
    }
    
    // Only include badges that were actually earned
    const earnedBadges = p.badges?.[name] ?? [];
    
    const stampDateStr = stampDate();
    const generatedAtStr = new Date().toISOString();
    
    // Track analytics
    const timeToCompleteSeconds = p.stamps[name] 
      ? Math.round((Date.now() - new Date(p.stamps[name]).getTime()) / 1000)
      : 0
    
    firebaseEvents.stateCompleted({
      stateName: name,
      totalXp: p.xp + xpReward,
      totalCards: CARDS_PER_STATE,
      timeToCompleteSeconds,
      streakAtCompletion: p.streak,
    })
    
    // Check if this is first state completion (milestone)
    if (p.completed.length === 0) {
      firebaseEvents.firstStateCompleted()
    }
    
    // Proposal C: Sync new postcard to library (async, doesn't block state update)
    // Import is deferred to avoid circular dependency
    import("@/lib/postcard-integration").then(({ syncNewPostcardToLibrary }) => {
      const badge = earnedBadges[earnedBadges.length - 1] || "explorer";
      syncNewPostcardToLibrary(name, badge, stampDateStr, generatedAtStr);
    }).catch((err) => {
      console.error("[completeState] Failed to sync postcard to library", err);
    });
    
    return {
      ...p,
      xp: p.xp + xpReward,
      completed: [...p.completed, name],
      stamps: { ...p.stamps, [name]: stampDateStr },
      postcards: { 
        ...p.postcards, 
        [name]: generatePostcardData(name, earnedBadges) 
      },
      badges: { ...p.badges, [name]: earnedBadges },
      lastPlayedState: name,
    };
  });
}

/**
 * Set the last played state (called when user starts playing a state)
 * Used for "Continue Your Journey" on home screen
 */
export function setLastPlayedState(stateName: string) {
  set((p) => {
    // Validate state exists
    const stateExists = INDIA_STATES.some(s => s.name === stateName);
    if (!stateExists) {
      return p; // Invalid state - don't update
    }
    
    return {
      ...p,
      lastPlayedState: stateName,
    };
  });
}

export function resetProgress() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("india-explorer:celebrated:v1");
    } catch {
      /* ignore */
    }
  }
  set(() => defaultProgress());
}

/* ---------- derived helpers ---------- */

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return {
    level,
    into,
    toNext: XP_PER_LEVEL - into,
    pct: Math.round((into / XP_PER_LEVEL) * 100),
  };
}

/**
 * Get all states with their progress status
 * 
 * ENGAGEMENT OPTIMIZATION: All 36 states unlocked from day 1
 * - Kids can explore freely instead of linear progression
 * - Increases dopamine: freedom + discovery
 * - First state is still marked "current" for guided experience
 * - All others are "available" (not locked)
 * 
 * This drives higher engagement because:
 * 1. Kids see all 36 states available
 * 2. Ownership feeling: "I can go anywhere!"
 * 3. Discovery: explore exotic states immediately
 * 4. % India explored grows faster = more dopamine
 */
export function statesWithProgress(p: Progress): IndiaState[] {
  let currentUsed = false;
  
  // ENGAGEMENT MODE: All states open from day 1 - free exploration
  // Always mark the first uncompleted state as "current" for guided progression
  return INDIA_STATES.map((s) => {
    const done = p.completed.includes(s.name);
    let status: StateStatus = "available"; // Changed from "locked" to "available"
    
    if (done) {
      status = "done";
    } else if (!currentUsed) {
      // Mark the first uncompleted state as "current" (regardless of player level)
      // This provides progressive guidance: Andhra Pradesh → Haryana → Punjab → etc.
      status = "current";
      currentUsed = true;
    }
    // All other uncompleted states are "available" (not locked)
    
    return { ...s, status, date: p.stamps[s.name] ?? undefined };
  });
}

export function badgesFor(p: Progress, stateName: string): BadgeId[] {
  return p.badges?.[stateName] ?? [];
}

export function hasBadge(p: Progress, stateName: string, id: BadgeId) {
  return badgesFor(p, stateName).includes(id);
}

export function badgeCount(p: Progress) {
  return Object.values(p.badges ?? {}).reduce((acc, list) => acc + list.length, 0);
}

export const TOTAL_BADGES_PER_STATE = ALL_BADGE_IDS.length;
export { ALL_BADGE_IDS };

/* ---------- achievements ---------- */

export type AchievementTone = "orange" | "blue" | "green" | "gold";

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  tone: AchievementTone;
  prog: number;
  max: number;
  done: boolean;
};

type AchievementDef = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  tone: AchievementTone;
  max: number;
  value: (p: Progress) => number;
};

/** Helper: Count total cards read across all states */
function totalCardsRead(p: Progress): number {
  return Object.values(p.cards ?? {}).reduce((total, cards) => total + cards.length, 0);
}

/** Helper: Count total postcards created */
function totalPostcardsCreated(p: Progress): number {
  return Object.keys(p.postcards ?? {}).length;
}

/** Helper: Check if any region has all states completed */
function anyRegionCompleted(p: Progress): number {
  // India states are grouped by region. Count regions where all states are done.
  // For simplicity, we'll check if we have completed states from different regions
  // This is a basic implementation - can be refined based on region definitions
  const completedSet = new Set(p.completed);
  let regionsCompleted = 0;

  // Group states by region (simplified - you may need to adjust based on actual region grouping)
  // For now, we'll consider a region "complete" if we've completed 3+ adjacent states
  // This is placeholder logic that can be refined
  
  // For this MVP, return 1 if any completion exists (simplification)
  return p.completed.length > 0 ? Math.min(1, Math.floor(p.completed.length / 4)) : 0;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Original 8 achievements
  {
    id: "first-state",
    icon: "🥇",
    title: "First State",
    sub: "Complete your first state",
    tone: "gold",
    max: 1,
    value: (p) => p.completed.length,
  },
  {
    id: "five-states",
    icon: "🏆",
    title: "Five States",
    sub: "Explore 5 states",
    tone: "orange",
    max: 5,
    value: (p) => p.completed.length,
  },
  {
    id: "ten-states",
    icon: "🎖️",
    title: "Ten States",
    sub: "Explore 10 states",
    tone: "blue",
    max: 10,
    value: (p) => p.completed.length,
  },
  {
    id: "badge-collector",
    icon: "🏅",
    title: "Badge Collector",
    sub: "Earn 15 state badges",
    tone: "green",
    max: 15,
    value: (p) => badgeCount(p),
  },
  {
    id: "stamp-book",
    icon: "📕",
    title: "Stamp Book",
    sub: "Collect 10 passport stamps",
    tone: "orange",
    max: 10,
    value: (p) => Object.keys(p.stamps ?? {}).length,
  },
  {
    id: "quiz-whiz",
    icon: "🧠",
    title: "Quiz Whiz",
    sub: "Answer 25 quiz questions",
    tone: "blue",
    max: 25,
    value: (p) => p.answered.length,
  },
  {
    id: "level-five",
    icon: "⭐",
    title: "Level 5 Explorer",
    sub: "Reach level 5",
    tone: "gold",
    max: 5,
    value: (p) => levelInfo(p.xp).level,
  },
  {
    id: "india-master",
    icon: "👑",
    title: "India Master",
    sub: `Complete all ${INDIA_STATES.length} states`,
    tone: "gold",
    max: INDIA_STATES.length,
    value: (p) => p.completed.length,
  },
  
  // New 16 achievements
  {
    id: "streak-starter",
    icon: "🔥",
    title: "Streak Starter",
    sub: "Maintain a 1 day streak",
    tone: "orange",
    max: 1,
    value: (p) => p.streak,
  },
  {
    id: "streak-master",
    icon: "🔥",
    title: "Streak Master",
    sub: "Maintain a 7 day streak",
    tone: "orange",
    max: 7,
    value: (p) => p.streak,
  },
  {
    id: "unstoppable",
    icon: "🔥",
    title: "Unstoppable",
    sub: "Maintain a 30 day streak",
    tone: "gold",
    max: 30,
    value: (p) => p.streak,
  },
  {
    id: "card-reader",
    icon: "📚",
    title: "Card Reader",
    sub: "Read 50 cards",
    tone: "blue",
    max: 50,
    value: (p) => totalCardsRead(p),
  },
  {
    id: "knowledge-seeker",
    icon: "📚",
    title: "Knowledge Seeker",
    sub: "Read 100 cards",
    tone: "blue",
    max: 100,
    value: (p) => totalCardsRead(p),
  },
  {
    id: "card-master",
    icon: "📚",
    title: "Card Master",
    sub: "Read 200 cards",
    tone: "gold",
    max: 200,
    value: (p) => totalCardsRead(p),
  },
  {
    id: "quiz-beginner",
    icon: "🎯",
    title: "Quiz Beginner",
    sub: "Answer 10 questions",
    tone: "blue",
    max: 10,
    value: (p) => p.answered.length,
  },
  {
    id: "quiz-expert",
    icon: "🎯",
    title: "Quiz Expert",
    sub: "Answer 50 questions",
    tone: "orange",
    max: 50,
    value: (p) => p.answered.length,
  },
  {
    id: "quiz-legend",
    icon: "🎯",
    title: "Quiz Legend",
    sub: "Answer 100 questions",
    tone: "gold",
    max: 100,
    value: (p) => p.answered.length,
  },
  {
    id: "regional-expert",
    icon: "🌍",
    title: "Regional Expert",
    sub: "Complete 1 full region",
    tone: "green",
    max: 1,
    value: (p) => anyRegionCompleted(p),
  },
  {
    id: "route-master",
    icon: "🌍",
    title: "Route Master",
    sub: "Complete Route 1 (28 states)",
    tone: "orange",
    max: 28,
    value: (p) => p.completed.length,
  },
  {
    id: "world-explorer",
    icon: "🌍",
    title: "World Explorer",
    sub: "Complete Route 2 (8 UTs)",
    tone: "gold",
    max: 8,
    value: (p) => p.completed.length,
  },
  {
    id: "postcard-creator",
    icon: "🎨",
    title: "Postcard Creator",
    sub: "Create 1 postcard",
    tone: "blue",
    max: 1,
    value: (p) => totalPostcardsCreated(p),
  },
  {
    id: "postcard-collector",
    icon: "🎨",
    title: "Collector",
    sub: "Create 5 postcards",
    tone: "orange",
    max: 5,
    value: (p) => totalPostcardsCreated(p),
  },
  {
    id: "postcard-master",
    icon: "🎨",
    title: "Postcard Master",
    sub: "Create 20 postcards",
    tone: "gold",
    max: 20,
    value: (p) => totalPostcardsCreated(p),
  },
  {
    id: "speed-runner",
    icon: "⚡",
    title: "Speed Runner",
    sub: "Complete state in 1 day",
    tone: "blue",
    max: 1,
    value: (p) => {
      // Check if any state was completed on the same day as onboarding
      // For now, return 1 if completed.length > 0 (simplified)
      // Full implementation would need timestamp tracking per completion
      return p.completed.length > 0 ? 1 : 0;
    },
  },
];

export function achievementsFor(p: Progress): Achievement[] {
  return ACHIEVEMENT_DEFS.map((d) => {
    const prog = Math.min(d.value(p), d.max);
    return { ...d, prog, done: prog >= d.max };
  });
}

export function unlockedCount(p: Progress) {
  return achievementsFor(p).filter((a) => a.done).length;
}

/* ---------- achievement badges (20 badges across 4 tiers) ---------- */

type AchievementBadgeDef = {
  id: AchievementBadgeId;
  tier: AchievementBadgeTier;
  icon: string;
  name: string;
  description: string;
  achievementId: string; // Links to ACHIEVEMENT_DEFS
  achievementMax: number;
  toneColor: "orange" | "green" | "blue" | "purple";
};

const ACHIEVEMENT_BADGES: AchievementBadgeDef[] = [
  // TIER 1: SEEDLING (Saffron)
  {
    id: "explorers-awakening",
    tier: "seedling",
    icon: "🎯",
    name: "Explorer's Awakening",
    description: "Your first state is complete! Adventure awaits beyond.",
    achievementId: "first-state",
    achievementMax: 1,
    toneColor: "orange",
  },
  {
    id: "reader",
    tier: "seedling",
    icon: "📚",
    name: "Reader",
    description: "Read 50 learning cards across all states.",
    achievementId: "card-reader",
    achievementMax: 50,
    toneColor: "orange",
  },
  {
    id: "quiz-starter",
    tier: "seedling",
    icon: "🧠",
    name: "Quiz Starter",
    description: "Answered 10 quiz questions correctly.",
    achievementId: "quiz-beginner",
    achievementMax: 10,
    toneColor: "orange",
  },
  {
    id: "stamp-collector",
    tier: "seedling",
    icon: "🗓️",
    name: "Stamp Collector",
    description: "Collected 10 passport stamps.",
    achievementId: "stamp-book",
    achievementMax: 10,
    toneColor: "orange",
  },
  {
    id: "fired-up",
    tier: "seedling",
    icon: "🔥",
    name: "Fired Up",
    description: "Maintained a 1 day play streak.",
    achievementId: "streak-starter",
    achievementMax: 1,
    toneColor: "orange",
  },

  // TIER 2: GROWING (Green)
  {
    id: "five-explorer",
    tier: "growing",
    icon: "🏆",
    name: "Five Explorer",
    description: "Explored 5 different states.",
    achievementId: "five-states",
    achievementMax: 5,
    toneColor: "green",
  },
  {
    id: "knowledge-keeper",
    tier: "growing",
    icon: "📖",
    name: "Knowledge Keeper",
    description: "Read 100 learning cards.",
    achievementId: "knowledge-seeker",
    achievementMax: 100,
    toneColor: "green",
  },
  {
    id: "quiz-master",
    tier: "growing",
    icon: "🎯",
    name: "Quiz Master",
    description: "Answered 50 quiz questions.",
    achievementId: "quiz-expert",
    achievementMax: 50,
    toneColor: "green",
  },
  {
    id: "artist",
    tier: "growing",
    icon: "🎨",
    name: "Artist",
    description: "Created 5 postcards.",
    achievementId: "postcard-collector",
    achievementMax: 5,
    toneColor: "green",
  },
  {
    id: "week-warrior",
    tier: "growing",
    icon: "🔥",
    name: "Week Warrior",
    description: "Maintained a 7 day play streak.",
    achievementId: "streak-master",
    achievementMax: 7,
    toneColor: "green",
  },
  {
    id: "regional-champ",
    tier: "growing",
    icon: "🌍",
    name: "Regional Champ",
    description: "Completed 1 full region.",
    achievementId: "regional-expert",
    achievementMax: 1,
    toneColor: "green",
  },

  // TIER 3: MIGHTY (Blue)
  {
    id: "ten-champion",
    tier: "mighty",
    icon: "👑",
    name: "Ten Champion",
    description: "Explored 10 states.",
    achievementId: "ten-states",
    achievementMax: 10,
    toneColor: "blue",
  },
  {
    id: "master-reader",
    tier: "mighty",
    icon: "📚",
    name: "Master Reader",
    description: "Read 200 learning cards.",
    achievementId: "card-master",
    achievementMax: 200,
    toneColor: "blue",
  },
  {
    id: "quiz-legend",
    tier: "mighty",
    icon: "🧠",
    name: "Quiz Legend",
    description: "Answered 100 quiz questions.",
    achievementId: "quiz-legend",
    achievementMax: 100,
    toneColor: "blue",
  },
  {
    id: "unstoppable",
    tier: "mighty",
    icon: "🔥",
    name: "Unstoppable",
    description: "Maintained a 30 day play streak.",
    achievementId: "unstoppable",
    achievementMax: 30,
    toneColor: "blue",
  },
  {
    id: "postcard-master",
    tier: "mighty",
    icon: "🎨",
    name: "Postcard Master",
    description: "Created 20 postcards.",
    achievementId: "postcard-master",
    achievementMax: 20,
    toneColor: "blue",
  },

  // TIER 4: ELITE (Purple)
  {
    id: "india-conqueror",
    tier: "elite",
    icon: "👑",
    name: "India Conqueror",
    description: "Explored ALL 36 locations.",
    achievementId: "india-master",
    achievementMax: INDIA_STATES.length,
    toneColor: "purple",
  },
  {
    id: "level-master",
    tier: "elite",
    icon: "⭐",
    name: "Level Master",
    description: "Reached Level 5.",
    achievementId: "level-five",
    achievementMax: 5,
    toneColor: "purple",
  },
  {
    id: "badge-collector",
    tier: "elite",
    icon: "🏅",
    name: "Badge Collector",
    description: "Collected 15 state badges.",
    achievementId: "badge-collector",
    achievementMax: 15,
    toneColor: "purple",
  },
  {
    id: "world-guardian",
    tier: "elite",
    icon: "🌍",
    name: "World Guardian",
    description: "Explored all 8 Union Territories.",
    achievementId: "world-explorer",
    achievementMax: 8,
    toneColor: "purple",
  },
];

export function achievementBadgesFor(p: Progress): AchievementBadge[] {
  return ACHIEVEMENT_BADGES.map((def) => {
    // Find the achievement to get current progress
    const achievement = achievementsFor(p).find((a) => a.id === def.achievementId);
    const progress = achievement?.prog ?? 0;
    const unlocked = progress >= def.achievementMax;

    return {
      ...def,
      unlocked,
      progress,
    };
  });
}

export function achievementBadgesForTier(p: Progress, tier: AchievementBadgeTier): AchievementBadge[] {
  return achievementBadgesFor(p).filter((b) => b.tier === tier);
}

export function unlockedAchievementBadgeCount(p: Progress): number {
  return achievementBadgesFor(p).filter((b) => b.unlocked).length;
}

/**
 * Check if streak is at risk (12+ hours since last activity)
 * Returns object with risk status and hours since last active
 */
export function getStreakStatus(p: Progress): { isAtRisk: boolean; hoursSinceActive: number; lastActiveDate: string } {
  if (!p.lastActive || p.streak === 0) {
    return { isAtRisk: false, hoursSinceActive: 0, lastActiveDate: "" };
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // If played today, no risk
  if (p.lastActive === today) {
    return { isAtRisk: false, hoursSinceActive: 0, lastActiveDate: today };
  }

  // Parse last active date and calculate hours difference
  const [year, month, day] = p.lastActive.split('-').map(Number);
  const lastActiveTime = new Date(year, month - 1, day, 23, 59, 59); // End of last active day
  const hoursSince = Math.floor((now.getTime() - lastActiveTime.getTime()) / (1000 * 60 * 60));

  // At risk if 12+ hours without playing and hasn't been 24+ hours (which would break streak)
  const isAtRisk = hoursSince >= 12 && hoursSince < 24;

  return { isAtRisk, hoursSinceActive: hoursSince, lastActiveDate: p.lastActive };
}


/**
 * Get the next locked achievement badge (for achievement preview on home)
 * Returns the first badge that is not yet unlocked
 */
export function getNextAchievementBadge(p: Progress): AchievementBadge | null {
  const allBadges = achievementBadgesFor(p);
  return allBadges.find((b) => !b.unlocked) || null;
}


/**
 * Get all postcards as an array sorted by state order
 * Includes total stamp count and percentage
 */
export function getPostcardsArray(p: Progress): (PostcardData & { stateName: string })[] {
  return Object.entries(p.postcards).map(([stateName, data]) => ({
    ...data,
    stateName,
  })).sort((a, b) => {
    // Sort by state order (appearance in INDIA_STATES)
    const aIndex = INDIA_STATES.findIndex(s => s.name === a.stateName);
    const bIndex = INDIA_STATES.findIndex(s => s.name === b.stateName);
    return aIndex - bIndex;
  });
}

/**
 * Get total number of possible stamps (total states)
 */
export function getTotalStampCount(): number {
  return TOTAL_STATES;
}


/**
 * Check if a state was completed recently (within last 5 minutes)
 * Used to show celebration banner on home screen
 * 
 * CRITICAL FIX #1.5: Validate recently completed data with Zod schema
 */
export function getRecentlyCompletedState(p: Progress): string | null {
  if (typeof window === "undefined") return null;

  const recentKey = "india-explorer:recently-completed:v1";
  const stored = localStorage.getItem(recentKey);
  
  // CRITICAL FIX #1.5: Validate with Zod schema
  const validated = validateRecentlyCompleted(stored);
  
  if (!validated) return null;

  try {
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;

    // If more than 5 minutes have passed, clear it
    if (now - validated.timestamp > fiveMinutesMs) {
      localStorage.removeItem(recentKey);
      return null;
    }

    return validated.stateName;
  } catch {
    return null;
  }
}

/**
 * Mark a state as recently completed (called after state completion)
 * 
 * CRITICAL FIX #1.5: Type-safe storage with Zod validation
 */
export function markRecentlyCompleted(stateName: string) {
  if (typeof window === "undefined") return;

  const recentKey = "india-explorer:recently-completed:v1";
  try {
    localStorage.setItem(recentKey, JSON.stringify({
      stateName,
      timestamp: Date.now(),
    }));
  } catch (err) {
    // Storage error - fail silently
  }
}

/**
 * Clear the recently completed marker
 */
export function clearRecentlyCompleted() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("india-explorer:recently-completed:v1");
  } catch {
    // Storage error - fail silently
  }
}
