import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

const VIEWPORTS = [
  { name: "360x800", width: 360, height: 800 }, // iPhone SE
  { name: "411x891", width: 411, height: 891 }, // Pixel 5
];

const SCREENS = [
  { name: "home", path: "/" },
  { name: "journey", path: "/journey" },
  { name: "explore", path: "/explore" },
  { name: "badges", path: "/me/badges" },
  { name: "me", path: "/me" },
  // Note: Some screens require navigation within app (state hub, learning card, quiz, etc.)
  // These will be handled via navigation steps in the test
];

test.describe("Theme System - Screenshot Baseline", () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`Viewport ${viewport.name}`, () => {
      test.beforeEach(async ({ page }) => {
        page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(BASE_URL);
        // Wait for app to hydrate and initial styles to apply
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => {
          // Ensure any animations have settled
          return new Promise((resolve) => setTimeout(resolve, 500));
        });
      });

      // Home Screen
      test(`baseline-home-${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/`);
        await page.waitForSelector('[role="main"]', { timeout: 5000 });
        await page.screenshot({
          path: `tests/e2e/baselines/baseline-home-${viewport.name}.png`,
          fullPage: false,
        });
      });

      // Journey Screen (State List)
      test(`baseline-journey-${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/journey`);
        await page.waitForSelector('[role="main"]', { timeout: 5000 });
        await page.screenshot({
          path: `tests/e2e/baselines/baseline-journey-${viewport.name}.png`,
          fullPage: false,
        });
      });

      // Explore Screen
      test(`baseline-explore-${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/explore`);
        await page.waitForSelector('[role="main"]', { timeout: 5000 });
        await page.screenshot({
          path: `tests/e2e/baselines/baseline-explore-${viewport.name}.png`,
          fullPage: false,
        });
      });

      // Badges Screen (Primary Tab)
      test(`baseline-badges-${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/me/badges`);
        await page.waitForSelector('[role="main"]', { timeout: 5000 });
        await page.screenshot({
          path: `tests/e2e/baselines/baseline-badges-${viewport.name}.png`,
          fullPage: false,
        });
      });

      // Me Screen (Profile)
      test(`baseline-me-${viewport.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/me`);
        await page.waitForSelector('[role="main"]', { timeout: 5000 });
        await page.screenshot({
          path: `tests/e2e/baselines/baseline-me-${viewport.name}.png`,
          fullPage: false,
        });
      });
    });
  }
});

test.describe("Theme System - Baseline (Full Page Screenshots)", () => {
  test.beforeEach(async ({ page }) => {
    page.setViewportSize({ width: 411, height: 891 });
  });

  test("should capture all main screens with consistent styling", async ({ page }) => {
    const screens = [
      { name: "Home", path: "/" },
      { name: "Journey", path: "/journey" },
      { name: "Explore", path: "/explore" },
      { name: "Badges", path: "/me/badges" },
      { name: "Me", path: "/me" },
    ];

    for (const screen of screens) {
      await page.goto(`${BASE_URL}${screen.path}`);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 300)));

      const fileName = `tests/e2e/baselines/baseline-${screen.name.toLowerCase()}-full.png`;
      await page.screenshot({ path: fileName, fullPage: true });

      console.log(`✓ Captured baseline: ${screen.name}`);
    }
  });
});
