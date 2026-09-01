import { useSyncExternalStore } from "react";
import { INDIA_STATES, type IndiaState, type StateStatus } from "./states";

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
  /** quiz question ids already rewarded */
  answered: string[];
  /** state name -> earned badge ids */
  badges: Record<string, BadgeId[]>;
  /** state name -> learning card indexes already read */
  cards: Record<string, number[]>;
};

export type BadgeId = "monument" | "animal" | "explorer";

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
    answered: [],
    badges: {},
    cards: {},
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) current = { ...defaultProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    /* corrupt payload — fall back to defaults */
  }
  emit();
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

/** Marks today as active and keeps the daily streak honest. */
export function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  set((p) => {
    if (p.lastActive === today) return p;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = p.lastActive === yesterday ? p.streak + 1 : 1;
    return { ...p, lastActive: today, streak };
  });
}

/** Marks one learning card of a state as read (awards XP the first time). */
export function markCard(stateName: string, index: number) {
  set((p) => {
    const read = p.cards?.[stateName] ?? [];
    if (read.includes(index)) return p;
    return {
      ...p,
      xp: p.xp + XP_PER_CARD,
      cards: { ...p.cards, [stateName]: [...read, index] },
    };
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

export function addXP(amount: number, questionId?: string) {
  set((p) => {
    if (questionId && p.answered.includes(questionId)) return p;
    return {
      ...p,
      xp: p.xp + amount,
      answered: questionId ? [...p.answered, questionId] : p.answered,
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
    return {
      ...p,
      xp: p.xp + xpReward,
      completed: [...p.completed, name],
      stamps: { ...p.stamps, [name]: stampDate() },
      badges: { ...p.badges, [name]: [...ALL_BADGE_IDS] },
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

export function statesWithProgress(p: Progress): IndiaState[] {
  let currentUsed = false;
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
