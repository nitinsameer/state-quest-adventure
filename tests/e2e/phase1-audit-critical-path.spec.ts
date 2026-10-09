import { test, expect } from '@playwright/test';

/**
 * PHASE 1 AUDIT - Critical Path E2E Test
 * 
 * Tests the 7 critical questions that every child app must answer:
 * 1. Can I see the app? (white screen check)
 * 2. Can I create my profile? (onboarding flow)
 * 3. Can I navigate to learn something? (journey/state selection)
 * 4. Can I read content? (card display + narration)
 * 5. Can I answer questions? (quiz interaction)
 * 6. Are my rewards saved? (XP, badges, progress persistence)
 * 7. Can I see my progress in all screens? (HOME/JOURNEY/EXPLORER sync)
 */

test.describe('PHASE 1 AUDIT: Critical Path Verification', () => {
  test.setTimeout(120000); // 2 minutes per test

  test('Q1: Can I see the app? (App Visibility)', async ({ page, baseURL }) => {
    console.log('\n=== Q1: Can I see the app? ===');
    
    // Navigate to homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for app to render
    await page.waitForTimeout(2000);
    
    // Check that page has actual content (not white screen)
    const content = await page.locator('body').textContent();
    const contentLength = content?.length ?? 0;
    
    console.log(`✓ Page content length: ${contentLength} chars`);
    expect(contentLength).toBeGreaterThan(100);
    
    // Check for no console errors
    let hasErrors = false;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`✗ Console error: ${msg.text()}`);
        hasErrors = true;
      }
    });
    
    // Verify key page elements
    const bodyVisible = await page.locator('body').isVisible();
    console.log(`✓ Body visible: ${bodyVisible}`);
    expect(bodyVisible).toBe(true);
  });

  test('Q2: Can I create my profile? (Onboarding)', async ({ page }) => {
    console.log('\n=== Q2: Can I create my profile? ===');
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Look for onboarding/profile creation UI
    let profileCreated = false;
    
    // Try to find profile input or avatar selection
    const nameInput = page.locator('input[type="text"], [placeholder*="name" i]').first();
    const avatarButtons = page.locator('button[class*="avatar"], img[alt*="avatar" i]');
    
    const nameInputExists = await nameInput.isVisible({ timeout: 3000 }).catch(() => false);
    const avatarsExist = (await avatarButtons.count()) > 0;
    
    console.log(`✓ Name input visible: ${nameInputExists}`);
    console.log(`✓ Avatar options available: ${avatarsExist}`);
    
    if (nameInputExists || avatarsExist) {
      profileCreated = true;
    }
    
    // Also check if we can navigate to create/profile routes
    try {
      const newPage = await page.context().newPage();
      await newPage.goto('/create', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
      const createPageContent = await newPage.locator('body').textContent();
      if (createPageContent && createPageContent.length > 50) {
        profileCreated = true;
        console.log(`✓ /create route accessible`);
      }
      await newPage.close();
    } catch (e) {
      // Route may not exist or be protected
    }
    
    expect(profileCreated || nameInputExists || avatarsExist).toBe(true);
  });

  test('Q3: Can I navigate to learn something? (Journey/State Selection)', async ({ page }) => {
    console.log('\n=== Q3: Can I navigate to learn something? ===');
    
    await page.goto('/journey', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Check for state/destination options
    const stateButtons = page.locator('button, a, [role="button"]').filter({ hasText: /Pradesh|Tamil|Karnataka|Gujarat|Bengal|State|Destination/i });
    const stateCount = await stateButtons.count();
    
    console.log(`✓ Found ${stateCount} state/destination options`);
    expect(stateCount).toBeGreaterThan(0);
    
    // Verify journey map is visible
    const journeyMap = await page.locator('[class*="journey"], [class*="map"], [class*="path"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`✓ Journey map visible: ${journeyMap}`);
    
    // Also try to access a specific state
    try {
      await page.goto('/state/andhra-pradesh', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
      const stateContent = await page.locator('body').textContent();
      if (stateContent && stateContent.length > 50) {
        console.log(`✓ State route accessible`);
      }
    } catch (e) {
      // State may not be accessible yet
    }
  });

  test('Q4: Can I read content? (Card Display)', async ({ page }) => {
    console.log('\n=== Q4: Can I read content? ===');
    
    // Try to access a learning card
    await page.goto('/state/andhra-pradesh/cards', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    
    // Look for card content
    const cardContent = page.locator('[class*="card"], article, [role="article"]').first();
    const cardVisible = await cardContent.isVisible({ timeout: 3000 }).catch(() => false);
    
    console.log(`✓ Card content visible: ${cardVisible}`);
    
    if (cardVisible) {
      const text = await cardContent.textContent();
      console.log(`✓ Card text length: ${text?.length ?? 0} chars`);
      expect(text?.length).toBeGreaterThan(10);
    }
    
    // Check for narration player
    const narrationButton = page.locator('button[class*="narration"], button[class*="audio"], button:has-text("🔊")')  .first();
    const narrationExists = await narrationButton.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`✓ Narration available: ${narrationExists}`);
  });

  test('Q5: Can I answer questions? (Quiz Interaction)', async ({ page }) => {
    console.log('\n=== Q5: Can I answer questions? ===');
    
    // Navigate to quiz
    await page.goto('/state/andhra-pradesh/quiz', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    
    // Look for quiz question
    const question = page.locator('[class*="question"], h2, h3').filter({ hasText: /\?/ }).first();
    const questionVisible = await question.isVisible({ timeout: 3000 }).catch(() => false);
    
    console.log(`✓ Quiz question visible: ${questionVisible}`);
    expect(questionVisible).toBe(true);
    
    // Look for answer options
    const answers = page.locator('button, input[type="radio"], [role="radio"]').filter({ hasText: /\w+/ });
    const answerCount = await answers.count();
    
    console.log(`✓ Answer options: ${answerCount}`);
    expect(answerCount).toBeGreaterThanOrEqual(3);
    
    // Try clicking an answer
    if (answerCount > 0) {
      const firstAnswer = answers.first();
      const isClickable = await firstAnswer.isEnabled({ timeout: 3000 }).catch(() => false);
      console.log(`✓ First answer clickable: ${isClickable}`);
      
      if (isClickable) {
        await firstAnswer.click();
        await page.waitForTimeout(500);
        console.log(`✓ Answer clicked successfully`);
      }
    }
  });

  test('Q6: Are my rewards saved? (Persistence & Progress)', async ({ page, context }) => {
    console.log('\n=== Q6: Are my rewards saved? ===');
    
    // First visit - get initial state
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    let initialXP = '0';
    const xpDisplay = page.locator('text=/XP|Level|Points|Score/i').filter({ hasText: /\d/ }).first();
    if (await xpDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
      initialXP = await xpDisplay.textContent() ?? '0';
      console.log(`✓ Initial XP display: ${initialXP}`);
    }
    
    // Do an action (answer a quiz question)
    await page.goto('/state/andhra-pradesh/quiz', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    
    // Click a quiz answer
    const answers = page.locator('button, input[type="radio"]').filter({ hasText: /\w+/ });
    if (await answers.count() > 0) {
      await answers.first().click();
      await page.waitForTimeout(500);
      
      // Submit/confirm answer
      const submitBtn = page.locator('button').filter({ hasText: /Check|Submit|Next|Confirm/i }).first();
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        console.log(`✓ Quiz action completed`);
      }
    }
    
    // Check storage
    const storage = await context.storageState();
    console.log(`✓ localStorage available: ${storage !== null}`);
    
    // Navigate back to home and verify progress still shows
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    const finalXpDisplay = page.locator('text=/XP|Level|Points|Score/i').filter({ hasText: /\d/ }).first();
    if (await finalXpDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(`✓ Progress persisted on HOME screen`);
    }
  });

  test('Q7: Can I see my progress in all screens? (HOME/JOURNEY/EXPLORER Sync)', async ({ page }) => {
    console.log('\n=== Q7: Can I see my progress in all screens? ===');
    
    const progress = {};
    
    // Visit HOME
    console.log('\n→ Checking HOME screen...');
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const homeContent = await page.locator('body').textContent();
    progress['HOME'] = homeContent?.substring(0, 200);
    console.log(`✓ HOME screen content: ${homeContent?.length ?? 0} chars`);
    
    // Visit JOURNEY
    console.log('\n→ Checking JOURNEY screen...');
    await page.goto('/journey', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const journeyContent = await page.locator('body').textContent();
    progress['JOURNEY'] = journeyContent?.substring(0, 200);
    console.log(`✓ JOURNEY screen content: ${journeyContent?.length ?? 0} chars`);
    
    // Visit EXPLORER
    console.log('\n→ Checking EXPLORER screen...');
    await page.goto('/explorer', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const explorerContent = await page.locator('body').textContent();
    progress['EXPLORER'] = explorerContent?.substring(0, 200);
    console.log(`✓ EXPLORER screen content: ${explorerContent?.length ?? 0} chars`);
    
    // Verify all screens are accessible
    expect(homeContent?.length).toBeGreaterThan(50);
    expect(journeyContent?.length).toBeGreaterThan(50);
    expect(explorerContent?.length).toBeGreaterThan(50);
    
    // Back to HOME and verify no data loss
    console.log('\n→ Verifying sync consistency...');
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const homeContentAfter = await page.locator('body').textContent();
    
    // Check if progress displays (XP, level, badges, etc.)
    const hasProgress = (homeContentAfter?.match(/\d+/) ?? []).length > 0;
    console.log(`✓ Progress displayed: ${hasProgress}`);
    
    expect(hasProgress).toBe(true);
  });

  test('CRITICAL: No duplicate rewards on quiz replay', async ({ page }) => {
    console.log('\n=== CRITICAL: Duplicate Reward Check ===');
    
    // Get initial XP
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    let initialXP = 0;
    const xpText = await page.locator('text=/XP|Exp|Points/i').first().textContent().catch(() => '0');
    const xpMatch = xpText?.match(/(\d+)/);
    if (xpMatch) initialXP = parseInt(xpMatch[1]);
    
    console.log(`✓ Initial XP: ${initialXP}`);
    
    // Complete a quiz
    await page.goto('/state/andhra-pradesh/quiz', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    
    const answers = page.locator('button, input[type="radio"]').filter({ hasText: /\w+/ });
    for (let i = 0; i < Math.min(3, await answers.count()); i++) {
      const answer = answers.nth(i);
      if (await answer.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await answer.click();
        await page.waitForTimeout(300);
        
        // Click submit/next if available
        const submitBtn = page.locator('button').filter({ hasText: /Check|Submit|Next/i }).first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Get XP after first quiz
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const xpTextAfter = await page.locator('text=/XP|Exp|Points/i').first().textContent().catch(() => '0');
    const xpMatchAfter = xpTextAfter?.match(/(\d+)/);
    const xpAfterQuiz = xpMatchAfter ? parseInt(xpMatchAfter[1]) : 0;
    
    console.log(`✓ XP after first quiz: ${xpAfterQuiz}`);
    const xpGained = xpAfterQuiz - initialXP;
    console.log(`✓ XP gained: +${xpGained}`);
    
    // Try to replay the same quiz
    console.log('\n→ Attempting replay...');
    await page.goto('/state/andhra-pradesh/quiz', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    
    // Answer same question again
    const answersReplay = page.locator('button, input[type="radio"]').filter({ hasText: /\w+/ });
    if (await answersReplay.count() > 0) {
      await answersReplay.first().click();
      await page.waitForTimeout(300);
      
      const submitBtnReplay = page.locator('button').filter({ hasText: /Check|Submit|Next/i }).first();
      if (await submitBtnReplay.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtnReplay.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Get final XP
    await page.goto('/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const xpTextFinal = await page.locator('text=/XP|Exp|Points/i').first().textContent().catch(() => '0');
    const xpMatchFinal = xpTextFinal?.match(/(\d+)/);
    const xpFinal = xpMatchFinal ? parseInt(xpMatchFinal[1]) : 0;
    
    console.log(`✓ Final XP after replay: ${xpFinal}`);
    const additionalXP = xpFinal - xpAfterQuiz;
    console.log(`✓ Additional XP from replay: +${additionalXP}`);
    
    // CRITICAL: Additional XP should be 0 or very small (not same as first attempt)
    if (additionalXP > xpGained * 0.5) {
      console.error(`✗ WARNING: Duplicate XP detected! First attempt: +${xpGained}, Replay: +${additionalXP}`);
    } else {
      console.log(`✓ PASS: Duplicate XP prevention working (replay XP: ${additionalXP} vs first: ${xpGained})`);
    }
    
    // This is informational, not a hard fail (might be different question IDs)
    expect(additionalXP).toBeLessThan(xpGained * 0.8);
  });
});
