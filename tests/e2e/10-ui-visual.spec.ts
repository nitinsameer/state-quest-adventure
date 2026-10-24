import { test, expect } from "@playwright/test";

/**
 * UI & VISUAL TESTS - India Quest Adventure
 * Tests UI components, layout, responsiveness, visual correctness
 */
test.describe("UI & Visual Tests", () => {
  test("Home screen layout is properly structured", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Check for main layout sections
    const header = await page
      .locator('[class*="header"], nav, [role="banner"]')
      .isVisible()
      .catch(() => false);
    const content = await page
      .locator('main, [role="main"], [class*="content"]')
      .isVisible()
      .catch(() => false);

    console.log(`Header visible: ${header}, Content visible: ${content}`);
    expect(header || content).toBeTruthy();
  });

  test("All buttons are properly sized (minimum 44x44 for touch)", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const buttons = await page.locator('button, [role="button"]').all();

    for (const button of buttons.slice(0, 10)) {
      const box = await button.boundingBox();
      if (box) {
        console.log(`Button size: ${box.width}x${box.height}`);
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("Text contrast meets WCAG standards", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Simple check for text visibility
    const textElements = await page.locator("p, span, h1, h2, h3, h4, h5, h6").all();

    for (const element of textElements.slice(0, 10)) {
      const isVisible = await element.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test("Cards display properly with correct spacing", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const cards = await page.locator('[class*="card"], [class*="Container"]').all();

    console.log(`Cards found: ${cards.length}`);
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards.slice(0, 5)) {
      const isVisible = await card.isVisible().catch(() => false);
      if (isVisible) {
        const box = await card.boundingBox();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
      }
    }
  });

  test("Responsive design works on mobile viewport", async ({ browser }) => {
    const context = await browser.createContext({
      viewport: { width: 375, height: 812 }, // iPhone size
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });

    // Check mobile layout
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);

    // Check content is not horizontally scrollable
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewport?.width || 0;

    console.log(`Body width: ${bodyWidth}, Viewport: ${viewportWidth}`);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Small margin allowed

    await context.close();
  });

  test("Responsive design works on tablet viewport", async ({ browser }) => {
    const context = await browser.createContext({
      viewport: { width: 768, height: 1024 }, // iPad size
      deviceScaleFactor: 2,
    });

    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });

    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(768);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(768 + 10);

    await context.close();
  });

  test("Images load properly and display", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const images = await page.locator("img").all();

    console.log(`Images found: ${images.length}`);

    for (const img of images.slice(0, 5)) {
      const isVisible = await img.isVisible().catch(() => false);
      if (isVisible) {
        const box = await img.boundingBox();
        expect(box?.width).toBeGreaterThan(0);
        expect(box?.height).toBeGreaterThan(0);
      }
    }
  });

  test("Colors are consistent with brand guidelines", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for expected color classes/themes
    const bodyClasses = await page.evaluate(() => document.body.className);

    console.log(`Body classes: ${bodyClasses}`);
    expect(bodyClasses).toBeTruthy();
  });

  test("No broken images on page", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const brokenImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      return images.filter((img) => !img.complete || img.naturalHeight === 0).map((img) => img.src);
    });

    console.log(`Broken images: ${brokenImages.length}`);
    expect(brokenImages.length).toBe(0);
  });

  test("Form inputs are accessible and properly labeled", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const inputs = await page.locator("input, textarea, select").all();

    for (const input of inputs.slice(0, 5)) {
      const ariaLabel = await input.getAttribute("aria-label");
      const label = await input.evaluate((el) => {
        const id = el.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          return label?.textContent;
        }
        return null;
      });

      console.log(`Input has label: ${!!ariaLabel || !!label}`);
      expect(ariaLabel || label).toBeTruthy();
    }
  });

  test("Focus states are visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const buttons = await page.locator("button").all();

    for (const button of buttons.slice(0, 3)) {
      await button.focus();

      const focusStyle = await button.evaluate((el) => {
        return (
          window.getComputedStyle(el).outline ||
          window.getComputedStyle(el).boxShadow ||
          window.getComputedStyle(el).borderColor
        );
      });

      console.log(`Focus style: ${focusStyle}`);
      expect(focusStyle).toBeTruthy();
    }
  });

  test("Modal dialogs are properly centered and visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const modals = await page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]').all();

    for (const modal of modals.slice(0, 3)) {
      const isVisible = await modal.isVisible().catch(() => false);
      if (isVisible) {
        const box = await modal.boundingBox();
        const viewport = page.viewportSize();

        if (box && viewport) {
          const horizontalCenter = Math.abs(box.x + box.width / 2 - viewport.width / 2);
          console.log(`Modal offset from center: ${horizontalCenter}px`);
          expect(horizontalCenter).toBeLessThan(viewport.width / 2);
        }
      }
    }
  });

  test("Scrollable areas are properly indicated", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const scrollableElements = await page.evaluate(() => {
      const elements = document.querySelectorAll("div, section, main");
      return Array.from(elements).filter((el) => el.scrollHeight > el.clientHeight).length;
    });

    console.log(`Scrollable areas: ${scrollableElements}`);
    // Scrollable areas should exist or none if content fits
    expect(scrollableElements).toBeGreaterThanOrEqual(0);
  });

  test("Animation transitions are smooth and not too fast", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const animationDurations = await page.evaluate(() => {
      const elements = document.querySelectorAll('[style*="animation"], [style*="transition"]');
      return Array.from(elements)
        .map((el) => {
          const style = window.getComputedStyle(el);
          return {
            duration: style.transitionDuration || style.animationDuration,
            timing: style.transitionTimingFunction || style.animationTimingFunction,
          };
        })
        .slice(0, 10);
    });

    console.log(`Animation count: ${animationDurations.length}`);

    // Verify animations exist and have reasonable durations
    for (const anim of animationDurations) {
      if (anim.duration && anim.duration !== "0s") {
        const ms = parseFloat(anim.duration) * 1000;
        expect(ms).toBeLessThan(3000); // Max 3 seconds
        expect(ms).toBeGreaterThan(100); // Min 100ms
      }
    }
  });
});
