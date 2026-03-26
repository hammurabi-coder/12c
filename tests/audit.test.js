import { test, expect } from '@playwright/test';

test.describe('Twelve Caesars Visual & Functional Audit', () => {
  // SvelteKit file-based routing with /12c/ base path
  const baseUrl = 'http://127.0.0.1:4176/12c/';

  test('initial load - Landing Page', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check Title
    await expect(page.locator('h1').first()).toContainText('The Twelve Caesars');
    await expect(page.locator('h2').first()).toContainText('The Twelve Caesars');

    // Verify Julius is present as a card
    await expect(page.locator('h3', { hasText: 'Julius' })).toBeVisible();

    // Verify Tyrian Purple Background on body
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bgColor).toBe('rgb(45, 11, 35)');
  });

  test('navigation and deep-linking - Augustus', async ({ page }) => {
    await page.goto(baseUrl + 'augustus/');
    await page.waitForLoadState('networkidle');

    // Verify Biography switched to Augustus
    await expect(page.locator('main h2.imperial-rubric')).toContainText('Augustus');

    // Navigation items are <a> tags with aria-current
    const activeLink = page.locator('nav a[aria-current="page"]');
    await expect(activeLink).toHaveAttribute('aria-label', 'View biography of Augustus');
  });

  test('bilingual mode layout', async ({ page }) => {
    await page.goto(baseUrl + 'julius/');
    await page.waitForLoadState('networkidle');

    // Click "Bilingual" button
    const bilingualBtn = page.locator('button[aria-label=\"Switch to Bilingual view\"]');
    await bilingualBtn.click();

    // Verify grid layout for bilingual view using the chapter-content class
    const grid = page.locator('.chapter-content .grid');
    await expect(grid.first()).toBeVisible();
  });
});
