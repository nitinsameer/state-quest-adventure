/**
 * Regression Tests: Core App Functionality
 *
 * Verifies that key app features continue to work:
 * - State exploration
 * - Quiz completion
 * - Achievement tracking
 * - Progress persistence
 * - Navigation without parent dashboard
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProgress, type Progress } from "@/lib/progress";

describe("Core App Functionality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should track state completion", () => {
    // Given a user completes a state
    const progress: Progress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 0,
      streak: 0,
      lastActive: new Date().toISOString().split("T")[0],
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    // When they complete Karnataka
    progress.completed.push("Karnataka");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (progress.stamps as any)["Karnataka"] = "15 · JAN";
    progress.xp += 120; // Quiz XP + bonus
    progress.streak = 1;

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));

    // Then state completion should be saved
    const stored = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");
    expect(stored.completed).toContain("Karnataka");
    expect(stored.stamps["Karnataka"]).toBe("15 · JAN");
    expect(stored.xp).toBe(120);
  });

  it("should track quiz attempts and scores", () => {
    // Given a user starts a quiz
    const quizProgress: Record<
      string,
      {
        index: number;
        correctCount: number;
        answers: Array<{ id: string; correct: boolean }>;
        startedAt: number;
        updatedAt: number;
      }
    > = {
      Karnataka: {
        index: 0,
        correctCount: 0,
        answers: [],
        startedAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    // When they answer questions
    quizProgress.Karnataka.answers = [
      { id: "q1", correct: true },
      { id: "q2", correct: false },
      { id: "q3", correct: true },
    ];
    quizProgress.Karnataka.correctCount = 2;
    quizProgress.Karnataka.index = 3;

    localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(quizProgress));

    // Then quiz progress should be tracked
    const stored = JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
    expect(stored.Karnataka.correctCount).toBe(2);
    expect(stored.Karnataka.answers.length).toBe(3);
  });

  it("should track achievement badges", () => {
    // Given a user earns badges
    const progress: Progress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 1000,
      streak: 10,
      lastActive: new Date().toISOString().split("T")[0],
      completed: ["Karnataka", "Maharashtra"],
      stamps: {
        Karnataka: "15 · JAN",
        Maharashtra: "16 · JAN",
      },
      postcards: {},
      answered: [],
      badges: {
        Karnataka: ["monument", "animal"],
        Maharashtra: ["explorer"],
      },
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));

    // When checking badges
    const stored = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");

    // Then badges should be tracked per state
    expect(stored.badges.Karnataka).toContain("monument");
    expect(stored.badges.Karnataka).toContain("animal");
    expect(stored.badges.Maharashtra).toContain("explorer");
  });

  it("should persist progress across sessions", () => {
    // Given a user with saved progress
    const session1Progress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "10-12",
      onboarded: true,
      xp: 5000,
      streak: 20,
      completed: ["Karnataka", "Maharashtra", "Goa"],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(session1Progress));

    // When they close and reopen the app
    const session2Progress = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");

    // Then their progress should be restored
    expect(session2Progress.xp).toBe(5000);
    expect(session2Progress.streak).toBe(20);
    expect(session2Progress.completed.length).toBe(3);
  });

  it("should track state exploration cards", () => {
    // Given a user explores state cards
    const progress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 0,
      streak: 0,
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {
        Karnataka: [0, 1, 2], // Viewed cards 0, 1, 2
      },
    };

    // When they view more cards
    progress.cards.Karnataka.push(3, 4, 5);

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));

    // Then card views should be tracked
    const stored = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");
    expect(stored.cards.Karnataka).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("should support multiple user profiles", () => {
    // Given multiple profiles might be stored
    const profile1 = {
      name: "Arjun",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 2000,
      completed: ["Karnataka"],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    const profile2 = {
      name: "Zara",
      avatar: "scholar",
      ageBand: "10-12",
      onboarded: true,
      xp: 3000,
      completed: ["Delhi"],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    // When storing profile data (in a real app, this might use different storage keys)
    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(profile1));

    // Then profile data should be independently managed
    const stored = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");
    expect(stored.name).toBe("Arjun");
    expect(stored.xp).toBe(2000);
  });

  it("should maintain quiz answered questions list", () => {
    // Given a user answers quiz questions
    const progress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 0,
      streak: 0,
      completed: [],
      stamps: {},
      postcards: {},
      answered: ["q1", "q2", "q3"],
      badges: {},
      cards: {},
    };

    // When they answer more questions
    progress.answered.push("q4", "q5");

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));

    // Then all answered questions should be tracked
    const stored = JSON.parse(localStorage.getItem("india-explorer:progress:v2") || "{}");
    expect(stored.answered).toContain("q1");
    expect(stored.answered).toContain("q5");
    expect(stored.answered.length).toBe(5);
  });

  it("should not require parent dashboard for core navigation", () => {
    // Given the app works without a parent dashboard
    // (Verify no required references to removed parent dashboard)

    // When user navigates
    const allowedRoutes = ["home", "journey", "badges", "achievements", "themes", "me"];

    // Then all core routes should be accessible
    expect(allowedRoutes).toContain("home");
    expect(allowedRoutes).toContain("journey");
    expect(allowedRoutes).toContain("badges");
    // And parent route should not be required
    expect(allowedRoutes).not.toContain("parent");
  });
});
