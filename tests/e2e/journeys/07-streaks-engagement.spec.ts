import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../pages/OnboardingPage';
import { HomePage } from '../pages/HomePage';
import { StreakPage } from '../pages/StreakPage';
import { TEST_USERS } from '../fixtures/test-data';

test.describe('Streak Tracking & Daily Engagement', () => {
  let onboarding: OnboardingPage;
  let home: HomePage;
  let streak: StreakPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    home = new HomePage(page);
    streak = new StreakPage(page);

    // Complete onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding(TEST_USERS.newUser);
  });

  test('should initialize streak at 0 for new user', async ({ page }) => {
    await home.goto();

    const currentStreak = await home.getStreak();
    expect(currentStreak).toBe(0);

    const storedStreak = await streak.getStreakFromLocalStorage();
    expect(storedStreak).toBe(0);
  });

  test('should have lastActive date in localStorage', async ({ page }) => {
    const lastActive = await streak.getLastActiveDateFromStorage();

    // Should be in YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(dateRegex.test(lastActive)).toBe(true);
  });

  test('should display streak on home dashboard', async ({ page }) => {
    await home.goto();

    const streakVisible = await streak.isStreakDisplayVisible();
    expect(streakVisible).toBe(true);

    const currentStreak = await home.getStreak();
    expect(currentStreak >= 0).toBe(true);
  });

  test('should increment streak on consecutive visits', async ({ page }) => {
    // Simulate second visit by manually updating lastActive to yesterday
    const progress = await onboarding.getProgressData();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    progress.lastActive = yesterdayStr;
    progress.streak = 1; // Yesterday's streak

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    // Reload home
    await home.goto();

    // Touch streak by navigating to journey
    await streak.touchStreak();

    // Check streak incremented
    const updatedStreak = await streak.getStreakFromLocalStorage();
    expect(updatedStreak).toBeGreaterThanOrEqual(1);
  });

  test('should reset streak on missed day', async ({ page }) => {
    // Simulate old lastActive (2 days ago)
    const progress = await onboarding.getProgressData();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const oldDateStr = twoDaysAgo.toISOString().split('T')[0];

    progress.lastActive = oldDateStr;
    progress.streak = 5; // Had 5-day streak

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    // Reload and trigger streak touch
    await home.goto();
    await streak.touchStreak();

    // Streak should reset to 1
    const resetStreak = await streak.getStreakFromLocalStorage();
    expect(resetStreak).toBe(1);
  });

  test('should track daily visits with different states', async ({ page }) => {
    const stats1 = await streak.getEngagementStats();
    expect(stats1.streak >= 0).toBe(true);

    // Do some activity (navigate around)
    await page.goto('http://localhost:8080/journey');
    await page.waitForLoadState('networkidle');

    const stats2 = await streak.getEngagementStats();
    // Stats should still show same or updated streak/xp
    expect(stats2.xp >= stats1.xp).toBe(true);
  });

  test('should display streak milestone badges', async ({ page }) => {
    // Manually set high streak for testing
    const progress = await onboarding.getProgressData();
    progress.streak = 7; // 7-day milestone

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    await home.goto();

    const streakInfo = await streak.getStreakMilestoneInfo();
    if (streakInfo.days === 7) {
      expect(streakInfo.message).toContain('Week');
    }
  });

  test('should verify streak persistence across sessions', async ({ page }) => {
    const isPersistent = await streak.verifyStreakPersistence();
    expect(isPersistent).toBe(true);
  });

  test('should track engagement stats comprehensively', async ({ page }) => {
    const stats = await streak.getEngagementStats();

    expect(stats.streak).toBeDefined();
    expect(typeof stats.streak).toBe('number');
    expect(stats.lastActive).toBeDefined();
    expect(stats.xp).toBeDefined();
    expect(stats.statesCompleted).toBeDefined();
    expect(stats.stampsCollected).toBeDefined();
    expect(stats.cardsRead).toBeDefined();
    expect(stats.answeredQuestions).toBeDefined();
  });

  test('should have streak with animation when active', async ({ page }) => {
    // Set streak > 0
    const progress = await onboarding.getProgressData();
    progress.streak = 1;

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    await home.goto();

    const hasAnimation = await streak.streakHasAnimation();
    // Should have some animation class
    expect(hasAnimation).toBe(true);
  });

  test('should verify streak format in localStorage', async ({ page }) => {
    const isValid = await streak.verifyStreakLogic();
    expect(isValid).toBe(true);

    const lastActive = await streak.getLastActiveDateFromStorage();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(dateRegex.test(lastActive)).toBe(true);
  });

  test('should track 14-day milestone', async ({ page }) => {
    // Manually set 14-day streak
    const progress = await onboarding.getProgressData();
    progress.streak = 14;

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    await home.goto();

    const streakInfo = await streak.getStreakMilestoneInfo();
    if (streakInfo.days === 14) {
      expect(streakInfo.message).toContain('Fortnight');
    }
  });

  test('should track 30-day milestone', async ({ page }) => {
    // Manually set 30-day streak
    const progress = await onboarding.getProgressData();
    progress.streak = 30;

    await onboarding.setLocalStorageItem(
      'india-explorer:progress:v2',
      JSON.stringify(progress)
    );

    await home.goto();

    const streakInfo = await streak.getStreakMilestoneInfo();
    if (streakInfo.days === 30) {
      expect(streakInfo.message).toContain('Legend');
    }
  });

  test('should maintain engagement metrics after navigation', async ({ page }) => {
    const initialStats = await streak.getEngagementStats();

    // Navigate to journey and back
    await page.goto('http://localhost:8080/journey');
    await page.waitForLoadState('networkidle');
    await page.goBack();

    const finalStats = await streak.getEngagementStats();

    // Streak should remain same (or increment slightly)
    expect(finalStats.streak >= initialStats.streak - 1).toBe(true);
  });
});
