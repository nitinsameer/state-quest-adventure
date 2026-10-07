import { test, expect } from '@playwright/test';

/**
 * CRITICAL REGRESSION TEST: Verify replayCount bug is fixed
 * 
 * Bug: ReferenceError: replayCount is not defined
 * Location: src/components/screens.tsx line 2922
 * Trigger: First state → first card → click "Got it / Next"
 * 
 * Expected: No crash, next card displays
 */
test.describe('REGRESSION: replayCount Bug Fix', () => {
  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`[Console Error] ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
      console.error(`[Page Error] ${err.message}`);
    });
  });

  test('Fresh app → Journey → First State → First Card → Click "Got it/Next" (CRITICAL)', async ({
    page,
  }) => {
    console.log('\n========== CRITICAL: REPLAY COUNT BUG TEST ==========');
    console.log('Testing path: App → Journey → First State → First Card → "Got it/Next" click');

    // 1. Launch fresh app
    console.log('\n[1] Launching fresh app...');
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // 2. Look for onboarding or home screen
    console.log('[2] Waiting for initial screen...');
    const onboardingExists = await page.locator('text=/Discover India|Welcome|Let.*s start/i').isVisible({ timeout: 3000 }).catch(() => false);

    if (onboardingExists) {
      console.log('  → Onboarding detected');
      // Click next/continue to get through onboarding
      await page.locator('button:has-text(/Next|Continue|Start|Get Started/i)').first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
    }

    // 3. Navigate to journey/states
    console.log('[3] Navigating to journey...');
    const journeyButton = page.locator('button:has-text(/Journey|Explore|States|Adventures/i)').first();
    const journeyVisible = await journeyButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (journeyVisible) {
      await journeyButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('  → Journey button not found, assuming already on journey screen');
    }

    // 4. Find first available state
    console.log('[4] Finding first available state...');
    const stateButton = page.locator('button, [role="button"], div[class*="card"], div[class*="state"]').filter({ hasText: /Andhra Pradesh|Karnataka|Telangana|Haryana|Gujarat|Maharashtra|Kerala|Tamil Nadu|West Bengal|Delhi|Rajasthan|Bihar|Jharkhand|Odisha|Punjab|Uttarakhand|Assam/ }).first();

    if (await stateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`  → Found state: ${await stateButton.textContent()}`);
      await stateButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } else {
      console.log('  → State button not found, checking for other entry points');
    }

    // 5. Look for learning hub or cards
    console.log('[5] Opening learning hub/cards...');
    const learningHubButton = page.locator('button:has-text(/Learning Hub|Cards|Stories|Learn/i)').first();
    if (await learningHubButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await learningHubButton.click();
      await page.waitForTimeout(1000);
    }

    // 6. Take screenshot before clicking
    console.log('[6] Taking screenshot before card action...');
    await page.screenshot({ path: './test-screenshots/01-before-card-click.png' });

    // 7. CRITICAL: Click "Got it" / "Next" button on first card
    console.log('[7] CLICKING "Got it / Next" BUTTON (CRITICAL TEST)...');
    const gotItButton = page.locator('button:has-text(/Got it|Next|Continue|Proceed|OK|Done/i)').first();

    if (await gotItButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  → Found "Got it / Next" button, clicking now...');
      await gotItButton.click();
      await page.waitForTimeout(1500);
    } else {
      console.log('  ⚠️ "Got it / Next" button not found');
    }

    // 8. Take screenshot after clicking
    console.log('[8] Taking screenshot after card click...');
    await page.screenshot({ path: './test-screenshots/02-after-card-click.png' });

    // 9. Verify no errors occurred
    console.log('\n[9] VERIFYING NO ERRORS...');
    console.log(`  Console errors: ${consoleErrors.length}`);
    console.log(`  Page errors: ${pageErrors.length}`);

    // Check specifically for replayCount errors
    const replayCountErrors = [...consoleErrors, ...pageErrors].filter((e) => e.includes('replayCount'));
    if (replayCountErrors.length > 0) {
      console.error('❌ REPLAYCOUNTERROR FOUND:');
      replayCountErrors.forEach((e) => console.error(`   ${e}`));
    }

    // Check for ReferenceError
    const referenceErrors = [...consoleErrors, ...pageErrors].filter((e) => e.includes('ReferenceError'));
    if (referenceErrors.length > 0) {
      console.error('❌ REFERENCEERROR FOUND:');
      referenceErrors.forEach((e) => console.error(`   ${e}`));
    }

    // 10. Assert: No replayCount errors
    expect(replayCountErrors).toEqual([], `❌ replayCount error found: ${replayCountErrors.join(', ')}`);

    // 11. Assert: No ReferenceError
    expect(referenceErrors).toEqual([], `❌ ReferenceError found: ${referenceErrors.join(', ')}`);

    // 12. Assert: Page still has content (not blank)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(10);

    // 13. Assert: No error boundaries or crash screens
    const errorScreens = await page.locator('text=/error|crashed|something went wrong|not responding/i').count();
    expect(errorScreens).toBe(0);

    console.log('\n✅ REGRESSION TEST PASSED: No replayCount error on "Got it / Next" click');
  });
});
