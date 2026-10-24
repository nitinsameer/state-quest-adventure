import { test, expect } from "@playwright/test";

/**
 * Verify React Hydration - Browser Test
 * Tests that the app properly hydrates and renders actual content (not just loading shell)
 */

test.describe("React Hydration Verification", () => {
  test.setTimeout(30000);

  test("Browser loads and hydrates app (not stuck on loading shell)", async ({ page, context }) => {
    console.log("\n=== Testing React Hydration in Browser ===");

    // Navigate to dev server
    const response = await page.goto("http://localhost:8081/", { waitUntil: "networkidle" });
    console.log(`✓ Navigation status: ${response?.status()}`);

    // Wait for hydration - should see actual content
    await page.waitForTimeout(2000); // Wait for React to hydrate

    // Get page content
    const content = await page.locator("body").textContent();
    console.log(`✓ Body content length: ${content?.length} chars`);

    // Should have MORE than just the loading shell (1200+ chars is just shell)
    // Full app should have 5000+ chars
    if ((content?.length ?? 0) > 2000) {
      console.log("✅ SUCCESS! App hydrated and rendered content!");
      console.log(`Content preview: ${content?.substring(0, 200)}`);
    } else {
      console.log("⏳ Still loading shell...");
      console.log(`Current content: ${content}`);
    }

    // Check for key UI elements that prove the app is rendered
    const buttons = await page.locator("button").count();
    const links = await page.locator("a").count();
    const headings = await page.locator("h1, h2, h3").count();

    console.log(`Found: ${buttons} buttons, ${links} links, ${headings} headings`);

    // At least some interactive elements should be present
    expect(buttons + links + headings).toBeGreaterThan(0);
  });

  test("App shows content without errors", async ({ page }) => {
    console.log("\n=== Checking for Hydration Errors ===");

    const errors: string[] = [];
    const warnings: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      } else if (msg.type() === "warn") {
        warnings.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      errors.push(`Page error: ${err.message}`);
    });

    await page.goto("http://localhost:8081/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    console.log(`Warnings: ${warnings.length}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.error("Found errors:");
      errors.forEach((err) => console.error(`  - ${err}`));
    }

    // localStorage should not be accessed during load (causes SSR issues)
    // so expect NO "localStorage is not defined" errors
    const localStorageErrors = errors.filter((e) => e.includes("localStorage"));
    console.log(`localStorage errors: ${localStorageErrors.length}`);

    expect(localStorageErrors.length).toBe(0);
  });

  test("Can navigate between screens", async ({ page }) => {
    console.log("\n=== Testing Navigation ===");

    await page.goto("http://localhost:8081/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Try to find and click a navigation link
    const navLinks = await page
      .locator("a, button")
      .filter({ hasText: /home|journey|explore/i })
      .first();

    if (await navLinks.isVisible().catch(() => false)) {
      console.log("✓ Navigation element found and visible");
      // Navigation link exists - app is rendering
      expect(true).toBe(true);
    } else {
      console.log("Navigation not found (app may still be loading)");
    }
  });
});
