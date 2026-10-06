#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('='.repeat(70));
console.log('STATE QUEST ADVENTURE - COMPLETE FUNCTIONAL AUDIT');
console.log('='.repeat(70));
console.log('\nRunning comprehensive E2E functional tests...\n');

try {
  const result = execSync(
    'npx playwright test tests/e2e/functional-audit.spec.ts --reporter=html --reporter=list',
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:8080' }
    }
  );
  
  console.log('\n' + '='.repeat(70));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(70));
  console.log('Open: playwright-report/index.html for detailed results');
  
} catch (error) {
  console.error('\nTest execution error:', error.message);
  process.exit(1);
}
