/**
 * Per-State Performance Badge System
 * 
 * For each state, users can earn up to 9 badges:
 * - 3 Core Badges (Monument, Animal, Explorer) - awarded on first completion
 * - 6 Performance Badges (Perfect Quiz, Speed Demon, Bookworm, First Try, Streak Builder, Master Learner)
 * 
 * Performance badges incentivize replays and deeper engagement with content
 */

import type { Progress } from "./progress";

export type StatePerformanceBadgeId = 
  | "perfect-quiz"      // 100% quiz score on any attempt
  | "speed-demon"       // Completed state in <20 mins
  | "bookworm"          // Read all 6 cards before quiz
  | "first-try"         // Perfect score on first quiz attempt (no retries)
  | "streak-builder"    // Completed state while on 7+ day streak
  | "master-learner";   // Replayed 3+ cards to 100% mastery

export type StatePerformanceMetrics = {
  stateName: string;
  completedAt: string;           // ISO timestamp
  timeToComplete: number;        // milliseconds
  quizAttempts: number;          // 1 = first try, 2+ = retries
  quizScore: number;             // 0-100
  cardsRead: number;             // 0-6
  cardsReplayed: number;         // How many cards replayed on this completion
  currentStreak: number;         // Streak length at time of completion
  earnedPerformanceBadges: StatePerformanceBadgeId[]; // Badges earned on this completion
};

export type StatePerformanceData = {
  [stateName: string]: StatePerformanceMetrics;
};

/**
 * Badge metadata for displaying info about each badge
 */
export const STATE_PERFORMANCE_BADGE_DEFS: Record<StatePerformanceBadgeId, {
  icon: string;
  name: string;
  description: string;
  category: "performance";
  requirement: string;
  dopamineType: "mastery" | "speed" | "thoroughness" | "skill" | "discipline" | "expertise";
}> = {
  "perfect-quiz": {
    icon: "⭐⭐⭐",
    name: "Perfect Quiz",
    description: "Score 100% on any quiz",
    category: "performance",
    requirement: "Quiz Score = 100%",
    dopamineType: "mastery",
  },
  "speed-demon": {
    icon: "⚡",
    name: "Speed Demon",
    description: "Complete state in under 20 minutes",
    category: "performance",
    requirement: "Time < 20 minutes",
    dopamineType: "speed",
  },
  "bookworm": {
    icon: "📚",
    name: "Bookworm",
    description: "Read all 6 cards before taking the quiz",
    category: "performance",
    requirement: "Read all 6 cards",
    dopamineType: "thoroughness",
  },
  "first-try": {
    icon: "🎯",
    name: "First Try",
    description: "Perfect score on first quiz attempt",
    category: "performance",
    requirement: "100% on 1st attempt",
    dopamineType: "skill",
  },
  "streak-builder": {
    icon: "🔥",
    name: "Streak Builder",
    description: "Complete while on 7+ day streak",
    category: "performance",
    requirement: "7+ day streak",
    dopamineType: "discipline",
  },
  "master-learner": {
    icon: "🧠",
    name: "Master Learner",
    description: "Replay 3+ cards and achieve 100%",
    category: "performance",
    requirement: "3+ replays + 100%",
    dopamineType: "expertise",
  },
};

/**
 * Calculate which performance badges should be awarded for a state completion
 * 
 * This is called when a state is completed to determine what badges user earned
 */
export function calculatePerformanceBadges(
  timeToComplete: number,
  quizAttempts: number,
  quizScore: number,
  cardsRead: number,
  cardsReplayed: number,
  currentStreak: number,
): StatePerformanceBadgeId[] {
  const earned: StatePerformanceBadgeId[] = [];

  // Perfect Quiz: 100% score on any attempt
  if (quizScore === 100) {
    earned.push("perfect-quiz");
  }

  // Speed Demon: Completed in < 20 minutes (1200000 ms)
  if (timeToComplete < 20 * 60 * 1000) {
    earned.push("speed-demon");
  }

  // Bookworm: Read all 6 cards
  if (cardsRead === 6) {
    earned.push("bookworm");
  }

  // First Try: Perfect score on first attempt
  if (quizAttempts === 1 && quizScore === 100) {
    earned.push("first-try");
  }

  // Streak Builder: 7+ day streak
  if (currentStreak >= 7) {
    earned.push("streak-builder");
  }

  // Master Learner: 3+ cards replayed AND 100% score
  if (cardsReplayed >= 3 && quizScore === 100) {
    earned.push("master-learner");
  }

  return earned;
}

/**
 * Get badge icon emoji
 */
export function getPerformanceBadgeIcon(badgeId: StatePerformanceBadgeId): string {
  return STATE_PERFORMANCE_BADGE_DEFS[badgeId]?.icon || "🏆";
}

/**
 * Get badge name
 */
export function getPerformanceBadgeName(badgeId: StatePerformanceBadgeId): string {
  return STATE_PERFORMANCE_BADGE_DEFS[badgeId]?.name || "Unknown Badge";
}

/**
 * Get all performance badge IDs
 */
export function getPerformanceBadgeIds(): StatePerformanceBadgeId[] {
  return Object.keys(STATE_PERFORMANCE_BADGE_DEFS) as StatePerformanceBadgeId[];
}

/**
 * Check if user has earned a specific performance badge for a state
 */
export function hasPerformanceBadge(
  performance: StatePerformanceData | undefined,
  stateName: string,
  badgeId: StatePerformanceBadgeId,
): boolean {
  if (!performance || !performance[stateName]) return false;
  return performance[stateName].earnedPerformanceBadges?.includes(badgeId) ?? false;
}

/**
 * Get total performance badges earned across all states
 */
export function getTotalPerformanceBadgesEarned(performance: StatePerformanceData | undefined): number {
  if (!performance) return 0;
  
  let total = 0;
  Object.values(performance).forEach(metrics => {
    total += metrics.earnedPerformanceBadges?.length ?? 0;
  });
  return total;
}

/**
 * Get performance badges for a specific state
 */
export function getPerformanceBadgesForState(
  performance: StatePerformanceData | undefined,
  stateName: string,
): StatePerformanceBadgeId[] {
  if (!performance || !performance[stateName]) return [];
  return performance[stateName].earnedPerformanceBadges ?? [];
}

/**
 * Get available (not yet earned) performance badges for a state
 */
export function getAvailablePerformanceBadges(
  performance: StatePerformanceData | undefined,
  stateName: string,
): StatePerformanceBadgeId[] {
  const earned = getPerformanceBadgesForState(performance, stateName);
  const allBadges = getPerformanceBadgeIds();
  return allBadges.filter(badge => !earned.includes(badge));
}

/**
 * Get progress toward each available badge for a state
 */
export function getPerformanceBadgeProgress(
  performance: StatePerformanceData | undefined,
  stateName: string,
): Record<StatePerformanceBadgeId, { earned: boolean; progress: number; max: number; message: string }> {
  const metrics = performance?.[stateName];
  if (!metrics) {
    return Object.fromEntries(
      getPerformanceBadgeIds().map(id => [
        id,
        { earned: false, progress: 0, max: 1, message: "Not started" },
      ])
    ) as Record<StatePerformanceBadgeId, { earned: boolean; progress: number; max: number; message: string }>;
  }

  // Initialize all badges with default values
  const result: Record<StatePerformanceBadgeId, { earned: boolean; progress: number; max: number; message: string }> = Object.fromEntries(
    getPerformanceBadgeIds().map(id => [
      id,
      { earned: false, progress: 0, max: 1, message: "Not started" },
    ])
  ) as Record<StatePerformanceBadgeId, { earned: boolean; progress: number; max: number; message: string }>;

  // Perfect Quiz
  result["perfect-quiz"] = {
    earned: metrics.earnedPerformanceBadges.includes("perfect-quiz"),
    progress: metrics.quizScore,
    max: 100,
    message: `${metrics.quizScore}% accuracy`,
  };

  // Speed Demon
  const speedMinutes = Math.round(metrics.timeToComplete / 60000);
  result["speed-demon"] = {
    earned: metrics.earnedPerformanceBadges.includes("speed-demon"),
    progress: Math.max(0, 20 - speedMinutes), // Progress toward 20 min goal
    max: 20,
    message: `${speedMinutes} minutes (target: <20)`,
  };

  // Bookworm
  result["bookworm"] = {
    earned: metrics.earnedPerformanceBadges.includes("bookworm"),
    progress: metrics.cardsRead,
    max: 6,
    message: `${metrics.cardsRead}/6 cards read`,
  };

  // First Try
  result["first-try"] = {
    earned: metrics.earnedPerformanceBadges.includes("first-try"),
    progress: metrics.quizAttempts === 1 && metrics.quizScore === 100 ? 1 : 0,
    max: 1,
    message: metrics.quizAttempts === 1 ? "Perfect on 1st try!" : `${metrics.quizAttempts} attempts (need 1)`,
  };

  // Streak Builder
  result["streak-builder"] = {
    earned: metrics.earnedPerformanceBadges.includes("streak-builder"),
    progress: Math.min(metrics.currentStreak, 7),
    max: 7,
    message: `${metrics.currentStreak} day streak (need 7+)`,
  };

  // Master Learner
  result["master-learner"] = {
    earned: metrics.earnedPerformanceBadges.includes("master-learner"),
    progress: Math.min(metrics.cardsReplayed, 3),
    max: 3,
    message: `${metrics.cardsReplayed} cards replayed (need 3+) + 100%`,
  };

  return result;
}

/**
 * Get state performance metrics for a specific state
 */
export function getStatePerformance(
  progress: Progress,
  stateName: string,
): StatePerformanceMetrics | undefined {
  return progress.statePerformance?.[stateName];
}
