import type { Progress, StatePerformance, PerformanceBadgeId, PerformanceBadgeConfig } from "./progress";
import { PERFORMANCE_BADGES, CARDS_PER_STATE } from "./progress";

/**
 * Performance badge unlock checker
 * Determines which performance badges should be earned based on state performance data
 */

type BadgeCheckResult = {
  badgeId: PerformanceBadgeId;
  unlocked: boolean;
  progress: number; // Current progress toward unlock (0-100)
  requirement: string; // Human-readable requirement
};

/**
 * Check if Perfect Quiz badge should be unlocked (3 perfect scores in this state)
 */
function checkPerfectQuiz(statePerf: StatePerformance): BadgeCheckResult {
  const perfectCount = statePerf.perfectQuizzes || 0;
  return {
    badgeId: "perfect-quiz",
    unlocked: perfectCount >= 3,
    progress: Math.min((perfectCount / 3) * 100, 100),
    requirement: `${perfectCount}/3 perfect scores`,
  };
}

/**
 * Check if Speed Demon badge should be unlocked (2 quizzes in <60 seconds)
 */
function checkSpeedDemon(statePerf: StatePerformance): BadgeCheckResult {
  const speedRuns = (statePerf.quizTimes || []).filter((time) => time < 60).length;
  return {
    badgeId: "speed-demon",
    unlocked: speedRuns >= 2,
    progress: Math.min((speedRuns / 2) * 100, 100),
    requirement: `${speedRuns}/2 sub-60s quizzes`,
  };
}

/**
 * Check if Bookworm badge should be unlocked (read all 6 learning cards)
 */
function checkBookworm(statePerf: StatePerformance): BadgeCheckResult {
  const cardsRead = (statePerf.cardsRead || []).length;
  const allCardsRead = cardsRead >= CARDS_PER_STATE; // Typically 6 cards per state
  return {
    badgeId: "bookworm",
    unlocked: allCardsRead,
    progress: Math.min((cardsRead / CARDS_PER_STATE) * 100, 100),
    requirement: `${cardsRead}/${CARDS_PER_STATE} cards read`,
  };
}

/**
 * Check if First Try badge should be unlocked (complete state with 0 replays)
 */
function checkFirstTry(statePerf: StatePerformance): BadgeCheckResult {
  const noReplaysUsed = statePerf.totalReplays === 0 || !statePerf.hasReplay;
  return {
    badgeId: "first-try",
    unlocked: noReplaysUsed,
    progress: noReplaysUsed ? 100 : 0,
    requirement: noReplaysUsed ? "Completed without replays" : "Used replays",
  };
}

/**
 * Check if Streak Builder badge should be unlocked (5-day consecutive visit streak)
 */
function checkStreakBuilder(statePerf: StatePerformance): BadgeCheckResult {
  const streakDays = statePerf.maxConsecutiveDays || 0;
  return {
    badgeId: "streak-builder",
    unlocked: streakDays >= 5,
    progress: Math.min((streakDays / 5) * 100, 100),
    requirement: `${streakDays}/5 day streak`,
  };
}

/**
 * Check if Master Learner badge should be unlocked
 * Requirements: All 6 cards read AND all quizzes answered with 100% average
 */
function checkMasterLearner(statePerf: StatePerformance): BadgeCheckResult {
  const cardsRead = (statePerf.cardsRead || []).length;
  const allCardsRead = cardsRead >= CARDS_PER_STATE;
  const perfectQuizzes = statePerf.perfectQuizzes || 0;
  
  // Master learner requires: all cards read + multiple perfect quiz scores
  // This incentivizes both reading and perfect quiz performance
  const hasMastery = allCardsRead && perfectQuizzes >= 2;
  
  return {
    badgeId: "master-learner",
    unlocked: hasMastery,
    progress: hasMastery ? 100 : Math.min(
      ((cardsRead / CARDS_PER_STATE) * 50) + ((Math.min(perfectQuizzes, 2) / 2) * 50),
      100
    ),
    requirement: allCardsRead && perfectQuizzes >= 2
      ? "100% mastery achieved"
      : `${cardsRead}/${CARDS_PER_STATE} cards, ${perfectQuizzes}/2 perfect quizzes`,
  };
}

/**
 * Check all performance badges for a state
 * Returns which badges are newly unlocked, partially progressed, or not yet earned
 */
export function checkAllPerformanceBadges(
  statePerf: StatePerformance
): BadgeCheckResult[] {
  return [
    checkPerfectQuiz(statePerf),
    checkSpeedDemon(statePerf),
    checkBookworm(statePerf),
    checkFirstTry(statePerf),
    checkStreakBuilder(statePerf),
    checkMasterLearner(statePerf),
  ];
}

/**
 * Detect newly unlocked badges by comparing old and new results
 */
export function getNewlyUnlockedPerformanceBadges(
  statePerf: StatePerformance
): PerformanceBadgeId[] {
  const alreadyEarned = new Set(statePerf.earnedBadges || []);
  
  return checkAllPerformanceBadges(statePerf)
    .filter((result) => result.unlocked && !alreadyEarned.has(result.badgeId))
    .map((result) => result.badgeId);
}

/**
 * Get badge progress for UI display (for in-progress badges)
 */
export function getPerformanceBadgeProgress(
  statePerf: StatePerformance,
  badgeId: PerformanceBadgeId
): BadgeCheckResult | null {
  const result = checkAllPerformanceBadges(statePerf).find((r) => r.badgeId === badgeId);
  return result || null;
}

/**
 * Get all badge configs with unlock status and progress
 */
export function getPerformanceBadgesWithStatus(
  statePerf: StatePerformance
): Array<PerformanceBadgeConfig & BadgeCheckResult> {
  const checks = checkAllPerformanceBadges(statePerf);
  
  return PERFORMANCE_BADGES.map((badgeConfig) => {
    const checkResult = checks.find((c) => c.badgeId === badgeConfig.id)!;
    return {
      ...badgeConfig,
      ...checkResult,
    };
  });
}
