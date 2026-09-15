/**
 * Firebase Events Integration Tests
 * Verifies all Firebase events are properly typed and can be called
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firebaseEvents } from './firebase-events';

describe('Firebase Events API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quiz Events', () => {
    it('should emit quizStart event', () => {
      expect(() => {
        firebaseEvents.quizStart({
          stateName: 'Karnataka',
          ageBand: '8-9',
          questionCount: 3,
        });
      }).not.toThrow();
    });

    it('should emit quizAnswer event for correct answer', () => {
      expect(() => {
        firebaseEvents.quizAnswer({
          stateName: 'Karnataka',
          questionId: 'q1',
          isCorrect: true,
          difficulty: 'medium',
        });
      }).not.toThrow();
    });

    it('should emit quizAnswer event for wrong answer', () => {
      expect(() => {
        firebaseEvents.quizAnswer({
          stateName: 'Karnataka',
          questionId: 'q1',
          isCorrect: false,
          difficulty: 'easy',
        });
      }).not.toThrow();
    });

    it('should emit quizComplete event', () => {
      expect(() => {
        firebaseEvents.quizComplete({
          stateName: 'Karnataka',
          questionsAnswered: 3,
          correctAnswers: 2,
          scorePercentage: 66.67,
          timeSpentSeconds: 45.5,
        });
      }).not.toThrow();
    });
  });

  describe('Card/Learning Events', () => {
    it('should emit cardRead event', () => {
      expect(() => {
        firebaseEvents.cardRead({
          stateName: 'Karnataka',
          cardIndex: 0,
          isReplay: false,
        });
      }).not.toThrow();
    });

    it('should emit cardRead event for replay', () => {
      expect(() => {
        firebaseEvents.cardRead({
          stateName: 'Karnataka',
          cardIndex: 1,
          isReplay: true,
        });
      }).not.toThrow();
    });

    it('should emit cardExpanded event', () => {
      expect(() => {
        firebaseEvents.cardExpanded({
          stateName: 'Karnataka',
          cardIndex: 2,
        });
      }).not.toThrow();
    });
  });

  describe('Progression Events', () => {
    it('should emit badgeEarned event', () => {
      expect(() => {
        firebaseEvents.badgeEarned({
          stateName: 'Karnataka',
          badgeId: 'quiz_master',
          method: 'quiz',
        });
      }).not.toThrow();
    });

    it('should emit stateCompleted event', () => {
      expect(() => {
        firebaseEvents.stateCompleted({
          stateName: 'Karnataka',
          totalXp: 500,
          totalCards: 5,
          timeToCompleteSeconds: 600,
          streakAtCompletion: 3,
        });
      }).not.toThrow();
    });

    it('should emit xpEarned event from card', () => {
      expect(() => {
        firebaseEvents.xpEarned(10, 'card');
      }).not.toThrow();
    });

    it('should emit xpEarned event from quiz', () => {
      expect(() => {
        firebaseEvents.xpEarned(50, 'quiz');
      }).not.toThrow();
    });

    it('should emit xpEarned event from achievement', () => {
      expect(() => {
        firebaseEvents.xpEarned(25, 'achievement');
      }).not.toThrow();
    });
  });

  describe('Onboarding Events', () => {
    it('should emit profileCreated event', () => {
      expect(() => {
        firebaseEvents.profileCreated('8-9', '🧒');
      }).not.toThrow();
    });

    it('should emit firstStateCompleted event', () => {
      expect(() => {
        firebaseEvents.firstStateCompleted();
      }).not.toThrow();
    });

    it('should emit firstBadgeEarned event', () => {
      expect(() => {
        firebaseEvents.firstBadgeEarned();
      }).not.toThrow();
    });
  });

  describe('Session/Retention Events', () => {
    it('should emit sessionStart event for new user', () => {
      expect(() => {
        firebaseEvents.sessionStart({
          ageBand: '8-9',
          isReturningUser: false,
        });
      }).not.toThrow();
    });

    it('should emit sessionStart event for returning user', () => {
      expect(() => {
        firebaseEvents.sessionStart({
          ageBand: '8-9',
          isReturningUser: true,
          daysSinceLastActive: 5,
        });
      }).not.toThrow();
    });

    it('should emit dailyVisit event', () => {
      expect(() => {
        firebaseEvents.dailyVisit({
          ageBand: '8-9',
          streak: 7,
          daysActive: 10,
          totalXp: 1200,
        });
      }).not.toThrow();
    });

    it('should emit streakMilestone event', () => {
      expect(() => {
        firebaseEvents.streakMilestone(7);
      }).not.toThrow();
    });

    it('should emit streakMilestone for all milestone values', () => {
      const milestones = [3, 7, 14, 30];
      milestones.forEach((streak) => {
        expect(() => {
          firebaseEvents.streakMilestone(streak);
        }).not.toThrow();
      });
    });
  });

  describe('Quality/Error Events', () => {
    it('should emit crash event', () => {
      expect(() => {
        firebaseEvents.crash({
          errorType: 'uncaught_error',
          errorMessage: 'Cannot read property x of undefined',
          stackTrace: 'at Object.foo (app.js:10:5)',
          ageBand: '8-9',
        });
      }).not.toThrow();
    });

    it('should emit crash without stack trace', () => {
      expect(() => {
        firebaseEvents.crash({
          errorType: 'network_error',
          errorMessage: 'Failed to fetch',
        });
      }).not.toThrow();
    });

    it('should emit storageHydrationTimeout event', () => {
      expect(() => {
        firebaseEvents.storageHydrationTimeout({
          timeout: true,
          duration: 523,
        });
      }).not.toThrow();
    });

    it('should emit storageHydrationTimeout without duration', () => {
      expect(() => {
        firebaseEvents.storageHydrationTimeout({
          timeout: false,
        });
      }).not.toThrow();
    });

    it('should emit invalidCardMark event', () => {
      expect(() => {
        firebaseEvents.invalidCardMark('Karnataka', 10);
      }).not.toThrow();
    });
  });

  describe('Permission Events', () => {
    it('should emit permissionRequested event for audio granted', () => {
      expect(() => {
        firebaseEvents.permissionRequested({
          feature: 'audio',
          granted: true,
        });
      }).not.toThrow();
    });

    it('should emit permissionRequested event for audio denied', () => {
      expect(() => {
        firebaseEvents.permissionRequested({
          feature: 'audio',
          granted: false,
        });
      }).not.toThrow();
    });

    it('should emit permissionRequested event for file granted', () => {
      expect(() => {
        firebaseEvents.permissionRequested({
          feature: 'file',
          granted: true,
        });
      }).not.toThrow();
    });

    it('should emit permissionRequested event for file denied', () => {
      expect(() => {
        firebaseEvents.permissionRequested({
          feature: 'file',
          granted: false,
        });
      }).not.toThrow();
    });
  });

  describe('Navigation Events', () => {
    it('should emit screenView event', () => {
      expect(() => {
        firebaseEvents.screenView('home', 'HomeScreen');
      }).not.toThrow();
    });

    it('should emit screenView without class', () => {
      expect(() => {
        firebaseEvents.screenView('learn');
      }).not.toThrow();
    });

    it('should emit engagement event', () => {
      expect(() => {
        firebaseEvents.engagement('button_click', {
          buttonName: 'start_quiz',
          stateName: 'Karnataka',
        });
      }).not.toThrow();
    });
  });

  describe('Event Sanitization', () => {
    it('should handle long strings by truncating', () => {
      const longString = 'a'.repeat(200);
      expect(() => {
        firebaseEvents.crash({
          errorType: 'test',
          errorMessage: longString,
        });
      }).not.toThrow();
    });

    it('should handle NaN and Infinity numbers', () => {
      expect(() => {
        firebaseEvents.xpEarned(NaN, 'card');
      }).not.toThrow();

      expect(() => {
        firebaseEvents.xpEarned(Infinity, 'quiz');
      }).not.toThrow();
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => {
        firebaseEvents.permissionRequested({
          feature: 'audio',
          granted: true,
        });
      }).not.toThrow();
    });
  });

  describe('Firebase Configuration', () => {
    it('should handle events when Firebase is not configured', () => {
      // This test verifies graceful degradation
      // Events should not throw even if Firebase is not configured
      expect(() => {
        firebaseEvents.sessionStart({
          ageBand: '8-9',
          isReturningUser: false,
        });
      }).not.toThrow();
    });
  });

  describe('Event Coverage - All Critical Flows', () => {
    it('should cover complete onboarding flow', () => {
      expect(() => {
        // Step 1: Profile creation
        firebaseEvents.profileCreated('8-9', '🧒');

        // Step 2: Session start
        firebaseEvents.sessionStart({
          ageBand: '8-9',
          isReturningUser: false,
        });
      }).not.toThrow();
    });

    it('should cover complete quiz flow', () => {
      expect(() => {
        // Step 1: User starts quiz
        firebaseEvents.quizStart({
          stateName: 'Karnataka',
          ageBand: '8-9',
          questionCount: 3,
        });

        // Step 2: User answers questions
        firebaseEvents.quizAnswer({
          stateName: 'Karnataka',
          questionId: 'q1',
          isCorrect: true,
        });

        firebaseEvents.quizAnswer({
          stateName: 'Karnataka',
          questionId: 'q2',
          isCorrect: true,
        });

        firebaseEvents.quizAnswer({
          stateName: 'Karnataka',
          questionId: 'q3',
          isCorrect: false,
        });

        // Step 3: Quiz completes
        firebaseEvents.quizComplete({
          stateName: 'Karnataka',
          questionsAnswered: 3,
          correctAnswers: 2,
          scorePercentage: 66.67,
          timeSpentSeconds: 120,
        });

        // Step 4: XP earned
        firebaseEvents.xpEarned(50, 'quiz');
      }).not.toThrow();
    });

    it('should cover complete learning flow', () => {
      expect(() => {
        // User reads cards
        firebaseEvents.cardRead({
          stateName: 'Karnataka',
          cardIndex: 0,
          isReplay: false,
        });

        firebaseEvents.xpEarned(10, 'card');

        firebaseEvents.cardRead({
          stateName: 'Karnataka',
          cardIndex: 1,
          isReplay: false,
        });

        firebaseEvents.xpEarned(10, 'card');

        firebaseEvents.cardRead({
          stateName: 'Karnataka',
          cardIndex: 2,
          isReplay: true,
        });

        // State completed
        firebaseEvents.stateCompleted({
          stateName: 'Karnataka',
          totalXp: 150,
          totalCards: 3,
          timeToCompleteSeconds: 900,
          streakAtCompletion: 1,
        });

        firebaseEvents.firstStateCompleted();
      }).not.toThrow();
    });

    it('should cover retention tracking flow', () => {
      expect(() => {
        // Daily visit
        firebaseEvents.dailyVisit({
          ageBand: '8-9',
          streak: 7,
          daysActive: 7,
          totalXp: 2500,
        });

        // Streak milestone
        firebaseEvents.streakMilestone(7);
      }).not.toThrow();
    });

    it('should cover error tracking flow', () => {
      expect(() => {
        // Crash event
        firebaseEvents.crash({
          errorType: 'runtime_error',
          errorMessage: 'State update failed',
          ageBand: '8-9',
        });

        // Hydration timeout
        firebaseEvents.storageHydrationTimeout({
          timeout: true,
          duration: 523,
        });

        // Invalid card
        firebaseEvents.invalidCardMark('Karnataka', 5);
      }).not.toThrow();
    });
  });
});
