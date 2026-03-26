import { test, expect } from '@playwright/test';

test.describe('Caesar Pages', () => {
  const baseUrl = 'http://localhost:4173/12c/';
  const caesars = [
    { slug: 'julius', name: 'Julius', numeral: 'I' }
  ];

  test('representative caesar page loads correctly (Julius)', async ({ page }) => {
    const caesar = caesars[0];
    await page.goto(baseUrl + caesar.slug);
    await page.waitForLoadState('networkidle');

    // Check page title (using specific main scope)
    await expect(page.locator('main h2.imperial-rubric')).toBeVisible();
    await expect(page.locator('main h2.imperial-rubric')).toContainText(caesar.name);
    
    // Check navigation shows current caesar
    const activeLink = page.locator('nav a[aria-current="page"]');
    await expect(activeLink).toHaveAttribute('aria-label', `View biography of ${caesar.name}`);
    
    // Check imperial numeral
    await expect(page.locator('.imperial-numeral').first()).toContainText(caesar.numeral);
  });

  test('language mode switching', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Click Latin
    await page.click('button:has-text("Latin")');
    // Multiple chapters will show this, so check if at least one is visible
    await expect(page.locator('text="Latin Edition"').first()).toBeVisible();

    // Click Bilingual
    await page.click('button:has-text("Bilingual")');
    await expect(page.locator('text="English · Rolfe"').first()).toBeVisible();
    await expect(page.locator('text="Latin · Vulgata"').first()).toBeVisible();

    // Switch back to English
    await page.click('button:has-text("English")');
    await expect(page.locator('text="Latin Edition"')).not.toBeVisible();
  });
});
