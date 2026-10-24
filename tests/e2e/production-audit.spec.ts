import { test, expect } from "@playwright/test";

test.describe("PRODUCTION AUDIT - Critical Flow Tests", () => {
  test("AUDIT-01: State name mismatch check - 3 states with & vs and", async ({ page }) => {
    // Navigate to a state that should have content
    await page.goto("/state/andaman-and-nicobar-islands/learn");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "./test-screenshots/audit-01-andaman-learn.png" });

    // Check if content loaded or if we got a fallback
    const body = await page.locator("body").textContent();
    console.log("Andaman page content length:", body?.length);

    // Should NOT show card content unavailable fallback
    const hasError = await page
      .locator("text=Card content unavailable")
      .isVisible()
      .catch(() => false);
    console.log("Has error:", hasError);

    // Check what state name is being used
    const pageTitle = await page.title();
    console.log("Page title:", pageTitle);
  });

  test("AUDIT-02: Quiz URL Guard - attempt to bypass quiz before completing cards", async ({
    page,
  }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Ensure fresh state (no cards read for Andhra Pradesh)
    await page.evaluate(() => {
      const key = "india-explorer:progress:v2";
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        // Clear cards for Andhra Pradesh
        if (parsed.cards) {
          delete parsed.cards["Andhra Pradesh"];
        }
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    });

    // Attempt to navigate directly to quiz
    await page.goto("/state/andhra-pradesh/quiz");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log("After quiz bypass attempt, URL:", currentUrl);

    // Should have been redirected AWAY from quiz
    const isOnQuiz = currentUrl.includes("/quiz");
    console.log("Still on quiz page:", isOnQuiz);

    await page.screenshot({ path: "./test-screenshots/audit-02-quiz-bypass.png" });
  });

  test("AUDIT-03: Verify quiz gating logic uses correct tracking", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check progress.cards vs cardVisits structures
    const progressData = await page.evaluate(() => {
      const key = "india-explorer:progress:v2";
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    });

    if (progressData) {
      console.log("progress.cards keys:", Object.keys(progressData.cards || {}));
      console.log("progress.cardVisits keys:", Object.keys(progressData.cardVisits || {}));
    }
  });

  test("AUDIT-04: Navigate actual card flow for first state", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    // Navigate directly to state card 0 (category 0 = Capital)
    await page.goto("/state/andhra-pradesh/card/0");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "./test-screenshots/audit-04-card-0.png" });

    const hasContent = await page
      .locator("body")
      .textContent()
      .then((t) => (t?.length ?? 0) > 20);
    const hasErrorMsg = await page
      .locator("text=Card content unavailable")
      .isVisible()
      .catch(() => false);

    console.log("Card 0 loaded:", hasContent);
    console.log("Has error:", hasErrorMsg);
    console.log("Console errors:", consoleErrors.length, consoleErrors);
    console.log("Page errors:", pageErrors.length, pageErrors);

    // Check for replayCount specifically
    const hasReplayCountError = [...consoleErrors, ...pageErrors].some(
      (e) => e.toLowerCase().includes("replaycount") || e.includes("ReferenceError"),
    );

    expect(hasReplayCountError).toBe(false);
    expect(hasErrorMsg).toBe(false);

    // Now click "Got it" / Next button
    const gotItButton = page
      .locator("button")
      .filter({ hasText: /Got it|Next|Continue/i })
      .first();
    const btnVisible = await gotItButton.isVisible({ timeout: 5000 }).catch(() => false);
    console.log("Got it button visible:", btnVisible);

    if (btnVisible) {
      await gotItButton.click();
      await page.waitForTimeout(1000);

      const afterErrors = [...consoleErrors, ...pageErrors].filter(
        (e) => e.toLowerCase().includes("replaycount") || e.includes("ReferenceError"),
      );

      expect(afterErrors.length).toBe(0);
      console.log("After click - no errors!");
    }

    await page.screenshot({ path: "./test-screenshots/audit-04-card-0-after-click.png" });
  });

  test("AUDIT-05: Cross-screen consistency check", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Use window testing API to complete a state
    await page.evaluate(() => {
      const w = window as any;
      w.completeStateForTesting?.("Andhra Pradesh");
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: "./test-screenshots/audit-05-home.png" });
    const homeText = await page.locator("body").textContent();
    const homeHasAP = homeText?.includes("Andhra Pradesh") ?? false;

    // Check Journey
    await page.goto("/journey");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "./test-screenshots/audit-05-journey.png" });
    const journeyText = await page.locator("body").textContent();

    // Check Explorer
    await page.goto("/explorer");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "./test-screenshots/audit-05-explorer.png" });
    const explorerText = await page.locator("body").textContent();

    // Get progress state via window API
    const progress = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.();
    });

    console.log("Progress completed count:", progress?.length);
    console.log("Home has AP reference:", homeHasAP);

    if (progress) {
      expect(progress.length).toBeGreaterThan(0);
    }
  });

  test("AUDIT-06: State name mismatch - does Jammu & Kashmir content load?", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/state/jammu-and-kashmir/learn");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "./test-screenshots/audit-06-jk-learn.png" });

    const hasError = await page
      .locator("text=Card content unavailable")
      .isVisible()
      .catch(() => false);
    console.log("J&K content unavailable error:", hasError);
    console.log("Page errors:", pageErrors);

    // Navigate to card 0 for JK
    await page.goto("/state/jammu-and-kashmir/card/0");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await page.screenshot({ path: "./test-screenshots/audit-06-jk-card-0.png" });
    const hasCardError = await page
      .locator("text=Card content unavailable")
      .isVisible()
      .catch(() => false);
    console.log("J&K card content unavailable:", hasCardError);
  });

  test("AUDIT-07: Duplicate reward protection", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Get initial XP
    const xpBefore = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.()?.xp ?? 0;
    });

    // Complete the same state twice
    await page.evaluate(() => {
      const w = window as any;
      w.completeStateForTesting?.("Goa");
    });
    await page.waitForTimeout(300);

    const xpAfterFirst = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.()?.xp ?? 0;
    });

    await page.evaluate(() => {
      const w = window as any;
      w.completeStateForTesting?.("Goa");
    });
    await page.waitForTimeout(300);

    const xpAfterSecond = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.()?.xp ?? 0;
    });

    console.log("XP before:", xpBefore);
    console.log("XP after first complete:", xpAfterFirst);
    console.log("XP after second complete (should be same):", xpAfterSecond);

    // Second completion should NOT add more XP
    expect(xpAfterSecond).toBe(xpAfterFirst);
  });

  test("AUDIT-08: Persistence after reload", async ({ page }) => {
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Complete a state
    await page.evaluate(() => {
      const w = window as any;
      w.completeStateForTesting?.("Maharashtra");
    });
    await page.waitForTimeout(300);

    const progressBefore = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.();
    });

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const progressAfter = await page.evaluate(() => {
      const w = window as any;
      return w.getProgressStateForTesting?.();
    });

    console.log("Before reload - completed:", progressBefore?.length);
    console.log("After reload - completed:", progressAfter?.length);

    expect(progressAfter?.length).toBe(progressBefore?.length);
  });
});
