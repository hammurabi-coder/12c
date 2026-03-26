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

    // Search modal should open (check for backdrop)
    const searchModal = page.locator('.bg-obsidian\\/90');
    await expect(searchModal).toBeVisible();
    
    // Search input should be focused
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    await expect(searchInput).toBeVisible();
    
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
  });

  test('search with minimum characters', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Type 1 character - should show help text
    await searchInput.fill('a');
    await expect(page.locator('text="Type at least 2 characters to search..."')).toBeVisible();
    
    // Type 2+ characters - should find results
    await searchInput.fill('aug');
    await expect(page.locator('text=/matches found/')).toBeVisible({ timeout: 10000 });
  });

  test('search functionality finds results', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Wait for indexing to complete and search for 'cross'
    await searchInput.fill('cross');
    
    // Wait for results to appear
    await expect(page.locator('text=/matches found/')).toBeVisible({ timeout: 10000 });
    
    // Results should be grouped by caesar
    const firstResult = page.locator('a[href*="/12c/"]').first();
    await expect(firstResult).toBeVisible();
  });

  test('search result navigation', async ({ page }) => {
    // Open search
    await page.click('button[aria-label="Search"]');
    const searchInput = page.locator('input[placeholder*="Search the Twelve Caesars"]');
    
    // Search for something that should have results
    await searchInput.fill('war');
    await expect(page.locator('text=/matches found/')).toBeVisible({ timeout: 10000 });
    
    // Click first result
    const firstResult = page.locator('a[href*="/12c/"]').first();
    await firstResult.click();
    
    // Should navigate away (modal closes)
    await expect(page.locator('div[transition\\:fade]')).not.toBeVisible();
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
