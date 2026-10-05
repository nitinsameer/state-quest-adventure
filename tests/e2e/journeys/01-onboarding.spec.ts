import { test, expect } from '@playwright/test';
import { OnboardingPage } from '../pages/OnboardingPage';
import { HomePage } from '../pages/HomePage';
import { TEST_USERS, STORAGE_KEYS } from '../fixtures/test-data';

test.describe('Onboarding & Profile Creation', () => {
  test('should complete full onboarding flow', async ({ page }) => {
    const onboarding = new OnboardingPage(page);
    const home = new HomePage(page);

    // Start onboarding
    await onboarding.goto();

    // Complete onboarding
    await onboarding.completeOnboarding({
      avatar: TEST_USERS.newUser.avatar,
      ageBand: TEST_USERS.newUser.ageBand,
      acceptAudio: TEST_USERS.newUser.acceptAudio,
    });

    // Verify redirect to home
    expect(page.url()).toContain('/home');

    // Verify home is displayed
    expect(await home.isHomeDisplayed()).toBe(true);

    // Verify user data is onboarded
    const progress = await onboarding.getProgressData();
    expect(progress.onboarded).toBe(true);
    expect(progress.ageBand).toBe('8-9');
    expect(progress.xp).toBe(0); // Fresh start
    expect(progress.completed).toEqual([]); // No states completed
  });

  test('should prevent unauthenticated access to home', async ({ page }) => {
    const onboarding = new OnboardingPage(page);

    // Try to directly access home
    await page.goto('http://localhost:5173/home');

    // Should redirect to welcome/onboarding
    await page.waitForURL(/welcome|onboarding/, { timeout: 5000 });

    // Verify not on home
    expect(page.url()).not.toContain('/home');
  });

  test('should save avatar and age band to localStorage', async ({ page }) => {
    const onboarding = new OnboardingPage(page);

    await onboarding.goto();
    await onboarding.completeOnboarding({
      avatar: TEST_USERS.youngUser.avatar,
      ageBand: TEST_USERS.youngUser.ageBand,
    });

    const progress = await onboarding.getProgressData();

    expect(progress.avatar).toBeDefined();
    expect(progress.ageBand).toBe('3-5');
    expect(progress.onboarded).toBe(true);
  });

  test('should show correct avatar selection count', async ({ page }) => {
    const onboarding = new OnboardingPage(page);

    await onboarding.goto();
    await onboarding.waitForCreateProfileScreen();

    const avatarCount = await onboarding.getAvatarCount();
    expect(avatarCount).toBe(12); // Standard avatar count
  });

  test('should reset app and restart onboarding', async ({ page }) => {
    const onboarding = new OnboardingPage(page);

    // Complete first onboarding
    await onboarding.goto();
    await onboarding.completeOnboarding();

    // Verify onboarded
    let progress = await onboarding.getProgressData();
    expect(progress.onboarded).toBe(true);

    // Reset app
    await onboarding.resetApp();

    // Verify back to onboarding
    await onboarding.waitForCreateProfileScreen();

    // Verify localStorage cleared
    progress = await onboarding.getProgressData();
    expect(progress.onboarded).toBe(false);
  });
});
