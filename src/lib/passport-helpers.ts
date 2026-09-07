import { INDIA_STATES, type IndiaState } from "./states";
import { type Progress } from "./progress";

export type PassportVariant = "sprout" | "seedling" | "sapling" | "mighty-tree";

/**
 * Map ageBand to Passport design variant
 * @param ageBand User's age band (e.g., "3-5", "6-7", "8-9", "10-12")
 * @returns Passport variant to render
 */
export function getPassportVariant(ageBand: string = "8-9"): PassportVariant {
  switch (ageBand) {
    case "3-5":
      return "sprout";
    case "6-7":
      return "seedling";
    case "8-9":
      return "sapling";
    case "10-12":
      return "mighty-tree";
    default:
      return "sapling"; // Default to middle variant
  }
}

/**
 * Get states grouped by region for Seedling (6-7) variant
 */
export const REGIONS: Record<
  string,
  { name: string; emoji: string; gradient: string; states: IndiaState[] }
> = {
  north: {
    name: "Northern States",
    emoji: "🏔️",
    gradient: "from-orange-400 to-red-500",
    states: INDIA_STATES.filter((s) =>
      ["Rajasthan", "Gujarat", "Haryana", "Punjab", "Himachal Pradesh", "Uttarakhand", "Jammu & Kashmir", "Ladakh"].includes(s.name)
    ),
  },
  south: {
    name: "Southern States",
    emoji: "🌴",
    gradient: "from-teal-400 to-cyan-500",
    states: INDIA_STATES.filter((s) =>
      ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana"].includes(s.name)
    ),
  },
  east: {
    name: "Eastern States",
    emoji: "🌳",
    gradient: "from-green-400 to-emerald-500",
    states: INDIA_STATES.filter((s) =>
      ["West Bengal", "Odisha", "Bihar", "Jharkhand", "Assam"].includes(s.name)
    ),
  },
  west: {
    name: "Western States",
    emoji: "🌊",
    gradient: "from-blue-400 to-purple-500",
    states: INDIA_STATES.filter((s) => ["Goa", "Maharashtra"].includes(s.name)),
  },
  northeast: {
    name: "Northeast States",
    emoji: "⛰️",
    gradient: "from-pink-400 to-rose-500",
    states: INDIA_STATES.filter((s) =>
      ["Arunachal Pradesh", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura", "Chhattisgarh"].includes(s.name)
    ),
  },
  islands: {
    name: "Island States",
    emoji: "🏝️",
    gradient: "from-cyan-400 to-blue-500",
    states: INDIA_STATES.filter((s) =>
      ["Andaman & Nicobar", "Lakshadweep", "Puducherry", "Daman & Diu", "Chandigarh"].includes(s.name)
    ),
  },
};

export const REGION_KEYS = Object.keys(REGIONS) as (keyof typeof REGIONS)[];

/**
 * Get first N states for Sprout (3-5) variant
 * @param progress User progress
 * @param count Max states to show (default 6)
 */
export function getSproutStates(progress: Progress, count: number = 6): IndiaState[] {
  // Show states in order, mixing unlocked first, then locked
  const unlocked = INDIA_STATES.filter((s) => progress.completed.includes(s.name));
  const locked = INDIA_STATES.filter((s) => !progress.completed.includes(s.name));
  return [...unlocked.slice(0, count), ...locked.slice(0, count - unlocked.length)];
}

/**
 * Calculate progress percentage
 */
export function getProgressPercentage(progress: Progress): number {
  return Math.round((progress.completed.length / INDIA_STATES.length) * 100);
}

/**
 * Get milestone info for Mighty Tree (10-12) variant
 */
export interface Milestone {
  id: string;
  label: string;
  target: number;
  current: number;
  percentage: number;
}

export function getMilestones(progress: Progress): Milestone[] {
  const completed = progress.completed.length;
  
  return [
    {
      id: "ten-states",
      label: "10 States",
      target: 10,
      current: Math.min(completed, 10),
      percentage: Math.min((completed / 10) * 100, 100),
    },
    {
      id: "region-master",
      label: "Master 1 Region",
      target: 8,
      current: Math.min(completed, 8), // Simplified: assume ~8 per region
      percentage: Math.min((completed / 8) * 100, 100),
    },
    {
      id: "all-states",
      label: "Complete All 36",
      target: 36,
      current: completed,
      percentage: (completed / 36) * 100,
    },
  ];
}

/**
 * Format XP needed for next level
 */
export function getXpToNextLevel(currentXp: number, xpPerLevel: number = 400): number {
  const level = Math.floor(currentXp / xpPerLevel);
  const nextLevelXp = (level + 1) * xpPerLevel;
  return Math.max(0, nextLevelXp - currentXp);
}

/**
 * Get activity summary for week
 */
export function getWeeklyStats(progress: Progress, today: Date = new Date()): { count: number; dates: string[] } {
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  // Simplified: would need lastActiveDate per state in real app
  // For now, return placeholder
  return { count: 3, dates: [] };
}
