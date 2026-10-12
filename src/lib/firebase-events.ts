/**
 * Firebase Analytics Events Wrapper
 * Type-safe event logging with automatic null-safety
 * 
 * COPPA FIX #1.5: All events gated behind analytics consent check
 * COPPA FIX TASK 3: Reduced from 25 to 12 essential events
 * - Removed redundant/privacy-risk events: badgeEarned, firstBadgeEarned, cardExpanded
 * - Removed behavioral tracking: screenView, engagement, invalidCardMark
 * - Removed identity markers: profileCreated, permissionRequested
 * 
 * Remaining 12 events focused on learning & retention metrics only
 */

import { analytics, isFirebaseConfigured } from './firebase-init'
import { logEvent } from 'firebase/analytics'
import { appLogger } from './logger'
import { eventQueue } from './event-queue'
import { hasFeatureConsent } from './parental-consent'
import type { BadgeId } from './progress'

// FIX #10: Rate limiting and deduplication for events
const eventTimestamps = new Map<string, number>()
const EVENT_RATE_LIMITS: Record<string, number> = {
  'quiz_answer': 100, // Allow 100ms between quiz_answer events
  'card_read': 200, // Allow 200ms between card_read events
  'daily_visit': 3600000, // Only once per hour
  'session_start': 3600000, // Only once per hour
}

/**
 * Check if event should be rate limited
 */
function isRateLimited(eventName: string): boolean {
  const limit = EVENT_RATE_LIMITS[eventName]
  if (!limit) return false

  const lastTimestamp = eventTimestamps.get(eventName) || 0
  const now = Date.now()

  if (now - lastTimestamp < limit) {
    return true // Rate limited
  }

  eventTimestamps.set(eventName, now)
  return false
}

// Type-safe event parameters
interface QuizEventParams {
  stateName: string
  ageBand: string
  questionCount?: number
}

interface QuizAnswerParams {
  stateName: string
  questionId: string
  isCorrect: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface QuizCompleteParams {
  stateName: string
  questionsAnswered: number
  correctAnswers: number
  scorePercentage: number
  timeSpentSeconds: number
}

interface CardReadParams {
  stateName: string
  cardIndex: number
  isReplay: boolean
}

interface StateCompleteParams {
  stateName: string
  totalXp: number
  totalCards: number
  timeToCompleteSeconds: number
  streakAtCompletion: number
}

interface SessionStartParams {
  ageBand: string
  isReturningUser: boolean
  daysSinceLastActive?: number
}

interface DailyVisitParams {
  ageBand: string
  streak: number
  daysActive: number
  totalXp: number
}

interface CrashParams {
  errorType: string
  errorMessage: string
  stackTrace?: string
  ageBand?: string
}

interface StorageHydrationParams {
  timeout: boolean
  storedDataSizeBytes?: number
  duration?: number
}

/**
 * Safe event logging - handles Firebase not being initialized
 * COPPA FIX #1.5: Analytics consent check prevents tracking without consent
 * FIX #2: Uses offline queue for persistence and retry
 * FIX #10: Rate limiting to prevent quota overages
 */
function safeLogEvent<T extends Record<string, any>>(
  eventName: string,
  params?: T
): void {
  // COPPA FIX #1.5: Check analytics consent BEFORE any tracking
  // If consent not granted, silently skip event (don't queue it)
  if (!hasFeatureConsent('analytics')) {
    return
  }

  // FIX #10: Skip if rate limited
  if (isRateLimited(eventName)) {
    return
  }

  if (!isFirebaseConfigured) {
    // FIX #2: Queue event for later when offline or Firebase not configured
    eventQueue.enqueue(eventName, params)
    return
  }

  try {
    // FIX #25: Validate event parameters for correct types
    const sanitizedParams = validateAndSanitizeParams(params)

    if (analytics) {
      logEvent(analytics, eventName, sanitizedParams)
    } else {
      // Firebase not initialized yet - queue for retry
      eventQueue.enqueue(eventName, params)
    }

    // Also log locally for debugging
    appLogger.info('firebase_event', eventName, sanitizedParams)
  } catch (error) {
    // FIX #2: Queue failed event for retry
    eventQueue.enqueue(eventName, params)
  }
}

/**
 * FIX #25: Validate and sanitize event parameters
 * Ensures parameters are within acceptable ranges
 */
function validateAndSanitizeParams<T extends Record<string, any>>(
  params?: T
): T | undefined {
  if (!params) return undefined

  return Object.entries(params).reduce(
    (acc, [key, value]) => {
      let sanitizedValue = value

      // Truncate long strings
      if (typeof value === 'string' && value.length > 100) {
        sanitizedValue = value.substring(0, 100)
      }

      // Validate numbers
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) {
          sanitizedValue = 0
        }
        // Bounds check for percentage values
        if (key.includes('percentage') || key.includes('score')) {
          sanitizedValue = Math.max(0, Math.min(100, value))
        }
        // Ensure non-negative for counts
        if (key.includes('count') || key.includes('amount') || key.includes('total')) {
          sanitizedValue = Math.max(0, value)
        }
      }

      // Validate boolean values
      if (typeof value === 'boolean') {
        sanitizedValue = value
      }

      acc[key] = sanitizedValue
      return acc
    },
    {} as Record<string, any>
  ) as T
}

/**
 * Firebase Events API
 * 12 essential events focused on learning & retention
 * All methods return void and handle errors gracefully
 * 
 * COPPA Compliance: Only educationally-relevant metrics tracked
 */
export const firebaseEvents = {
  // ========== QUIZ EVENTS ==========
  /**
   * User starts a quiz
   */
  quizStart: (params: QuizEventParams): void => {
    safeLogEvent('quiz_start', {
      state_name: params.stateName,
      age_band: params.ageBand,
      question_count: params.questionCount || 0,
    })
  },

  /**
   * User answers a quiz question
   */
  quizAnswer: (params: QuizAnswerParams): void => {
    safeLogEvent('quiz_answer', {
      state_name: params.stateName,
      is_correct: params.isCorrect,
      difficulty: params.difficulty || 'medium',
    })
  },

  /**
   * User completes a quiz
   */
  quizComplete: (params: QuizCompleteParams): void => {
    safeLogEvent('quiz_complete', {
      state_name: params.stateName,
      questions_answered: params.questionsAnswered,
      correct_answers: params.correctAnswers,
      score_percentage: Math.round(params.scorePercentage),
      time_spent_seconds: Math.round(params.timeSpentSeconds),
    })
  },

  // ========== CARD/LEARNING EVENTS ==========
  /**
   * User reads a learning card
   */
  cardRead: (params: CardReadParams): void => {
    safeLogEvent('card_read', {
      state_name: params.stateName,
      card_index: params.cardIndex,
      is_replay: params.isReplay,
    })
  },

  // ========== PROGRESSION EVENTS ==========
  /**
   * User completes a state (major milestone)
   */
  stateCompleted: (params: StateCompleteParams): void => {
    safeLogEvent('state_completed', {
      state_name: params.stateName,
      total_xp: params.totalXp,
      total_cards: params.totalCards,
      time_to_complete_seconds: Math.round(params.timeToCompleteSeconds),
      streak_at_completion: params.streakAtCompletion,
    })
  },

  /**
   * User earns XP
   */
  xpEarned: (amount: number, source: 'card' | 'quiz' | 'achievement'): void => {
    safeLogEvent('xp_earned', {
      amount,
      source,
    })
  },

  /**
   * User completes first state (key retention milestone)
   */
  firstStateCompleted: (): void => {
    safeLogEvent('first_state_completed', {})
  },

  // ========== SESSION/RETENTION EVENTS ==========
  /**
   * Session starts (user opens app)
   */
  sessionStart: (params: SessionStartParams): void => {
    safeLogEvent('session_start', {
      age_band: params.ageBand,
      is_returning_user: params.isReturningUser,
      days_since_last_active: params.daysSinceLastActive || 0,
    })
  },

  /**
   * Daily visit (tracks DAU/MAU for retention)
   */
  dailyVisit: (params: DailyVisitParams): void => {
    safeLogEvent('daily_visit', {
      age_band: params.ageBand,
      streak: params.streak,
      days_active: params.daysActive,
      total_xp: params.totalXp,
    })
  },

  /**
   * Streak milestone achieved (engagement driver)
   */
  streakMilestone: (streak: number): void => {
    safeLogEvent('streak_milestone', {
      streak_days: streak,
    })
  },

  // ========== QUALITY/ERROR EVENTS ==========
  /**
   * App crash or fatal error (for debugging)
   */
  crash: (params: CrashParams): void => {
    safeLogEvent('crash', {
      error_type: params.errorType,
      error_message: params.errorMessage.substring(0, 200), // Truncate long messages
      age_band: params.ageBand || 'unknown',
    })
  },

  /**
   * Storage hydration timeout (app performance issue)
   */
  storageHydrationTimeout: (params: StorageHydrationParams): void => {
    safeLogEvent('storage_hydration_timeout', {
      duration_ms: params.duration || 0,
      stored_data_kb: params.storedDataSizeBytes ? Math.round(params.storedDataSizeBytes / 1024) : 0,
    })
  },
}

export default firebaseEvents
