import { test, expect } from "@playwright/test";

/**
 * MINIMAL SMOKE TEST - Verify Playwright can launch installed Google Chrome
 */
test.describe("Smoke Test: Chrome Launch", () => {
  test("1. Chrome browser launches", async ({ page }) => {
    console.log("\n========== SMOKE TEST: CHROME LAUNCH ==========");

    // Simple page load
    await page.goto("http://localhost:8080");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    expect(page).toBeTruthy();
    console.log("✓ Chrome launched successfully");
    console.log("✓ Page loaded at http://localhost:8080");
  });

  test("2. App renders without immediate crash", async ({ page }) => {
    console.log("\n========== SMOKE TEST: APP RENDER ==========");

    await page.goto("http://localhost:8080");
    await page.waitForLoadState("networkidle");

    // Check body exists and has content
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(10);

    console.log("✓ App rendered with content");
  });
});
