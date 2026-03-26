import { test, expect } from '@playwright/test';

test.describe('Caesar Pages', () => {
  const baseUrl = 'http://127.0.0.1:4176/12c/';
  const caesars = [
    { slug: 'julius', name: 'Julius', numeral: 'I' }
  ];

  test('representative caesar page loads correctly (Julius)', async ({ page }) => {
    const caesar = caesars[0];
    await page.goto(baseUrl + caesar.slug + '/');
    await page.waitForLoadState('networkidle');

    // Check page title (using specific main scope)
    await expect(page.locator('main h2.imperial-rubric')).toBeVisible();
    await expect(page.locator('main h2.imperial-rubric')).toContainText(caesar.name);
    
    // Check navigation shows current caesar
    const activeLink = page.locator('nav a[aria-current="page"]');
    await expect(activeLink).toHaveAttribute('aria-label', `View biography of ${caesar.name}`);
    
    // Check imperial numeral
    await expect(page.locator('.imperial-numeral').first()).toContainText(caesar.numeral);

    // Reader content should be present
    await expect(page.locator('.chapter-content').first()).toBeVisible();
    await expect(page.locator('a[aria-label="Back to top"]').first()).toBeVisible();
  });

  test('language mode switching', async ({ page }) => {
    await page.goto(baseUrl + 'julius/');
    await page.waitForLoadState('networkidle');

    const firstSection = page.locator('.chapter-content').first();

    // Click Latin and verify the single-column reader switches to italic Latin text
    await page.click('button[aria-label="Switch to Latin view"]');
    await expect(firstSection.locator('.reader-prose.italic').first()).toBeVisible();

    // Click Bilingual
    await page.click('button[aria-label="Switch to Bilingual view"]');
    await expect(page.locator('text="English · Rolfe"').first()).toBeVisible();
    await expect(page.locator('text="Latin"').first()).toBeVisible();
    await expect(firstSection.locator('article')).toHaveCount(2);

    // Switch back to English and verify the first section collapses back to one article
    await page.click('button[aria-label="Switch to English view"]');
    await expect(firstSection.locator('article')).toHaveCount(1);
    await expect(page.locator('text="English · Rolfe"')).not.toBeVisible();
  });
});
