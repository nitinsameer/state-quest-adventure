/**
 * Quiz Progress Persistence
 *
 * Stores and resumes in-progress quiz state per state.
 * Key: "india-explorer:quiz-progress:v1"
 *
 * Never sent to analytics. Expires after 7 days.
 */

import { validateQuizProgress, QuizProgressEntry, QuizProgress } from "./localStorage-schema";
import { debugError } from "./debug";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const QUIZ_PROGRESS_KEY = STORAGE_KEYS.quizProgress;
const EXPIRY_DAYS = 7;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Get all quiz progress entries
 */
export function getQuizProgress(): QuizProgress {
  const raw = localStorage.getItem(QUIZ_PROGRESS_KEY);
  return validateQuizProgress(raw);
}

/**
 * Get progress for a specific state
 */
export function getQuizProgressForState(stateName: string): QuizProgressEntry | null {
  const progress = getQuizProgress();
  const entry = progress[stateName];

  if (!entry) return null;

  // Check if expired (7 days old)
  const ageMs = Date.now() - entry.startedAt;
  if (ageMs > EXPIRY_MS) {
    clearQuizProgressForState(stateName);
    return null;
  }

  return entry;
}

/**
 * Save quiz progress after an answer
 * Called after every Check and every Next
 */
export function saveQuizProgress(
  stateName: string,
  index: number,
  correctCount: number,
  answers: { id: string; correct: boolean }[],
): void {
  try {
    const progress = getQuizProgress();
    const now = Date.now();

    // Get existing entry to preserve startedAt
    const existing = progress[stateName];
    const startedAt = existing?.startedAt || now;

    progress[stateName] = {
      index,
      correctCount,
      answers,
      startedAt,
      updatedAt: now,
    };

    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    debugError("quiz-progress", "Failed to save quiz progress", { stateName, error: err });
  }
}

/**
 * Clear quiz progress for a specific state (called when quiz finishes)
 */
export function clearQuizProgressForState(stateName: string): void {
  try {
    const progress = getQuizProgress();
    delete progress[stateName];
    localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
  } catch (err) {
    debugError("quiz-progress", "Failed to clear quiz progress", { stateName, error: err });
  }
}

/**
 * Clear all quiz progress (rarely needed)
 */
export function clearAllQuizProgress(): void {
  try {
    localStorage.setItem(QUIZ_PROGRESS_KEY, "{}");
  } catch (err) {
    debugError("quiz-progress", "Failed to clear all quiz progress", { error: err });
  }
}

/**
 * Clean up expired entries (call on app startup)
 */
export function cleanupExpiredQuizProgress(): void {
  try {
    const progress = getQuizProgress();
    const now = Date.now();
    let modified = false;

    for (const [stateName, entry] of Object.entries(progress)) {
      const ageMs = now - entry.startedAt;
      if (ageMs > EXPIRY_MS) {
        delete progress[stateName];
        modified = true;
      }
    }

    if (modified) {
      localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    }
  } catch (err) {
    debugError("quiz-progress", "Failed to cleanup expired quiz progress", { error: err });
  }
}
