import { test, expect } from '@playwright/test';

test('check detailed crash with stack trace', async ({ page }) => {
  const allErrors: string[] = [];
  const pageErrors: Array<{ message: string; stack?: string }> = [];
  
  page.on('pageerror', err => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });
  
  // Inject error handler before page loads
  await page.addInitScript(() => {
    window.addEventListener('error', (e) => {
      console.error('[INIT_SCRIPT_ERROR]', e.error?.message, e.error?.stack?.substring(0, 500));
    });
    window.addEventListener('unhandledrejection', (e) => {
      console.error('[UNHANDLED_REJECTION]', e.reason?.message || e.reason);
    });
  });
  
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);
  
  const url = page.url();
  const bodyText = await page.locator('body').innerText();
  
  console.log('Final URL:', url);
  console.log('Body text length:', bodyText?.length);
  console.log('Body text:', bodyText?.substring(0, 500));
  
  if (pageErrors.length > 0) {
    console.log('\n=== PAGE ERRORS WITH STACKS ===');
    pageErrors.forEach((e, i) => {
      console.log(`\nError ${i+1}:`, e.message);
      if (e.stack) {
        console.log('Stack:', e.stack.substring(0, 500));
      }
    });
  }
  
  await page.screenshot({ path: './test-screenshots/crash-detail.png' });
});
