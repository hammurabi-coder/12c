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
    
    // Check alt text for images
    const images = page.locator('img');
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
    
    // Check semantic structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check button accessibility
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('aria-label');
    }
  });

  test('search modal accessibility', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Check modal accessibility
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();
    
    // Check input accessibility
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    await expect(searchInput).toBeFocused();
    
    // Check close button accessibility
    const closeButton = page.locator('button[aria-label="Close search"]');
    await expect(closeButton).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(searchInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();
    
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
    const englishBtn = page.locator('button:has-text("English")');
    const latinBtn = page.locator('button:has-text("Latin")');
    const bilingualBtn = page.locator('button:has-text("Bilingual")');
    
    await expect(englishBtn).toBeVisible();
    await expect(latinBtn).toBeVisible();
    await expect(bilingualBtn).toBeVisible();
    
    // Should indicate active state
    const activeButton = page.locator('button.bg-rubric');
    await expect(activeButton).toBeVisible();
    
    // Test keyboard navigation
    await englishBtn.focus();
    await expect(englishBtn).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(latinBtn).toBeFocused();
  });

  test('color contrast and visual accessibility', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check that text is readable (basic test)
    const headings = page.locator('h1, h2, h3');
    for (let i = 0; i < await headings.count(); i++) {
      const heading = headings.nth(i);
      await expect(heading).toBeVisible();
      const color = await heading.evaluate(el => getComputedStyle(el).color);
      expect(color).not.toBe('rgb(128, 128, 128)'); // Not gray
    }
    
    // Check link visibility
    const links = page.locator('a[href]');
    for (let i = 0; i < await links.count(); i++) {
      const link = links.nth(i);
      await expect(link).toBeVisible();
    }
  });

  test('focus management', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Test tab order
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus');
    
    // Should be able to navigate through interactive elements
    let tabCount = 0;
    while (tabCount < 10) {
      await page.keyboard.press('Tab');
      focused = await page.locator(':focus');
      if (await focused.count() === 0) break;
      tabCount++;
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('screen reader compatibility', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check for proper semantic markup
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for ARIA labels
    const buttonsWithAria = page.locator('button[aria-label]');
    await expect(buttonsWithAria).toHaveCountGreaterThan(0);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings).toHaveCountGreaterThan(0);
  });

  test('keyboard navigation for caesar pages', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Navigate through caesars using keyboard
    const navLinks = page.locator('nav a[href*="/"]');
    
    // Focus first link
    await navLinks.first().focus();
    await expect(navLinks.first()).toBeFocused();
    
    // Navigate to next link
    await page.keyboard.press('ArrowRight');
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    
    // Should have navigated
    await expect(page.locator('h2')).toBeVisible();
  });

  test('form accessibility (search)', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Check form accessibility
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toHaveAttribute('placeholder');
    await expect(searchInput).toHaveAttribute('type', 'text');
    
    // Should be able to type and search
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
    
    // Should be able to submit with Enter
    await page.keyboard.press('Enter');
    // Should not close modal (search should work)
    await expect(page.locator('.fixed.inset-0')).toBeVisible();
  });
});
