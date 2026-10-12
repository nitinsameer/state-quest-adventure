import { test, expect } from '@playwright/test';

/**
 * Phase 1 Audit - Smoke Test (Chrome only, quick)
 * Tests basic app rendering and key feature availability
 */

test.describe('PHASE 1: Quick Smoke Test', () => {
  test.setTimeout(30000); // 30s timeout

  test('Q1: App renders full HTML (not just shell)', async ({ page }) => {
    console.log('\n=== Q1: Can app render? ===');
    
    const response = await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    console.log(`Response status: ${response?.status()}`);
    
    const content = await page.locator('body').textContent();
    console.log(`Body text length: ${content?.length} chars`);
    
    // Check for content beyond just the shell
    expect(content?.length).toBeGreaterThan(500);
    console.log('✓ Full app HTML rendered');
  });

  test('Q2: Can navigate to all screens', async ({ page }) => {
    console.log('\n=== Q2: Can navigate? ===');
    
    const routes = ['/', '/home', '/journey', '/explorer'];
    
    for (const route of routes) {
      await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' });
      const content = await page.locator('body').textContent();
      console.log(`${route}: ${content?.length} chars`);
      expect(content?.length).toBeGreaterThan(100);
    }
    console.log('✓ All routes accessible');
  });

  test('Q3: No console errors on home page', async ({ page }) => {
    console.log('\n=== Q3: Error check ===');
    
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.error(`Console error: ${msg.text()}`);
      }
    });
    
    await page.goto('http://localhost:4173/home', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    console.log(`Console errors: ${errors.length}`);
    expect(errors.length).toBe(0);
    console.log('✓ No console errors');
  });

  test('Q4: Key UI elements present', async ({ page }) => {
    console.log('\n=== Q4: UI elements ===');
    
    await page.goto('http://localhost:4173/home', { waitUntil: 'networkidle' });
    
    // Look for typical UI elements
    const buttons = await page.locator('button').count();
    const navLinks = await page.locator('a, [role="navigation"] *').count();
    const text = await page.locator('body').textContent();
    
    console.log(`Buttons: ${buttons}`);
    console.log(`Nav elements: ${navLinks}`);
    console.log(`Body text length: ${text?.length}`);
    
    expect(buttons).toBeGreaterThan(0);
    expect(text?.length).toBeGreaterThan(500);
    console.log('✓ UI elements present');
  });
});
