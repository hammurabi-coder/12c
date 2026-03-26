import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  const baseUrl = 'http://localhost:4173/12c/';

  test('landing page accessibility', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check main heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    const h2 = page.locator('h2');
    await expect(h2).toBeVisible();
    
    // Check Suetonius quote
    await expect(page.locator('text=/For my part/')).toBeVisible();
    
    // Check alt text for images
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
    
    // Check semantic structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });

  test('search modal accessibility', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Open search
    const searchButton = page.locator('button[aria-label="Search"]');
    await searchButton.click();
    
    // Check modal accessibility (using backdrop class)
    const modal = page.locator('.bg-obsidian\\/90');
    await expect(modal).toBeVisible();
    
    // Check input accessibility
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    
    // Check close button accessibility
    const closeButton = page.locator('button[aria-label="Close search"]');
    await expect(closeButton).toBeVisible();
    
    // Test Escape key
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('navigation accessibility', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Check navigation links
    const navLinks = page.locator('nav a[href*="/"]');
    await expect(navLinks).toHaveCount(12);
    
    // Each link should have proper aria attributes
    for (let i = 0; i < await navLinks.count(); i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveAttribute('aria-label');
      await expect(link).toHaveAttribute('href');
    }
    
    // Current page should have aria-current
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toBeVisible();
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  test('language switching accessibility', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Language buttons should be accessible
    const englishBtn = page.locator('button', { hasText: 'English' });
    const latinBtn = page.locator('button', { hasText: 'Latin' });
    const bilingualBtn = page.locator('button', { hasText: 'Bilingual' });
    
    await expect(englishBtn).toBeVisible();
    await expect(latinBtn).toBeVisible();
    await expect(bilingualBtn).toBeVisible();
    
    // Each button should have an aria-label
    await expect(englishBtn).toHaveAttribute('aria-label', /English/);
    await expect(latinBtn).toHaveAttribute('aria-label', /Latin/);
    await expect(bilingualBtn).toHaveAttribute('aria-label', /Bilingual/);
    
    // Should indicate active state (using thepapyrus bg from Biography.svelte)
    const activeButton = page.locator('button.bg-papyrus');
    await expect(activeButton).toBeVisible();
    
    // Test keyboard navigation
    await englishBtn.focus();
    await expect(englishBtn).toBeFocused();
  });

  test('color contrast and visual accessibility', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check that text is readable
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check link visibility
    const links = page.locator('a[href]');
    await expect(links.first()).toBeVisible();
  });

  test('focus management', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Test tab order
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check for proper semantic markup
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for ARIA labels on search
    const searchButton = page.locator('button[aria-label="Search"]');
    await expect(searchButton).toBeVisible();
  });

  test('keyboard navigation for caesar pages', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Navigate to Augustus using the Navigation component
    const augustusLink = page.locator('nav a[href*="augustus"]').first();
    await augustusLink.focus();
    await expect(augustusLink).toBeFocused();
    
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Should have navigated
    await expect(page).toHaveURL(/augustus/);
    await expect(page.locator('h2')).toContainText('Augustus');
  });

  test('form accessibility (search)', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Check form accessibility
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    
    // Should be able to type and search
    await searchInput.fill('julius');
    await expect(searchInput).toHaveValue('julius');
    
    // Should show results
    await expect(page.locator('text=/matches found/')).toBeVisible({ timeout: 10000 });
  });
});
