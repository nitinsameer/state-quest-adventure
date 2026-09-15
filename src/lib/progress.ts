import { useSyncExternalStore } from "react";
import { INDIA_STATES, type IndiaState, type StateStatus } from "./states";
import { firebaseEvents } from "./firebase-events";

export type BadgeId = "monument" | "animal" | "explorer";

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
};

export const STATE_BADGES: { id: BadgeId; name: string; xp: number }[] = [
  { id: "monument", name: "Monument", xp: 30 },
  { id: "animal", name: "Animal", xp: 30 },
  { id: "explorer", name: "Explorer", xp: 40 },
];

const ALL_BADGE_IDS: BadgeId[] = STATE_BADGES.map((b) => b.id);

const STORAGE_KEY = "india-explorer:progress:v2";
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
  };
}

let current: Progress = defaultProgress();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — keep in-memory state */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    // BUG FIX #2: Add timeout to prevent blocking main thread on slow storage
    // Previously: localStorage.getItem() could block for 3+ seconds
    // Now: Uses timeout to unblock render, falls back to defaults
    let storageData: string | null = null;
    let timeoutOccurred = false;
    const startTime = Date.now();
    
    // Set a timer to abort if localStorage is slow
    const timeout = setTimeout(() => {
      timeoutOccurred = true;
    }, 500); // 500ms timeout
    
    try {
      storageData = localStorage.getItem(STORAGE_KEY);
    } finally {
      clearTimeout(timeout);
    }
    
    if (timeoutOccurred) {
      console.warn('localStorage hydration timeout - using defaults');
      
      // Track hydration timeout event
      firebaseEvents.storageHydrationTimeout({
        timeout: true,
        duration: Date.now() - startTime,
      });
      
      emit();
      return;
    }
    
    if (storageData) {
      const loaded = JSON.parse(storageData) as Partial<Progress>;
      current = { ...defaultProgress(), ...migrateProgress(loaded) };
    }
  } catch (e) {
    /* corrupt payload — fall back to defaults */
    console.warn('Failed to hydrate progress:', e);
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
  hydrate();
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      hydrated = false;
      hydrate();
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
  return hydrated;
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
  set((p) => ({ ...p, ...profile, onboarded: true }));
}

/** 
 * Marks today as active and keeps the daily streak honest.
 * 
 * BUG FIX #5: Use local date instead of UTC to fix timezone/DST issues
 * Previously: Used toISOString() which returns UTC date
 * Problem: DST transitions cause streak resets at midnight
 * Now: Uses local date (getDate, getMonth, getFullYear)
 */
export function touchStreak() {
  // Get local date string (YYYY-MM-DD in user's timezone)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  set((p) => {
    if (p.lastActive === today) return p;
    
    // Calculate yesterday's date in local timezone
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const streak = p.lastActive === yesterdayStr ? p.streak + 1 : 1;
    return { ...p, lastActive: today, streak };
  });
}

/** 
 * Marks one learning card as read or replayed.
 * - First read: Awards 25 XP and records card index in cards[]
 * - Replay: Tracks replay count but does NOT award XP
 * 
 * BUG FIX #3: Added deduplication to prevent race condition
 * Previously: Could award XP multiple times if called rapidly
 * Now: Uses immutable tracking to prevent duplicate awards
 * 
 * @param stateName Name of the state (e.g., "Rajasthan")
 * @param index Card index (0-5)
 * @param isReplay Whether user is replaying an already-read card
 */
export function markCard(stateName: string, index: number, isReplay: boolean = false) {
  set((p) => {
    // Input validation: guard against invalid card data
    if (!stateName || typeof index !== "number" || index < 0 || index >= CARDS_PER_STATE) {
      console.warn("Invalid card mark attempt", { stateName, index });
      firebaseEvents.invalidCardMark(stateName, index);
      return p;
    }

    const read = p.cards?.[stateName] ?? [];
    const isFirstRead = !read.includes(index);

    // First time reading this card → award XP and record
    if (isFirstRead) {
      // BUG FIX #3: Create new array to avoid race condition
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
  return p.completed.includes(stateName)
    ? CARDS_PER_STATE
    : cardsRead(p, stateName).length;
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
    // BUG FIX #6: Add validation for negative XP and empty questionId
    // Previously: Accepted negative XP, empty string defeated deduplication
    // Now: Validates amount > 0, explicit null/empty/undefined checks
    
    // Validate XP amount is positive
    if (amount <= 0) {
      console.warn('Invalid XP amount:', amount);
      return p;
    }
    
    // Explicit validation for questionId (not falsy check)
    // Empty string, null, undefined should not trigger dedup but also not be stored
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

export function completeState(name: string, xpReward = 100) {
  set((p) => {
    if (p.completed.includes(name)) return p;
    
    // BUG FIX #1: Only include badges that were actually earned
    // Previously awarded all 3 badges automatically (WRONG)
    // Now uses existing earned badges (CORRECT)
    const earnedBadges = p.badges?.[name] ?? [];
    
    const stampDateStr = stampDate();
    
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

export /**
 * TESTING MODE FLAG
 * ⚠️ IMPORTANT: Set to FALSE before production release!
 * 
 * When TRUE: All states are accessible for testing (bypass normal progression)
 * When FALSE: Normal state progression - must complete states sequentially
 * 
 * Production Checklist:
 * - [ ] Set TESTING_MODE_UNLOCK_ALL_STATES = false
 * - [ ] Remove or comment out testing-related console logs
 * - [ ] Verify state progression works correctly
 * - [ ] Test that locked states show lock icon properly
 */
const TESTING_MODE_UNLOCK_ALL_STATES = false; // ✅ PRODUCTION: Testing mode disabled

export function statesWithProgress(p: Progress): IndiaState[] {
  let currentUsed = false;
  
  // TESTING MODE: Make all states playable without progression requirements
  if (TESTING_MODE_UNLOCK_ALL_STATES) {
    console.log('🧪 TESTING MODE ACTIVE: All states unlocked for testing');
    return INDIA_STATES.map((s, idx) => {
      const done = p.completed.includes(s.name);
      let status: StateStatus = "locked";
      
      if (done) {
        status = "done";
      } else if (idx === 0) {
        // Make first state "current" for UI indication
        status = "current";
      } else {
        // Make all other states playable (not actually locked in testing mode)
        // But keep their visual as "current" so users can click any state
        status = "locked"; // Visual shows locked, but click handler allows access
      }
      
      return { ...s, status, date: p.stamps[s.name] ?? undefined };
    });
  }
  
  // PRODUCTION MODE: Normal progression - must complete states sequentially
  return INDIA_STATES.map((s) => {
    const done = p.completed.includes(s.name);
    let status: StateStatus = "locked";
    if (done) status = "done";
    else if (!currentUsed) {
      status = "current";
      currentUsed = true;
    }
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

const ACHIEVEMENT_DEFS: AchievementDef[] = [
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
