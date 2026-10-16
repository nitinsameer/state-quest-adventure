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
 * 6 geographic regions (28 states) + 1 Union Territories region (8 UTs) = 36 total
 */
export const REGIONS: Record<
  string,
  { name: string; emoji: string; gradient: string; states: IndiaState[] }
> = {
  north: {
    name: "Northern Region",
    emoji: "🏔️",
    gradient: "bg-warning",
    states: INDIA_STATES.filter((s) =>
      [
        "Punjab",
        "Haryana",
        "Himachal Pradesh",
        "Uttarakhand",
        "Uttar Pradesh",
        "Rajasthan",
      ].includes(s.name),
    ),
  },
  south: {
    name: "Southern Region",
    emoji: "🌴",
    gradient: "bg-accent-2",
    states: INDIA_STATES.filter((s) =>
      ["Andhra Pradesh", "Telangana", "Karnataka", "Kerala", "Tamil Nadu"].includes(s.name),
    ),
  },
  east: {
    name: "Eastern Region",
    emoji: "🌳",
    gradient: "bg-success",
    states: INDIA_STATES.filter((s) =>
      ["West Bengal", "Odisha", "Bihar", "Jharkhand"].includes(s.name),
    ),
  },
  central: {
    name: "Central Region",
    emoji: "🏞️",
    gradient: "bg-accent-4",
    states: INDIA_STATES.filter((s) => ["Madhya Pradesh", "Chhattisgarh"].includes(s.name)),
  },
  west: {
    name: "Western Region",
    emoji: "🌊",
    gradient: "bg-accent-2",
    states: INDIA_STATES.filter((s) => ["Gujarat", "Maharashtra", "Goa"].includes(s.name)),
  },
  northeast: {
    name: "Northeast Region",
    emoji: "⛰️",
    gradient: "bg-accent-1-soft",
    states: INDIA_STATES.filter((s) =>
      [
        "Assam",
        "Arunachal Pradesh",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Sikkim",
        "Tripura",
      ].includes(s.name),
    ),
  },
  unionTerritories: {
    name: "Union Territories",
    emoji: "🏛️",
    gradient: "bg-accent-5",
    states: INDIA_STATES.filter((s) =>
      [
        "Delhi",
        "Jammu & Kashmir",
        "Ladakh",
        "Chandigarh",
        "Puducherry",
        "Andaman & Nicobar Islands",
        "Lakshadweep",
        "Dadra & Nagar Haveli and Daman & Diu",
      ].includes(s.name),
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
export function getWeeklyStats(
  progress: Progress,
  today: Date = new Date(),
): { count: number; dates: string[] } {
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Simplified: would need lastActiveDate per state in real app
  // For now, return placeholder
  return { count: 3, dates: [] };
}

/**
 * Find which region a state belongs to
 * @param stateName Name of the state to find
 * @returns Object with regionKey and region data, or null if not found
 */
export function findRegionForState(
  stateName: string,
): { regionKey: keyof typeof REGIONS; region: (typeof REGIONS)[keyof typeof REGIONS] } | null {
  for (const [key, region] of Object.entries(REGIONS)) {
    if (region.states.some((s) => s.name === stateName)) {
      return { regionKey: key as keyof typeof REGIONS, region };
    }
  }
  return null;
}

/**
 * Count how many states in a region are completed
 * @param regionKey The region key (e.g., "north", "south")
 * @param completedStates Array of completed state names
 * @returns Number of completed states in this region
 */
export function countRegionCompleted(
  regionKey: keyof typeof REGIONS,
  completedStates: string[],
): number {
  const region = REGIONS[regionKey];
  return region.states.filter((s) => completedStates.includes(s.name)).length;
}

/**
 * Get "Up Next" states for a given current state
 * Shows states from the same region first, then moves to next region when region is complete
 * @param currentStateName Name of the current state
 * @param allStates Array of all states with their status
 * @param count How many states to return (default 2)
 * @returns Array of up next states
 */
export function getUpNext(
  currentStateName: string,
  allStates: IndiaState[],
  count: number = 2,
): IndiaState[] {
  // Find which region the current state belongs to
  let currentRegionKey: keyof typeof REGIONS | null = null;
  for (const [key, region] of Object.entries(REGIONS)) {
    if (region.states.some((s) => s.name === currentStateName)) {
      currentRegionKey = key as keyof typeof REGIONS;
      break;
    }
  }

  if (!currentRegionKey) return [];

  const currentRegion = REGIONS[currentRegionKey];

  // Get uncompleted states in the same region (excluding current)
  const sameRegionUp = allStates
    .filter(
      (s) =>
        currentRegion.states.some((rs) => rs.name === s.name) &&
        s.status !== "done" &&
        s.name !== currentStateName,
    )
    .slice(0, count);

  // If we have enough states from same region, return them
  if (sameRegionUp.length >= count) {
    return sameRegionUp;
  }

  // Otherwise, find next region and add states from there
  const regionOrder: (keyof typeof REGIONS)[] = [
    "south",
    "east",
    "central",
    "west",
    "northeast",
    "north",
    "unionTerritories",
  ];
  const currentIndex = regionOrder.indexOf(currentRegionKey);
  const nextRegionKey =
    currentIndex !== -1 && currentIndex + 1 < regionOrder.length
      ? regionOrder[currentIndex + 1]
      : null;

  if (!nextRegionKey) return sameRegionUp;

  const nextRegion = REGIONS[nextRegionKey];
  const nextRegionUp = allStates
    .filter((s) => nextRegion.states.some((rs) => rs.name === s.name) && s.status !== "done")
    .slice(0, count - sameRegionUp.length);

  return [...sameRegionUp, ...nextRegionUp];
}
