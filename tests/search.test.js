import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  const baseUrl = 'http://localhost:4173/12c/';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');
  });

  test('search toggle button opens search modal', async ({ page }) => {
    // Click search toggle button
    const searchButton = page.locator('button[aria-label="Search"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Search modal should open
    const searchModal = page.locator('.fixed.inset-0');
    await expect(searchModal).toBeVisible();
    
    // Search input should be focused
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toBeFocused();
    
    // Close button should be visible
    await expect(page.locator('button[aria-label="Close search"]')).toBeVisible();
  });

  test('search input placeholder and initial state', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Check placeholder text
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toHaveAttribute('placeholder', 'Search the Twelve Caesars...');
    
    // Check initial help text
    await expect(page.locator('text="Search the Volume"')).toBeVisible();
    await expect(page.locator('text="Type at least 2 characters to search names, headings, and texts."')).toBeVisible();
  });

  test('search with minimum characters', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Type 1 character - should show help text
    await searchInput.fill('a');
    await expect(page.locator('text="Type at least 2 characters"')).toBeVisible();
    
    // Type 2 characters - should start searching
    await searchInput.fill('au');
    await expect(page.locator('text="Indexing the corpus..."')).toBeVisible();
  });

  test('search functionality finds results', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Wait for indexing to complete and search for 'cross'
    await searchInput.fill('cross');
    
    // Wait for results to appear (indexing might take a moment)
    await page.waitForTimeout(2000);
    
    // Should show results
    await expect(page.locator('text=/matches found/')).toBeVisible();
    
    // Results should be grouped by caesar
    const caesarSections = page.locator('.imperial-label');
    if (await caesarSections.count() > 0) {
      // Check result structure
      const firstResult = page.locator('a[href*="/"]').first();
      await expect(firstResult).toBeVisible();
      
      // Should have heading and language
      await expect(firstResult.locator('text=/\\(English\\)|\\(Latin\\)/')).toBeVisible();
      
      // Should have excerpt
      await expect(firstResult.locator('p')).toBeVisible();
    }
  });

  test('search result navigation', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Search for something that should have results
    await searchInput.fill('war');
    await page.waitForTimeout(2000);
    
    // Click first result if available
    const firstResult = page.locator('a[href*="/"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();
      
      // Should navigate to the caesar page and close search
      await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
      await expect(page.locator('h2')).toBeVisible();
    }
  });

  test('search modal keyboard interactions', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('search modal close button', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    
    // Click close button
    await page.click('button[aria-label="Close search"]');
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('search no results state', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Search for something unlikely to exist
    await searchInput.fill('xyz123nonexistent');
    await page.waitForTimeout(2000);
    
    // Should show no results message
    await expect(page.locator('text=/No results found/')).toBeVisible();
  });

  test('search from different pages', async ({ page }) => {
    // Test from Augustus page
    await page.goto(baseUrl + 'augustus');
    await page.waitForLoadState('networkidle');
    
    // Search should work the same
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('augustus');
    await page.waitForTimeout(2000);
    
    // Should find results
    await expect(page.locator('text=/matches found/')).toBeVisible();
  });
});
