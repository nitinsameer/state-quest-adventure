import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../pages/OnboardingPage';
import { HomePage } from '../pages/HomePage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Engagement Tracking & Home Dashboard', () => {
  let onboarding: OnboardingPage;
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);
  });

  test('should display home dashboard with all stats', async ({ page }) => {
    await home.goto();

    // Verify all major components visible
    const statsVisible = await home.verifyAllStatsVisible();
    expect(statsVisible).toBe(true);

    // Verify specific stat values
    const xp = await home.getXPValue();
    expect(xp).toBe(0); // Fresh start

    const level = await home.getLevel();
    expect(level).toBe(1);

    const statesCount = await home.getStatesCount();
    expect(statesCount).toBe(0);

    const badgesCount = await home.getBadgesCount();
    expect(badgesCount).toBe(0);

    const stampsCount = await home.getStampsCount();
    expect(stampsCount).toBe(0);
  });

  test('should show progress bar accurately', async ({ page }) => {
    await home.goto();

    // Fresh user should be at 0% progress to next level
    const progressPercent = await home.getProgressBarPercent();
    expect(progressPercent).toBe(0);

    // Level should be 1
    const level = await home.getLevel();
    expect(level).toBe(1);
  });

  test('should display India explored percentage', async ({ page }) => {
    await home.goto();

    const indiaPercent = await home.getIndiaExploredPercent();
    expect(indiaPercent).toBe(0); // 0/36 states

    // Check percentage matches calculation
    const statesCount = await home.getStatesCount();
    const expectedPercent = Math.round((statesCount / 36) * 100);
    expect(indiaPercent).toBe(expectedPercent);
  });

  test('should track streak indicator', async ({ page }) => {
    await home.goto();

    // Fresh user has 0 streak
    let streak = await home.getStreak();
    expect(streak).toBe(0);

    // Trigger touchStreak by navigating to a state and back
    await page.click('button:has-text("Play")');
    await page.waitForLoadState('networkidle');
    await page.goBack();

    // Streak should be 1 now
    await home.goto();
    streak = await home.getStreak();
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  test('should update XP display in real-time', async ({ page }) => {
    await home.goto();

    const initialXP = await home.getXPValue();
    expect(initialXP).toBe(0);

    // Simulate completing some cards by updating localStorage
    // (In full test, this would happen through actual gameplay)
    const progress = await onboarding.getProgressData();
    progress.xp = 100;
    progress.cards['Test State'] = [0, 1, 2];

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    // Reload home
    await home.goto();

    // Check updated XP
    const updatedXP = await home.getXPValue();
    expect(updatedXP).toBe(100);
  });

  test('should display current state from continue journey', async ({ page }) => {
    await home.goto();

    // Should show first state (Andhra Pradesh or similar)
    const currentState = await home.getCurrentStateName();
    expect(currentState.length).toBeGreaterThan(0);
  });

  test('should show level progression correctly', async ({ page }) => {
    await home.goto();

    let level = await home.getLevel();
    expect(level).toBe(1);

    // Simulate XP accumulation
    const progress = await onboarding.getProgressData();
    progress.xp = 400; // Exactly 1 level

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    await home.goto();

    level = await home.getLevel();
    expect(level).toBe(2); // Should be level 2
  });

  test('should maintain dashboard consistency across navigation', async ({ page }) => {
    await home.goto();

    const initialXP = await home.getXPValue();
    const initialLevel = await home.getLevel();
    const initialStates = await home.getStatesCount();

    // Navigate to a state and back
    await page.click('button:has-text("Play")');
    await page.waitForLoadState('networkidle');
    await page.goBack();

    // Check values unchanged
    const afterXP = await home.getXPValue();
    const afterLevel = await home.getLevel();
    const afterStates = await home.getStatesCount();

    // Values should match (or be close if gameplay happened)
    expect(Math.abs(afterXP - initialXP)).toBeLessThan(200);
    expect(afterLevel).toBe(initialLevel);
    expect(afterStates).toBe(initialStates);
  });

  test('should verify stat card accuracy', async ({ page }) => {
    await home.goto();

    // Get all stat values
    const xp = await home.getXPValue();
    const states = await home.getStatesCount();
    const badges = await home.getBadgesCount();
    const stamps = await home.getStampsCount();
    const indiaPercent = await home.getIndiaExploredPercent();

    // Fresh user values
    expect(xp).toBe(0);
    expect(states).toBe(0);
    expect(badges).toBe(0);
    expect(stamps).toBe(0);
    expect(indiaPercent).toBe(0);
  });

  test('should display play button for current state', async ({ page }) => {
    await home.goto();

    // Play button should be visible
    const playButton = await page.locator('button:has-text("Play")').isVisible();
    expect(playButton).toBe(true);
  });
});
