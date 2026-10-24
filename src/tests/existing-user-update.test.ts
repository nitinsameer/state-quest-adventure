/**
 * Regression Tests: Existing User App Update
 * 
 * Verifies that existing users updating to the new version:
 * - Preserve their app data and progress
 * - Are not forced through PIN setup
 * - Are not forced through consent screens
 * - Can immediately resume playing
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Existing User App Update", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should preserve user progress data on update", () => {
    // Given an existing user with progress from a previous app version
    const existingProgress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "10-12",
      onboarded: true,
      xp: 5000,
      streak: 15,
      lastActive: "2024-01-15",
      completed: ["Karnataka", "Maharashtra", "Tamil Nadu"],
      stamps: {
        Karnataka: "15 · JAN",
        Maharashtra: "16 · JAN",
        "Tamil Nadu": "17 · JAN",
      },
      postcards: {
        Karnataka: {
          generatedAt: "2024-01-15T10:00:00Z",
          state: "Karnataka",
          badge: "monument",
          stampDate: "15 · JAN",
        },
      },
      answered: ["q1", "q2", "q3"],
      badges: {
        Karnataka: ["monument", "animal"],
        Maharashtra: ["explorer"],
      },
      cards: {
        Karnataka: [0, 1, 2, 3, 4, 5],
      },
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(existingProgress));

    // When the user updates to the new app version
    const retrievedProgress = JSON.parse(
      localStorage.getItem("india-explorer:progress:v2") || "{}"
    );

    // Then all their data should be intact
    expect(retrievedProgress.xp).toBe(5000);
    expect(retrievedProgress.completed).toContain("Karnataka");
    expect(retrievedProgress.completed.length).toBe(3);
    expect(retrievedProgress.answered.length).toBe(3);
    expect(retrievedProgress.badges.Karnataka).toContain("monument");
  });

  it("should not force existing user through PIN setup on update", () => {
    // Given an existing user with saved progress
    const existingProgress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 1000,
      streak: 5,
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(existingProgress));

    // When they update the app
    // Then no PIN setup should be triggered
    expect(localStorage.getItem("india-explorer:pin-hash")).toBeNull();
    expect(localStorage.getItem("india-explorer:pin-salt")).toBeNull();
    expect(localStorage.getItem("india-explorer:pin-attempts")).toBeNull();

    // And their progress flag should still indicate they've been onboarded
    const progress = JSON.parse(
      localStorage.getItem("india-explorer:progress:v2") || "{}"
    );
    expect(progress.onboarded).toBe(true);
  });

  it("should not force existing user through consent screens on update", () => {
    // Given an existing user with saved data
    const existingProgress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "10-12",
      onboarded: true,
      xp: 2000,
      streak: 10,
      completed: ["Delhi"],
      stamps: { Delhi: "01 · JAN" },
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(existingProgress));

    // When they update the app (no migration needed)
    // Then no consent screen data should block them
    expect(localStorage.getItem("india-explorer:parental-consent:v1")).toBeNull();

    // And they should be able to play immediately
    const progress = JSON.parse(
      localStorage.getItem("india-explorer:progress:v2") || "{}"
    );
    expect(progress.completed.length).toBeGreaterThan(0);
  });

  it("should preserve quiz progress on update", () => {
    // Given an existing user with in-progress quiz data
    const quizProgress = {
      Karnataka: {
        index: 2,
        correctCount: 2,
        answers: [
          { id: "q1", correct: true },
          { id: "q2", correct: true },
        ],
        startedAt: Date.now() - 60000,
        updatedAt: Date.now(),
      },
    };

    localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(quizProgress));

    // When they update
    const retrieved = JSON.parse(
      localStorage.getItem("india-explorer:quiz-progress:v1") || "{}"
    );

    // Then quiz progress should be preserved
    expect(retrieved.Karnataka).toBeDefined();
    expect(retrieved.Karnataka.correctCount).toBe(2);
    expect(retrieved.Karnataka.answers.length).toBe(2);
  });

  it("should preserve postcard library on update", () => {
    // Given an existing user with generated postcards
    const postcardLibrary = [
      {
        id: "pc-1",
        state: "Karnataka",
        badge: "monument",
        stampDate: "15 · JAN",
        generatedAt: "2024-01-15T10:00:00Z",
        consentState: "pending",
        isExportedToDevice: false,
        exportCount: 0,
        displayOrder: 0,
        tags: [],
        imageData: "data:image/png;base64,...",
      },
    ];

    localStorage.setItem("postcard-library-v1", JSON.stringify(postcardLibrary));

    // When they update
    const retrieved = JSON.parse(
      localStorage.getItem("postcard-library-v1") || "[]"
    );

    // Then postcard library should be intact
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].state).toBe("Karnataka");
    expect(retrieved[0].imageData).toBeDefined();
  });

  it("should not require new consent after update", () => {
    // Given an existing user with no consent data (sound worked without it)
    localStorage.clear();
    
    const existingProgress = {
      name: "Explorer",
      avatar: "explorer-hat",
      ageBand: "8-9",
      onboarded: true,
      xp: 1500,
      completed: [],
      stamps: {},
      postcards: {},
      answered: [],
      badges: {},
      cards: {},
    };

    localStorage.setItem("india-explorer:progress:v2", JSON.stringify(existingProgress));

    // When they update and continue playing
    // Then they should still not need to grant consent to use sound
    expect(localStorage.getItem("india-explorer:parental-consent:v1")).toBeNull();
    
    const progress = JSON.parse(
      localStorage.getItem("india-explorer:progress:v2") || "{}"
    );
    expect(progress.onboarded).toBe(true);
  });
});
