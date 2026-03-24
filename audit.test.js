import { test, expect } from '@playwright/test';
import path from 'path';

test('capture scroll and nav layout', async ({ page }) => {
  // Point to the built site in docs/
  const filePath = path.resolve('docs/index.html');
  await page.goto(`file://${filePath}`);
  
  // Wait for the app to initialize
  await page.waitForLoadState('networkidle');
  
  // Take a full page screenshot to see the "fucked up" layout
  await page.screenshot({ path: 'audit_layout_fix.png', fullPage: true });
  console.log('Screenshot saved to audit_layout_fix.png');
});
