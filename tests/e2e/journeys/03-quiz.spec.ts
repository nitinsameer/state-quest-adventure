import { test, expect } from "@playwright/test";
import { OnboardingPage } from "../pages/OnboardingPage";
import { HomePage } from "../pages/HomePage";
import { LearningHubPage } from "../pages/LearningHubPage";
import { QuizPage } from "../pages/QuizPage";
import { TEST_USERS, EXPECTED_QUIZ_FORMAT, EXPECTED_XP_VALUES } from "../fixtures/test-data";

test.describe("Quiz System & Scoring", () => {
  let onboarding: OnboardingPage;
  let home: HomePage;
  let learningHub: LearningHubPage;
  let quiz: QuizPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);
    learningHub = new LearningHubPage(page);
    quiz = new QuizPage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);

    // Complete learning hub
    await learningHub.goto("Andhra Pradesh");
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Click quiz button
    await learningHub.clickQuizButton();
  });

  test("should generate quiz with correct number of questions", async ({ page }) => {
    // Age band 8-9 should get 7 questions
    const totalQuestions = await quiz.getTotalQuestions();
    expect(totalQuestions).toBe(EXPECTED_QUIZ_FORMAT.questionsFor_8_9);
  });

  test("should display 4 options per question", async ({ page }) => {
    // Verify first question has 4 options
    const optionCount = await quiz.getAnswerCount();
    expect(optionCount).toBe(EXPECTED_QUIZ_FORMAT.optionsPerQuestion);

    // Verify all options have text
    const options = await quiz.getAnswerOptions();
    expect(options.length).toBe(4);
    expect(options.every((o) => o.trim().length > 0)).toBe(true);
  });

  test("should not have duplicate options in questions", async ({ page }) => {
    // Check first question for duplicates
    const hasDuplicates = await quiz.hasDuplicateOptions();
    expect(hasDuplicates).toBe(false);
  });

  test("should navigate through quiz questions", async ({ page }) => {
    let currentQ = await quiz.getCurrentQuestion();
    expect(currentQ).toBe(1);

    // Answer first question
    const options = await quiz.getAnswerOptions();
    await quiz.selectAnswerByIndex(0);
    await page.waitForTimeout(500);

    // Should move to next question
    currentQ = await quiz.getCurrentQuestion();
    expect(currentQ).toBeGreaterThan(1);
  });

  test("should complete quiz and show score", async ({ page }) => {
    const totalQuestions = await quiz.getTotalQuestions();

    // Answer all questions (randomly)
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;

      const options = await quiz.getAnswerOptions();
      const randomIndex = Math.floor(Math.random() * options.length);
      await quiz.selectAnswerByIndex(randomIndex);
      await page.waitForTimeout(300);
    }

    // Wait for completion screen
    const completed = await quiz.waitForCompletionScreen(10000);
    expect(completed).toBe(true);

    // Get score
    const score = await quiz.getFinalScore();
    expect(score.correct).toBeGreaterThanOrEqual(0);
    expect(score.total).toBe(totalQuestions);
  });

  test("should award XP for correct answers", async ({ page }) => {
    const initialXP = await home.getXPValue();
    const expectedFromCards = 150; // 6 cards � 25 XP

    // Complete quiz (randomly)
    const totalQuestions = await quiz.getTotalQuestions();
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;

      const options = await quiz.getAnswerOptions();
      const randomIndex = Math.floor(Math.random() * options.length);
      await quiz.selectAnswerByIndex(randomIndex);
      await page.waitForTimeout(300);
    }

    // Wait for completion
    await quiz.waitForCompletionScreen(10000);

    // Get score (each question = 20 XP, fun fact = 25 XP)
    const score = await quiz.getFinalScore();

    // Click continue
    await quiz.clickContinue();

    // Navigate back to home
    await home.goto();

    // Check XP updated
    const finalXP = await home.getXPValue();
    const expectedQuizXP = score.correct * 20; // Rough estimate (fun fact is 25)
    const expectedTotal = expectedFromCards + expectedQuizXP;

    expect(finalXP).toBeGreaterThan(expectedFromCards);
  });

  test("should track quiz performance in statePerformance", async ({ page }) => {
    // Complete quiz
    const totalQuestions = await quiz.getTotalQuestions();
    for (let i = 0; i < totalQuestions; i++) {
      const currentQ = await quiz.getCurrentQuestion();
      if (currentQ > totalQuestions) break;

      const options = await quiz.getAnswerOptions();
      const randomIndex = Math.floor(Math.random() * options.length);
      await quiz.selectAnswerByIndex(randomIndex);
      await page.waitForTimeout(300);
    }

    await quiz.waitForCompletionScreen(10000);
    await quiz.clickContinue();

    // Check localStorage for statePerformance
    const progressData = await onboarding.getProgressData();
    expect(progressData.statePerformance).toBeDefined();
    expect(progressData.statePerformance["Andhra Pradesh"]).toBeDefined();

    const statePerf = progressData.statePerformance["Andhra Pradesh"];
    expect(statePerf.quizCompletions).toBeDefined();
    expect(statePerf.quizTimes).toBeDefined();
  });

  test("should display question prompt and options clearly", async ({ page }) => {
    const questionText = await quiz.getQuestionText();
    const options = await quiz.getAnswerOptions();

    expect(questionText.length).toBeGreaterThan(0);
    expect(options.length).toBe(4);
    expect(questionText).toMatch(/[A-Za-z]/); // Has letters
  });

  test("should get correct quiz question count for age band", async ({ page }) => {
    // This test uses age band 8-9 from setup
    const totalQuestions = await quiz.getTotalQuestions();
    expect(totalQuestions).toBe(EXPECTED_QUIZ_FORMAT.questionsFor_8_9); // 7 for 8-9
  });

  test("should complete full quiz journey", async ({ page }) => {
    // Full flow: answer all � completion � continue
    await quiz.completeQuizFlow();

    // Should be back on learning hub or next screen
    expect(page.url()).not.toContain("/quiz");
  });
});
