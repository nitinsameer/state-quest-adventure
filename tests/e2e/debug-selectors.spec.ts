import { test, expect } from '@playwright/test';

/**
 * DEBUG: Find actual selectors in the app
 */
test('Debug: Print app structure', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for app to fully load

  // Wait for content to appear
  await page.waitForSelector('button, [role="button"], h1, h2', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Get all buttons
  const buttons = await page.locator('button, [role="button"]').all();
  console.log(`\n[DEBUG] Found ${buttons.length} buttons/clickables:`);
  for (let i = 0; i < Math.min(buttons.length, 15); i++) {
    const text = await buttons[i].textContent();
    console.log(`  [${i}] ${text?.trim()}`);
  }

  // Get heading text
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  console.log(`\n[DEBUG] Found ${headings.length} headings:`);
  for (let i = 0; i < Math.min(headings.length, 10); i++) {
    const text = await headings[i].textContent();
    console.log(`  [${i}] ${text?.trim()}`);
  }

  // Get main content
  const bodyText = await page.locator('body').textContent();
  const preview = bodyText?.substring(0, 500) || '';
  console.log(`\n[DEBUG] Body text preview:\n${preview.substring(0, 200)}`);

  // Take screenshot
  await page.screenshot({ path: './test-screenshots/debug-structure.png' });
  console.log('\n[DEBUG] Screenshot saved: debug-structure.png');
});
