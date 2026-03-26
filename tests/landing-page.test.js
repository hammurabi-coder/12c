import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  const baseUrl = 'http://localhost:4173/12c/';

  test('loads landing page with all caesars', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle('The Twelve Caesars — Digital Edition');
    
    // Check main heading
    await expect(page.locator('h2')).toContainText('The Twelve Caesars');
    
    // Check subtitle
    await expect(page.locator('text="DE VITA CAESARUM"')).toBeVisible();
    
    // Check Suetonius quote
    await expect(page.locator('text=/For my part/')).toBeVisible();
    await expect(page.locator('text=/history of Rome/')).toBeVisible();
    
    // Verify all 12 caesars are displayed
    const caesarCards = page.locator('a[href*="/12c/"]');
    await expect(caesarCards).toHaveCount(12);
    
    // Check specific caesars are present
    await expect(page.locator('a[href="/12c/julius/"]')).toBeVisible();
    await expect(page.locator('a[href="/12c/augustus/"]')).toBeVisible();
    await expect(page.locator('a[href="/12c/nero/"]')).toBeVisible();
  });

  test('caesar cards have proper structure and content', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check first caesar card (Julius)
    const juliusCard = page.locator('a[href="/12c/julius/"]');
    
    // Verify bust image
    const bustImg = juliusCard.locator('img');
    await expect(bustImg).toHaveAttribute('alt', 'Bust of Julius');
    await expect(bustImg).toHaveClass(/grayscale/);
    
    // Verify imperial numeral
    await expect(juliusCard.locator('.imperial-numeral')).toContainText('I');
    
    // Verify name
    await expect(juliusCard.locator('h3')).toContainText('Julius');
    
    // Verify dates (using en-dash – from the data)
    await expect(juliusCard.locator('text="100–44 BC"')).toBeVisible();
    
    // Verify tag quote
    await expect(juliusCard.locator('text=/".*"/')).toBeVisible();
  });

  test('caesar cards hover effects', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    const juliusCard = page.locator('a[href="/12c/julius/"]');
    const bustImg = juliusCard.locator('img');
    
    // Check initial grayscale state
    await expect(bustImg).toHaveClass(/grayscale/);
    
    // Hover over card
    await juliusCard.hover();
    
    // Check hover effects (using group-hover for the image)
    await expect(bustImg).toHaveClass(/group-hover:grayscale-0/);
    await expect(juliusCard).toHaveClass(/hover:-translate-y-1/);
  });

  test('navigation to caesar pages works', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Click on Julius
    await page.click('a[href="/12c/julius/"]');
    await page.waitForLoadState('networkidle');

    // Should navigate to Julius page
    await expect(page).toHaveURL(/\/12c\/julius\/$/);
    await expect(page.locator('main h2.imperial-rubric')).toContainText('Julius');
  });

  test('responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Should still show all caesars
    const caesarCards = page.locator('a[href*="/"]');
    await expect(caesarCards).toHaveCount(12);

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');

    // Should use grid layout on desktop
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible();
  });
});
