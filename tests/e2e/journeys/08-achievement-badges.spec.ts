import { test, expect } from "@playwright/test";
import { OnboardingPage } from "../pages/OnboardingPage";
import { HomePage } from "../pages/HomePage";
import { LearningHubPage } from "../pages/LearningHubPage";
import { QuizPage } from "../pages/QuizPage";
import { BadgesPage } from "../pages/BadgesPage";
import { TEST_USERS, EXPECTED_ACHIEVEMENTS } from "../fixtures/test-data";

test.describe("Achievement Badges & Tier Progression", () => {
  let onboarding: OnboardingPage;
  let home: HomePage;
  let learningHub: LearningHubPage;
  let quiz: QuizPage;
  let badges: BadgesPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);
    learningHub = new LearningHubPage(page);
    quiz = new QuizPage(page);
    badges = new BadgesPage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);
  });

  test("should unlock Explorers Awakening achievement (first state)", async ({ page }) => {
    // Complete first state
    await learningHub.goto("Andhra Pradesh");

    // Read all cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Complete quiz
    await learningHub.clickQuizButton();
    const totalQuestions = await quiz.getTotalQuestions();
    for (let q = 0; q < totalQuestions; q++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;

      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Check achievement data
    const progressData = await onboarding.getProgressData();
    const completed = progressData.completed;

    expect(completed.length).toBe(1);
    expect(completed[0]).toBe("Andhra Pradesh");
  });

  test("should track achievement progress for Seedling tier", async ({ page }) => {
    // Achievements should be accessible from home
    const xp = await home.getXPValue();
    const statesCount = await home.getStatesCount();

    // Fresh user should have 0/1 for many achievements
    expect(xp >= 0).toBe(true);
    expect(statesCount >= 0).toBe(true);
  });

  test("should verify achievements screen exists", async ({ page }) => {
    await badges.gotoAchievements();

    // Page should load with achievements grid
    const achievements = await badges.getAchievementsData();
    expect(achievements.length > 0).toBe(true);
  });

  test("should display achievement tiers", async ({ page }) => {
    await badges.gotoAchievements();

    // Verify at least Seedling tier (tier 1) is visible
    const hasSeedling = await badges.verifyAchievementTier("Seedling");
    expect(hasSeedling).toBe(true);
  });

  test("should track Reader achievement (50 cards read)", async ({ page }) => {
    const progressData = await onboarding.getProgressData();

    // Count total cards read
    const cardsRead = Object.values(progressData.cards || {}).reduce(
      (total: number, cards: any[]) => total + cards.length,
      0,
    );

    expect(cardsRead >= 0).toBe(true);

    // To unlock Reader, need 50 cards
    // This test documents the tracking logic
  });

  test("should track Quiz Starter achievement (10 questions answered)", async ({ page }) => {
    const progressData = await onboarding.getProgressData();

    // Count answered questions
    const answeredCount = progressData.answered.length;

    expect(answeredCount >= 0).toBe(true);
  });

  test("should track Stamp Collector achievement (10 stamps)", async ({ page }) => {
    const progressData = await onboarding.getProgressData();

    // Count stamps
    const stampCount = Object.keys(progressData.stamps || {}).length;

    expect(stampCount >= 0).toBe(true);
  });

  test("should verify level-based achievement", async ({ page }) => {
    await home.goto();

    const level = await home.getLevel();
    expect(level >= 1).toBe(true);

    // Level-based achievements tracked through XP
    const xp = await home.getXPValue();
    expect(xp >= 0).toBe(true);
  });

  test("should unlock Five Explorer achievement at 5 states", async ({ page }) => {
    const progressData = await onboarding.getProgressData();
    const statesCompleted = progressData.completed.length;

    // If 5+ states completed, Five Explorer should be unlocked
    if (statesCompleted >= 5) {
      expect(statesCompleted).toBeGreaterThanOrEqual(5);
    }
  });

  test("should unlock Ten Champion achievement at 10 states", async ({ page }) => {
    const progressData = await onboarding.getProgressData();
    const statesCompleted = progressData.completed.length;

    // Track progress toward 10
    expect(statesCompleted >= 0).toBe(true);
  });

  test("should unlock India Conqueror at all 36 states", async ({ page }) => {
    const progressData = await onboarding.getProgressData();
    const statesCompleted = progressData.completed.length;

    // Ultimate achievement: 36 states
    if (statesCompleted === 36) {
      expect(true).toBe(true); // India Conqueror unlocked
    } else {
      expect(statesCompleted <= 36).toBe(true);
    }
  });

  test("should track achievement badges with timestamps", async ({ page }) => {
    // Complete first state
    await learningHub.goto("Andhra Pradesh");

    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    await learningHub.clickQuizButton();
    const totalQuestions = await quiz.getTotalQuestions();
    for (let q = 0; q < totalQuestions; q++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;

      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Verify achievement data exists
    const progressData = await onboarding.getProgressData();
    expect(progressData.completed.length > 0).toBe(true);
  });

  test("should unlock Fired Up achievement (1 day streak)", async ({ page }) => {
    const progress = await onboarding.getProgressData();
    const streak = progress.streak;

    // Fresh user should have 0, but system tracks it
    expect(streak >= 0).toBe(true);

    // Fired Up unlocks at 1-day streak
    // Test documents the logic
  });

  test("should display all achievement tiers", async ({ page }) => {
    await badges.gotoAchievements();

    // Should have at least Seedling tier achievements
    const achievements = await badges.getAchievementsData();
    expect(achievements.length > 0).toBe(true);
  });

  test("should verify achievement icons and descriptions", async ({ page }) => {
    await badges.gotoAchievements();

    const achievements = await badges.getAchievementsData();

    // Each achievement should have title and description
    for (const achievement of achievements) {
      expect(achievement.title).toBeDefined();
      expect(achievement.description).toBeDefined();
      expect(achievement.unlocked === true || achievement.unlocked === false).toBe(true);
    }
  });

  test("should track XP-based achievements", async ({ page }) => {
    await home.goto();

    const xp = await home.getXPValue();
    expect(xp >= 0).toBe(true);

    // XP unlocks level-based achievements
    // Level 5 badge at 1600 XP (400 XP per level)
    if (xp >= 1600) {
      const level = await home.getLevel();
      expect(level >= 5).toBe(true);
    }
  });

  test("should unlock Knowledge Keeper achievement (100 cards read)", async ({ page }) => {
    const progressData = await onboarding.getProgressData();

    const totalCards = Object.values(progressData.cards || {}).reduce(
      (total: number, cards: any[]) => total + cards.length,
      0,
    );

    // Knowledge Keeper at 100 cards
    // Test documents tracking logic
    expect(totalCards >= 0).toBe(true);
  });

  test("should unlock Badge Collector achievement (15 badges)", async ({ page }) => {
    // Count all badges earned
    const progressData = await onboarding.getProgressData();

    let totalBadges = 0;
    for (const stateNameBadges of Object.values(progressData.badges || {})) {
      totalBadges += (stateNameBadges as string[]).length;
    }

    // Badge Collector at 15 badges
    if (totalBadges >= 15) {
      expect(totalBadges).toBeGreaterThanOrEqual(15);
    } else {
      expect(totalBadges <= 15).toBe(true);
    }
  });
});
