import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Comprehensive Screen Tests for Play Store Readiness
 * Tests all major screens at multiple viewport sizes and font scales
 * - No horizontal scroll
 * - No overlap with bottom nav
 * - No color contrast violations
 * - Screenshots captured for visual review
 */

const VIEWPORTS = [
  { width: 360, height: 800, name: "360x800" },
  { width: 411, height: 891, name: "411x891" },
];

const FONT_SCALES = [1.0, 1.3];

// Helper to check for horizontal scroll
async function checkNoHorizontalScroll(page: any, screenName: string) {
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalScroll) {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    throw new Error(
      `${screenName}: Horizontal scroll detected (scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth})`,
    );
  }
}

// Helper to check bottom nav overlap
async function checkNoBottomNavOverlap(page: any, screenName: string) {
  const overlaps = await page.evaluate(() => {
    // Find bottom nav
    const navSelectors = [
      'nav[class*="bottom"]',
      '[class*="BottomNav"]',
      'nav[class*="fixed"][class*="bottom"]',
      'div[class*="fixed"][class*="bottom"] nav',
    ];

    let bottomNav: Element | null = null;
    for (const selector of navSelectors) {
      bottomNav = document.querySelector(selector);
      if (bottomNav) break;
    }

    if (!bottomNav) return [];

    const navRect = bottomNav.getBoundingClientRect();
    const allElements = Array.from(document.querySelectorAll("*"));

    const overlapping: string[] = [];
    for (const el of allElements) {
      if (el === bottomNav || bottomNav.contains(el) || el.contains(bottomNav)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      // Check if element overlaps with nav
      if (
        rect.bottom > navRect.top &&
        rect.top < navRect.bottom &&
        rect.right > navRect.left &&
        rect.left < navRect.right
      ) {
        const tagInfo = `${el.tagName}${el.className ? "." + el.className.split(" ")[0] : ""}`;
        overlapping.push(tagInfo);
      }
    }

    return overlapping.slice(0, 5); // Limit to first 5
  });

  if (overlaps.length > 0) {
    throw new Error(`${screenName}: Elements overlapping bottom nav: ${overlaps.join(", ")}`);
  }
}

// Helper to check contrast with axe
async function checkContrast(page: any, screenName: string) {
  const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();

  const violations = results.violations.filter((v) => v.id === "color-contrast");

  if (violations.length > 0) {
    const details = violations
      .map((v) => v.nodes.map((n) => `  ${n.failureSummary}`).join("\n"))
      .join("\n");
    throw new Error(`${screenName}: Color contrast violations:\n${details}`);
  }
}

// Helper to wait for page to be ready
async function waitForReady(page: any) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000); // Extra time for animations
}

// Helper to complete onboarding if needed
async function ensureOnboarded(page: any) {
  const url = page.url();
  if (url.includes("/welcome")) {
    // Quick onboarding
    await page.fill('input[type="text"]', "TestUser");
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForTimeout(500);

    // Skip through any additional steps
    for (let i = 0; i < 5; i++) {
      const continueBtn = page.locator(
        'button:has-text("Continue"), button:has-text("Next"), button:has-text("Start")',
      );
      if (await continueBtn.isVisible().catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
  }
}

test.describe("Screen Tests - Play Store Readiness", () => {
  for (const viewport of VIEWPORTS) {
    for (const fontScale of FONT_SCALES) {
      const testName = `${viewport.name}_scale${fontScale}`;
      const screenshotDir = `test-screenshots/${testName}`;

      test.describe(`${viewport.name} @ ${fontScale}x font`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });

          // Set font scale using CSS zoom on html element
          if (fontScale !== 1.0) {
            await page.addInitScript((scale) => {
              document.documentElement.style.fontSize = `${scale * 100}%`;
            }, fontScale);
          }
        });

        test("01. Home screen", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/home");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Home");
          await checkNoBottomNavOverlap(page, "Home");
          await checkContrast(page, "Home");
          await page.screenshot({ path: `${screenshotDir}/01-home.png`, fullPage: true });
        });

        test("02. Journey screen", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/journey");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Journey");
          await checkNoBottomNavOverlap(page, "Journey");
          await checkContrast(page, "Journey");
          await page.screenshot({ path: `${screenshotDir}/02-journey.png`, fullPage: true });
        });

        test("03. Explorer screen", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/explorer");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Explorer");
          await checkNoBottomNavOverlap(page, "Explorer");
          await checkContrast(page, "Explorer");
          await page.screenshot({ path: `${screenshotDir}/03-explorer.png`, fullPage: true });
        });

        test("04. State hub (Andhra Pradesh)", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/state/Andhra%20Pradesh");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "State Hub");
          await checkContrast(page, "State Hub");
          await page.screenshot({ path: `${screenshotDir}/04-state-hub.png`, fullPage: true });
        });

        test("05. Learning card", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/state/Andhra%20Pradesh/card/0");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Learning Card");
          await checkContrast(page, "Learning Card");
          await page.screenshot({ path: `${screenshotDir}/05-learning-card.png`, fullPage: true });
        });

        test("06. Quiz question", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/state/Andhra%20Pradesh/quiz");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Quiz");
          await checkContrast(page, "Quiz");
          await page.screenshot({ path: `${screenshotDir}/06-quiz.png`, fullPage: true });
        });

        test("07. Celebration screen", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);

          // Try to trigger celebration by completing a state
          // If not possible, navigate to complete route directly
          await page.goto("/state/Andhra%20Pradesh/complete");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Celebration");
          await checkContrast(page, "Celebration");
          await page.screenshot({ path: `${screenshotDir}/07-celebration.png`, fullPage: true });
        });

        test("08. Badges - Achievements tab - Grid view", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/achievements");
          await waitForReady(page);

          // Ensure we're on achievements tab
          const achievementsTab = page
            .locator('button:has-text("Achievements"), [role="tab"]:has-text("Achievements")')
            .first();
          if (await achievementsTab.isVisible().catch(() => false)) {
            await achievementsTab.click();
            await page.waitForTimeout(500);
          }

          await checkNoHorizontalScroll(page, "Badges - Achievements");
          await checkNoBottomNavOverlap(page, "Badges - Achievements");
          await checkContrast(page, "Badges - Achievements");
          await page.screenshot({
            path: `${screenshotDir}/08-badges-achievements-grid.png`,
            fullPage: true,
          });
        });

        test("09. Badges - State Badges tab - Grid view", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/badges");
          await waitForReady(page);

          // Switch to State Badges tab if available
          const stateBadgesTab = page
            .locator('button:has-text("State"), [role="tab"]:has-text("State")')
            .first();
          if (await stateBadgesTab.isVisible().catch(() => false)) {
            await stateBadgesTab.click();
            await page.waitForTimeout(500);
          }

          // Ensure Grid view
          const gridBtn = page.locator('button:has-text("Grid")').first();
          if (await gridBtn.isVisible().catch(() => false)) {
            await gridBtn.click();
            await page.waitForTimeout(500);
          }

          await checkNoHorizontalScroll(page, "Badges - State Grid");
          await checkNoBottomNavOverlap(page, "Badges - State Grid");
          await checkContrast(page, "Badges - State Grid");
          await page.screenshot({
            path: `${screenshotDir}/09-badges-state-grid.png`,
            fullPage: true,
          });
        });

        test("10. Badges - State Badges tab - Card view", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/badges");
          await waitForReady(page);

          // Switch to State Badges tab
          const stateBadgesTab = page
            .locator('button:has-text("State"), [role="tab"]:has-text("State")')
            .first();
          if (await stateBadgesTab.isVisible().catch(() => false)) {
            await stateBadgesTab.click();
            await page.waitForTimeout(500);
          }

          // Switch to Card view
          const cardBtn = page.locator('button:has-text("Card")').first();
          if (await cardBtn.isVisible().catch(() => false)) {
            await cardBtn.click();
            await page.waitForTimeout(500);
          }

          await checkNoHorizontalScroll(page, "Badges - State Card");
          await checkNoBottomNavOverlap(page, "Badges - State Card");
          await checkContrast(page, "Badges - State Card");
          await page.screenshot({
            path: `${screenshotDir}/10-badges-state-card.png`,
            fullPage: true,
          });
        });

        test("11. Badges - State Badges tab - List view", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/badges");
          await waitForReady(page);

          // Switch to State Badges tab
          const stateBadgesTab = page
            .locator('button:has-text("State"), [role="tab"]:has-text("State")')
            .first();
          if (await stateBadgesTab.isVisible().catch(() => false)) {
            await stateBadgesTab.click();
            await page.waitForTimeout(500);
          }

          // Switch to List view
          const listBtn = page.locator('button:has-text("List")').first();
          if (await listBtn.isVisible().catch(() => false)) {
            await listBtn.click();
            await page.waitForTimeout(500);
          }

          await checkNoHorizontalScroll(page, "Badges - State List");
          await checkNoBottomNavOverlap(page, "Badges - State List");
          await checkContrast(page, "Badges - State List");
          await page.screenshot({
            path: `${screenshotDir}/11-badges-state-list.png`,
            fullPage: true,
          });
        });

        test("12. Me screen", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/me");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Me");
          await checkNoBottomNavOverlap(page, "Me");
          await checkContrast(page, "Me");
          await page.screenshot({ path: `${screenshotDir}/12-me.png`, fullPage: true });
        });

        test("13. Parent gate", async ({ page }) => {
          await page.goto("/");
          await ensureOnboarded(page);
          await page.goto("/parent");
          await waitForReady(page);

          await checkNoHorizontalScroll(page, "Parent Gate");
          await checkContrast(page, "Parent Gate");
          await page.screenshot({ path: `${screenshotDir}/13-parent-gate.png`, fullPage: true });
        });
      });
    }
  }
});
