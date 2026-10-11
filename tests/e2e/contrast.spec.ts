import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper to check contrast on a page
async function checkContrast(page: ReturnType<typeof test.prototype.page>, label: string) {
  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze();
  const violations = results.violations.filter(
    (v) => v.id === 'color-contrast'
  );
  if (violations.length > 0) {
    const details = violations
      .map((v) =>
        v.nodes.map((n) => `  ${n.failureSummary} — ${n.html.slice(0, 120)}`).join('\n')
      )
      .join('\n');
    throw new Error(`Color contrast violations on ${label}:\n${details}`);
  }
}

test.describe('Color contrast regression', () => {
  test.beforeEach(async ({ page }) => {
    // Set a reasonable mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('Home screen has no contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await checkContrast(page, 'Home');
  });

  test('Journey screen has no contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to Journey tab
    const journeyTab = page.locator('[data-testid="nav-map"], [aria-label*="Journey"], button:has-text("Journey")').first();
    if (await journeyTab.isVisible()) {
      await journeyTab.click();
      await page.waitForLoadState('networkidle');
    }
    await checkContrast(page, 'Journey');
  });

  test('Explore screen has no contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to Explore/Explorer tab
    const exploreTab = page.locator('[data-testid="nav-explorer"], [aria-label*="Explore"], button:has-text("Explore")').first();
    if (await exploreTab.isVisible()) {
      await exploreTab.click();
      await page.waitForLoadState('networkidle');
    }
    await checkContrast(page, 'Explore');
  });

  test('Badges - Achievement tab has no contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Navigate to Me/Profile
    const meTab = page.locator('[data-testid="nav-profile"], [aria-label*="Me"], button:has-text("Me")').first();
    if (await meTab.isVisible()) {
      await meTab.click();
      await page.waitForLoadState('networkidle');
    }
    // Navigate to Badges (look for common patterns)
    const badgesLink = page.locator('a:has-text("Badges"), button:has-text("Badges"), [data-testid*="badge"]').first();
    if (await badgesLink.isVisible()) {
      await badgesLink.click();
      await page.waitForLoadState('networkidle');
    }
    await checkContrast(page, 'Badges - Achievement tab');
  });

  test('Me screen has no contrast violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const meTab = page.locator('[data-testid="nav-profile"], [aria-label*="Me"], button:has-text("Me")').first();
    if (await meTab.isVisible()) {
      await meTab.click();
      await page.waitForLoadState('networkidle');
    }
    await checkContrast(page, 'Me');
  });
});
