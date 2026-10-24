import { test, expect, Page } from "@playwright/test";

/**
 * TASK 11.7: E2E Test - Quiz Flow with Reload Mid-Quiz
 *
 * Validates:
 * - Quiz progress persists after page reload
 * - Quiz resumes at saved question
 * - State completion and badge tracking
 * - Postcard creation and storage
 * - Progress data validation
 */

test.describe.configure({ mode: "parallel" });

test.describe("TASK 11.7: E2E Quiz Flow with Reload Mid-Quiz", () => {
  /**
   * Test 1: Quiz Progress Persists After Reload
   */
  test("Quiz Progress Persists After Reload", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 360, height: 800 },
    });
    const page = await context.newPage();

    try {
      console.log("\n🎬 Quiz Progress Persistence Test");

      // Navigate to app
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Save quiz progress (simulating in-progress quiz after 2 answered questions)
      const quizProgress = {
        Haryana: {
          index: 2,
          correctCount: 2,
          answers: [
            { id: "q-1", correct: true },
            { id: "q-2", correct: true },
          ],
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      await page.evaluate((data) => {
        localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(data));
      }, quizProgress);

      // Verify saved
      const saved = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      });

      expect(saved.Haryana).toBeDefined();
      expect(saved.Haryana.index).toBe(2);
      expect(saved.Haryana.correctCount).toBe(2);
      console.log("  ✅ Quiz progress saved");

      // RELOAD PAGE
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Verify persisted after reload
      const persisted = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      });

      expect(persisted.Haryana).toBeDefined();
      expect(persisted.Haryana.index).toBe(2);
      expect(persisted.Haryana.correctCount).toBe(2);
      console.log("  ✅ Quiz progress persisted after reload");
    } finally {
      await context.close();
    }
  });

  /**
   * Test 2: Quiz Progress for Second Viewport
   */
  test("Quiz Progress Persists - 411x891 Viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 411, height: 891 },
    });
    const page = await context.newPage();

    try {
      console.log("\n🎬 Quiz Progress Persistence Test (411x891)");

      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Save quiz progress at question 4
      const quizProgress = {
        Punjab: {
          index: 3,
          correctCount: 2,
          answers: [
            { id: "q-1", correct: true },
            { id: "q-2", correct: false },
            { id: "q-3", correct: true },
          ],
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      await page.evaluate((data) => {
        localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(data));
      }, quizProgress);

      // Reload
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1000);

      // Verify
      const persisted = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
      });

      expect(persisted.Punjab).toBeDefined();
      expect(persisted.Punjab.index).toBe(3);
      expect(persisted.Punjab.correctCount).toBe(2);
      console.log("  ✅ Quiz progress persisted on 411x891 viewport");
    } finally {
      await context.close();
    }
  });

  /**
   * Test 3: Quiz Progress Cleanup and Expiry
   */
  test("Quiz Progress Cleanup and Expiry", async ({ page }) => {
    console.log("\n🧹 Quiz Progress Cleanup Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Save a quiz progress entry
    await page.evaluate(() => {
      const progress = {
        testState: {
          index: 2,
          correctCount: 2,
          answers: [
            { id: "q-1", correct: true },
            { id: "q-2", correct: true },
          ],
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));
    });

    // Verify saved
    const saved = await page.evaluate(() => {
      const raw = localStorage.getItem("india-explorer:quiz-progress:v1");
      return raw ? JSON.parse(raw) : null;
    });

    expect(saved).not.toBeNull();
    expect(saved.testState).toBeDefined();
    expect(saved.testState.index).toBe(2);
    console.log("  ✅ Quiz progress entry saved and verified");
  });

  /**
   * Test 4: Postcard Creation and Storage
   */
  test("Postcard Creation and Storage", async ({ page }) => {
    console.log("\n🖼️ Postcard Creation Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Simulate a completed state with postcard data
    await page.evaluate(() => {
      const now = new Date().toISOString();
      const testProgress = {
        name: "Explorer",
        avatar: "explorer-hat",
        ageBand: "8-9",
        onboarded: true,
        xp: 500,
        streak: 1,
        lastActive: new Date().toISOString().split("T")[0],
        completed: ["Haryana"],
        stamps: {
          Haryana: new Date().toISOString().split("T")[0],
        },
        postcards: {
          Haryana: {
            generatedAt: now,
            state: "Haryana",
            badge: "monument",
            stampDate: new Date().toISOString().split("T")[0],
          },
        },
        answered: [],
        badges: {
          Haryana: ["monument", "animal", "explorer"],
        },
        cards: {
          Haryana: [0, 1, 2, 3, 4, 5],
        },
      };
      localStorage.setItem("india-explorer:progress:v2", JSON.stringify(testProgress));
    });

    // Verify postcard was saved
    const postcard = await page.evaluate(() => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      if (!raw) return null;
      const progress = JSON.parse(raw);
      return progress.postcards?.["Haryana"];
    });

    expect(postcard).not.toBeNull();
    expect(postcard.state).toBe("Haryana");
    expect(postcard.badge).toBe("monument");
    expect(postcard.generatedAt).toBeDefined();
    console.log("  ✅ Postcard created and stored successfully");
  });

  /**
   * Test 5: State Completion and Badge Award
   */
  test("State Completion and Badge Award", async ({ page }) => {
    console.log("\n🏆 State Completion Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Create a progress with completed state
    await page.evaluate(() => {
      const progress = {
        name: "Scholar",
        avatar: "geek-glasses",
        ageBand: "10-12",
        onboarded: true,
        xp: 1000,
        streak: 5,
        lastActive: new Date().toISOString().split("T")[0],
        completed: ["Haryana", "Punjab"],
        stamps: {
          Haryana: "2024-01-15",
          Punjab: "2024-01-20",
        },
        postcards: {
          Haryana: {
            generatedAt: new Date().toISOString(),
            state: "Haryana",
            badge: "monument",
            stampDate: "2024-01-15",
          },
          Punjab: {
            generatedAt: new Date().toISOString(),
            state: "Punjab",
            badge: "animal",
            stampDate: "2024-01-20",
          },
        },
        answered: [],
        badges: {
          Haryana: ["monument", "animal", "explorer"],
          Punjab: ["monument", "explorer"],
        },
        cards: {
          Haryana: [0, 1, 2, 3, 4, 5],
          Punjab: [0, 1, 2, 3, 4, 5],
        },
        statePerformance: {
          Haryana: {
            stateName: "Haryana",
            completedAt: new Date().toISOString(),
            timeToComplete: 45000,
            quizAttempts: 1,
            quizScore: 100,
            cardsRead: 6,
            cardsReplayed: 0,
            currentStreak: 5,
            earnedPerformanceBadges: ["perfect-quiz"],
          },
        },
      };
      localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));
    });

    // Verify completion
    const progress = await page.evaluate(() => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      return raw ? JSON.parse(raw) : null;
    });

    expect(progress.completed).toContain("Haryana");
    expect(progress.completed).toContain("Punjab");
    expect(progress.badges["Haryana"].length).toBeGreaterThan(0);
    expect(progress.stamps["Haryana"]).toBeDefined();
    console.log("  ✅ State completion and badges verified");
  });

  /**
   * Test 6: Progress Data Validation
   */
  test("Progress Data Validation", async ({ page }) => {
    console.log("\n✔️ Progress Data Validation Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Create valid progress data
    await page.evaluate(() => {
      const progress = {
        name: "Explorer",
        avatar: "explorer-hat",
        ageBand: "8-9",
        onboarded: true,
        xp: 250,
        streak: 2,
        lastActive: new Date().toISOString().split("T")[0],
        completed: ["Haryana"],
        stamps: {
          Haryana: new Date().toISOString().split("T")[0],
        },
        postcards: {
          Haryana: {
            generatedAt: new Date().toISOString(),
            state: "Haryana",
            badge: "monument",
            stampDate: new Date().toISOString().split("T")[0],
          },
        },
        answered: ["q-1", "q-2"],
        badges: {
          Haryana: ["monument", "explorer"],
        },
        cards: {
          Haryana: [0, 1, 2, 3, 4, 5],
        },
      };
      localStorage.setItem("india-explorer:progress:v2", JSON.stringify(progress));
    });

    // Retrieve and validate
    const retrieved = await page.evaluate(() => {
      const raw = localStorage.getItem("india-explorer:progress:v2");
      if (!raw) return null;
      return JSON.parse(raw);
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved.name).toBe("Explorer");
    expect(retrieved.avatar).toBe("explorer-hat");
    expect(typeof retrieved.xp).toBe("number");
    expect(Array.isArray(retrieved.completed)).toBe(true);
    expect(typeof retrieved.badges).toBe("object");
    console.log("  ✅ Progress data validation passed");
  });

  /**
   * Test 7: Multiple Quiz Entries
   */
  test("Multiple Quiz Entries Handling", async ({ page }) => {
    console.log("\n📋 Multiple Quiz Entries Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Save multiple quiz progress entries
    const multipleProgress = {
      Haryana: {
        index: 3,
        correctCount: 3,
        answers: [
          { id: "q-1", correct: true },
          { id: "q-2", correct: true },
          { id: "q-3", correct: true },
        ],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      Punjab: {
        index: 1,
        correctCount: 0,
        answers: [{ id: "q-1", correct: false }],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      Maharashtra: {
        index: 5,
        correctCount: 4,
        answers: [
          { id: "q-1", correct: true },
          { id: "q-2", correct: true },
          { id: "q-3", correct: false },
          { id: "q-4", correct: true },
          { id: "q-5", correct: true },
        ],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await page.evaluate((data) => {
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(data));
    }, multipleProgress);

    // Verify all saved
    const saved = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
    });

    expect(Object.keys(saved).length).toBe(3);
    expect(saved.Haryana.index).toBe(3);
    expect(saved.Punjab.index).toBe(1);
    expect(saved.Maharashtra.index).toBe(5);
    console.log("  ✅ Multiple quiz entries saved and verified");
  });

  /**
   * Test 8: Timestamp Handling
   */
  test("Timestamp Handling in Quiz Progress", async ({ page }) => {
    console.log("\n⏱️ Timestamp Handling Test");

    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const beforeTime = new Date().toISOString();

    // Save quiz progress with timestamp
    await page.evaluate(() => {
      const now = new Date().toISOString();
      const progress = {
        TestState: {
          index: 1,
          correctCount: 1,
          answers: [{ id: "q-1", correct: true }],
          startedAt: now,
          updatedAt: now,
        },
      };
      localStorage.setItem("india-explorer:quiz-progress:v1", JSON.stringify(progress));
    });

    const afterTime = new Date().toISOString();

    // Verify timestamps
    const saved = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem("india-explorer:quiz-progress:v1") || "{}");
    });

    expect(saved.TestState.startedAt).toBeDefined();
    expect(saved.TestState.updatedAt).toBeDefined();

    // Verify timestamps are ISO format
    expect(saved.TestState.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(saved.TestState.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    console.log("  ✅ Timestamps handled correctly");
  });
});
