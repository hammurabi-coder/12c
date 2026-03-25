import { test, expect } from '@playwright/test';

test.describe('Twelve Caesars Visual & Functional Audit', () => {
  // SvelteKit file-based routing with /12c/ base path
  const baseUrl = 'http://localhost:4173/12c/';

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
  });

  test('navigation and deep-linking - Augustus', async ({ page }) => {
    // SvelteKit uses file-based routing, not hash routing
    await page.goto(baseUrl + 'augustus');
    await page.waitForLoadState('networkidle');

    // Verify Biography switched to Augustus
    await expect(page.locator('h2')).toContainText('Augustus');

    // Navigation items are <a> tags with aria-current
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toHaveAttribute('aria-label', 'View biography of Augustus');
  });

  test('bilingual mode layout', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Click "Bilingual" button
    const bilingualBtn = page.locator('button', { hasText: 'Bilingual' });
    await bilingualBtn.click();

    // Verify grid layout for bilingual view
    const grid = page.locator('.grid-cols-1.md\\:grid-cols-2');
    await expect(grid.first()).toBeVisible();
  });
});
