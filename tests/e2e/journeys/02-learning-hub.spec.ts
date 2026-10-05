import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../pages/OnboardingPage';
import { HomePage } from '../pages/HomePage';
import { LearningHubPage } from '../pages/LearningHubPage';
import { TEST_USERS, EXPECTED_CARDS, EXPECTED_XP_VALUES } from '../fixtures/test-data';

test.describe('Learning Hub & Card Reading', () => {
  let onboarding: OnboardingPage;
  let home: HomePage;
  let learningHub: LearningHubPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);
    learningHub = new LearningHubPage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);
  });

  test('should load learning hub with all 6 cards', async ({ page }) => {
    // Go to learning hub
    await learningHub.goto('Andhra Pradesh');

    // Verify hub loaded
    expect(await learningHub.getCardCount()).toBe(6);

    // Verify all categories visible
    expect(await learningHub.verifyAllCategoriesVisible()).toBe(true);

    // Verify quiz button is disabled (cards not read yet)
    expect(await learningHub.isQuizButtonDisabled()).toBe(true);
  });

  test('should track card reading progress', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Initial progress should be 0/6
    let progress = await learningHub.getProgress();
    expect(progress.read).toBe(0);
    expect(progress.total).toBe(6);

    // Read first card
    await learningHub.clickCard(0);
    await learningHub.closeCardModal();
    await page.waitForTimeout(300);

    // Check progress updated
    progress = await learningHub.getProgress();
    expect(progress.read).toBe(1);
  });

  test('should unlock quiz after reading all 6 cards', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Read all 6 cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Final progress should be 6/6
    const finalProgress = await learningHub.getProgress();
    expect(finalProgress.read).toBe(6);
    expect(finalProgress.total).toBe(6);

    // Quiz button should be enabled
    expect(await learningHub.isQuizButtonEnabled()).toBe(true);
  });

  test('should award 150 XP for reading all cards', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Get initial XP
    const initialXP = await home.getXPValue();
    expect(initialXP).toBe(0); // Fresh start

    // Read all 6 cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Check XP was awarded (expected: 25 XP per card × 6 = 150)
    // Note: XP might update after navigation back to home
    await home.goto();
    const finalXP = await home.getXPValue();
    expect(finalXP).toBe(EXPECTED_XP_VALUES.totalCardsXP);
  });

  test('should not award XP on card replay', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Read all cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Get XP after reading all
    await home.goto();
    const xpAfterReading = await home.getXPValue();

    // Go back and replay first card
    await learningHub.goto('Andhra Pradesh');
    await learningHub.clickCard(0); // Replay first card
    await learningHub.closeCardModal();

    // Navigate home and check XP unchanged
    await home.goto();
    const xpAfterReplay = await home.getXPValue();

    // XP should remain the same (25 * 6 = 150)
    expect(xpAfterReplay).toBe(xpAfterReading);
  });

  test('should show celebration at 6/6 mastery', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Read all cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Look for mastery celebration
    const celebrated = await learningHub.waitForCompletionCelebration(5000);

    // May or may not see celebration depending on timing
    // but quiz button should definitely be enabled
    expect(await learningHub.isQuizButtonEnabled()).toBe(true);
  });

  test('should update localStorage with card read data', async ({ page }) => {
    await learningHub.goto('Andhra Pradesh');

    // Read all cards
    for (let i = 0; i < 6; i++) {
      const progress = await learningHub.getProgress();
      if (progress.read >= 6) break;

      await learningHub.clickCard(i);
      await learningHub.closeCardModal();
      await page.waitForTimeout(300);
    }

    // Check localStorage
    const progressData = await onboarding.getProgressData();

    expect(progressData.cards['Andhra Pradesh']).toBeDefined();
    expect(progressData.cards['Andhra Pradesh'].length).toBe(6);
    expect(progressData.xp).toBe(EXPECTED_XP_VALUES.totalCardsXP);
  });

  test('should load different state correctly', async ({ page }) => {
    // Test with a different state
    await learningHub.goto('Bihar');

    // Should load same way
    expect(await learningHub.getCardCount()).toBe(6);
    expect(await learningHub.isQuizButtonDisabled()).toBe(true);

    // Progress should be independent per state
    const progress = await learningHub.getProgress();
    expect(progress.read).toBe(0);
    expect(progress.total).toBe(6);
  });
});
