import { test, expect } from '@playwright/test';

test.describe('Twelve Caesars Visual & Functional Audit', () => {
  // Use local server with the base path /12c/
  const baseUrl = 'http://localhost:8080/12c/';

  test('initial load - Julius preloading', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Check Title
    await expect(page.locator('h1')).toContainText('The Twelve Caesars');
    
    // Check Julius Title in Biography
    await expect(page.locator('h2')).toContainText('Julius');
    
    // Verify Tyrian Purple Background on body
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bgColor).toBe('rgb(45, 11, 35)');
    
    await page.screenshot({ path: 'audit_1_julius.png', fullPage: true });
  });

  test('navigation and deep-linking - Augustus', async ({ page }) => {
    await page.goto(baseUrl + '#augustus');
    await page.waitForTimeout(2000); // Wait for fetch
    
    // Verify Biography switched to Augustus
    await expect(page.locator('h2')).toContainText('Augustus');
    
    // Verify active tab styling (aria-current)
    const activeTab = page.locator('button[aria-current="page"]');
    await expect(activeTab).toContainText('Augustus');
    
    await page.screenshot({ path: 'audit_2_augustus.png', fullPage: true });
  });

  test('bilingual mode layout', async ({ page }) => {
    await page.goto(baseUrl + '#julius');
    await page.waitForLoadState('networkidle');
    
    // Click "Bilingual" button
    const bilingualBtn = page.locator('button', { hasText: 'Bilingual' });
    await bilingualBtn.click();
    
    // Verify grid layout
    const grid = page.locator('.grid-cols-1.md\\:grid-cols-2');
    await expect(grid.first()).toBeVisible();
    
    await page.screenshot({ path: 'audit_julius_volumen.png', fullPage: true });
  });
});
