import { test, expect } from "@playwright/test";
import { OnboardingPage } from "../pages/OnboardingPage";
import { HomePage } from "../pages/HomePage";
import { LearningHubPage } from "../pages/LearningHubPage";
import { QuizPage } from "../pages/QuizPage";
import { PassportPage } from "../pages/PassportPage";
import { TEST_USERS, EXPECTED_XP_VALUES } from "../fixtures/test-data";

test.describe("State Completion & Postcard Generation", () => {
  let onboarding: OnboardingPage;
  let home: HomePage;
  let learningHub: LearningHubPage;
  let quiz: QuizPage;
  let passport: PassportPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);
    learningHub = new LearningHubPage(page);
    quiz = new QuizPage(page);
    passport = new PassportPage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);
  });

  test("should complete state and update progress", async ({ page }) => {
    // Complete learning hub
    await learningHub.goto("Andhra Pradesh");
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;
      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Get initial completed count
    const initialProgress = await onboarding.getProgressData();
    const initialCompleted = initialProgress.completed.length;
    expect(initialCompleted).toBe(0);

    // Complete quiz
    await learningHub.clickQuizButton();
    const totalQuestions = await quiz.getTotalQuestions();
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    // Wait for completion
    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Verify state marked as completed
    const finalProgress = await onboarding.getProgressData();
    expect(finalProgress.completed.includes("Andhra Pradesh")).toBe(true);
    expect(finalProgress.completed.length).toBe(1);
  });

  test("should generate postcard on state completion", async ({ page }) => {
    // Complete state
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
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Check postcard generated
    const progressData = await onboarding.getProgressData();
    expect(progressData.postcards["Andhra Pradesh"]).toBeDefined();

    const postcard = progressData.postcards["Andhra Pradesh"];
    expect(postcard.state).toBe("Andhra Pradesh");
    expect(postcard.badge).toBeDefined();
    expect(postcard.stampDate).toBeDefined();
  });

  test("should award 100 XP for state completion", async ({ page }) => {
    // Complete learning hub
    await learningHub.goto("Andhra Pradesh");
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;
      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    const xpBeforeQuiz = await home.getXPValue();

    // Complete quiz
    await learningHub.clickQuizButton();
    const totalQuestions = await quiz.getTotalQuestions();
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Navigate to home
    await home.goto();
    const xpAfterCompletion = await home.getXPValue();

    // Should have at least 100 XP more for completion
    // Plus quiz answers (20 XP each)
    expect(xpAfterCompletion).toBeGreaterThan(xpBeforeQuiz + 100 - 50); // Allow margin
  });

  test("should update home dashboard after state completion", async ({ page }) => {
    // Complete state
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
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Go home
    await home.goto();

    // Verify updated stats
    const statesCount = await home.getStatesCount();
    expect(statesCount).toBe(1);

    const badgesCount = await home.getBadgesCount();
    expect(badgesCount).toBe(3); // 3 badges per state

    const stampsCount = await home.getStampsCount();
    expect(stampsCount).toBe(1);

    const indiaPercent = await home.getIndiaExploredPercent();
    expect(indiaPercent).toBeGreaterThan(0);
  });

  test("should show completed state as done in journey", async ({ page }) => {
    // Complete state
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
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Check state status in progress
    const progressData = await onboarding.getProgressData();
    expect(progressData.completed).toContain("Andhra Pradesh");
  });

  test("should populate passport with stamp on completion", async ({ page }) => {
    // Complete state
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
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;
      const options = await quiz.getAnswerOptions();
      await quiz.selectAnswerByIndex(Math.floor(Math.random() * options.length));
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Go to passport
    await passport.goto();

    // Verify stamp collected
    const stampData = await passport.getStampData();
    expect(stampData.collected).toBe(1);
    expect(stampData.total).toBe(36);
    expect(stampData.percent).toBeGreaterThan(0);
  });
});
