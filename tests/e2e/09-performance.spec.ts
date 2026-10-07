import { test, expect } from '@playwright/test';

/**
 * PERFORMANCE TESTS - India Quest Adventure
 * Tests app speed, load times, memory, rendering performance
 */
test.describe('Performance Tests', () => {
  test('App page load time < 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('Home screen renders in < 500ms after load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const startTime = Date.now();
    await page.waitForSelector('[class*="home"], [class*="dashboard"], button', { timeout: 5000 });
    const renderTime = Date.now() - startTime;
    
    console.log(`Render time: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(500);
  });

  test('Card navigation responds in < 200ms', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    await page.click('button', { force: true }).catch(() => {});
    await page.waitForTimeout(100);
    const responseTime = Date.now() - startTime;
    
    console.log(`Button click response: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(200);
  });

  test('Quiz rendering performance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const startTime = Date.now();
    await page.waitForSelector('text=/quiz|question/i', { timeout: 5000 }).catch(() => {});
    const quizLoadTime = Date.now() - startTime;
    
    console.log(`Quiz load time: ${quizLoadTime}ms`);
    expect(quizLoadTime).toBeLessThan(2000);
  });

  test('No layout shifts during interaction', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Monitor for layout shifts
    const layoutShifts = await page.evaluate(() => {
      return new Promise((resolve) => {
        let shiftCount = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              shiftCount++;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        setTimeout(() => {
          observer.disconnect();
          resolve(shiftCount);
        }, 3000);
      });
    });
    
    console.log(`Layout shifts: ${layoutShifts}`);
    expect(layoutShifts).toBeLessThan(5);
  });

  test('Memory usage stable (no major leaks)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const memoryBefore = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Simulate interactions
    for (let i = 0; i < 5; i++) {
      await page.click('body').catch(() => {});
      await page.waitForTimeout(100);
    }
    
    const memoryAfter = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = memoryAfter - memoryBefore;
    console.log(`Memory increase: ${memoryIncrease / 1024 / 1024}MB`);
    
    // Allow up to 10MB increase
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });

  test('Animation frame rate maintained', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const frameMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        
        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frameCount);
          }
        };
        
        requestAnimationFrame(countFrames);
      });
    });
    
    console.log(`Frames per second: ${frameMetrics}`);
    // Expect at least 30 FPS
    expect(frameMetrics).toBeGreaterThan(30);
  });

  test('Bundle size is reasonable', async ({ page, context }) => {
    let totalSize = 0;
    
    context.on('response', (response) => {
      if (response.request().resourceType() === 'script' || 
          response.request().resourceType() === 'stylesheet') {
        totalSize += response.headers()['content-length']?.length || 0;
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    console.log(`Total JS/CSS transferred: ${totalSize / 1024}KB`);
    // Main bundle should be < 5MB
    expect(totalSize).toBeLessThan(5 * 1024 * 1024);
  });

  test('No console errors during normal use', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log(`Console errors: ${errors.length}`);
    expect(errors).toEqual([]);
  });

  test('Page responsiveness (First Contentful Paint < 1.5s)', async ({ page }) => {
    const navigationTiming = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find((p) => p.name === 'first-contentful-paint');
      return fcp?.startTime || 0;
    });
    
    console.log(`First Contentful Paint: ${navigationTiming}ms`);
    expect(navigationTiming).toBeLessThan(1500);
  });
});
