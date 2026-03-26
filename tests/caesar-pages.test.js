import { test, expect } from '@playwright/test';

test.describe('Caesar Pages', () => {
  const baseUrl = 'http://localhost:4173/12c/';
  const caesars = [
    { slug: 'julius', name: 'Julius', numeral: 'I' },
    { slug: 'augustus', name: 'Augustus', numeral: 'II' },
    { slug: 'tiberius', name: 'Tiberius', numeral: 'III' },
    { slug: 'caligula', name: 'Caligula', numeral: 'IV' },
    { slug: 'claudius', name: 'Claudius', numeral: 'V' },
    { slug: 'nero', name: 'Nero', numeral: 'VI' },
    { slug: 'galba', name: 'Galba', numeral: 'VII' },
    { slug: 'otho', name: 'Otho', numeral: 'VIII' },
    { slug: 'vitellius', name: 'Vitellius', numeral: 'IX' },
    { slug: 'vespasian', name: 'Vespasian', numeral: 'X' },
    { slug: 'titus', name: 'Titus', numeral: 'XI' },
    { slug: 'domitian', name: 'Domitian', numeral: 'XII' }
  ];

  test('all caesar pages load correctly', async ({ page }) => {
    for (const caesar of caesars) {
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
    }
  });

  test('navigation between caesars works', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Navigate to Augustus (use nav specifically to avoid ambiguity)
    await page.locator('nav a[href*="augustus"]').click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/augustus/);
    await expect(page.locator('h2').first()).toContainText('Augustus');
    
    // Navigate to Nero
    await page.locator('nav a[href*="nero"]').click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/nero/);
    await expect(page.locator('h2').first()).toContainText('Nero');
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

  test('content sections load and display', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Should have multiple sections
    const sections = page.locator('section.chapter-content');
    expect(await sections.count()).toBeGreaterThan(5);
    
    // First section should be visible
    const firstSection = sections.first();
    await expect(firstSection).toBeVisible();
    
    // Section should have heading
    const heading = firstSection.locator('h3');
    await expect(heading).toBeVisible();
  });

  test('scrolling navigation updates active caesar', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Scroll down significantly
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    
    // Navigation should still show Julius as active
    const activeLink = page.locator('nav a[aria-current="page"]');
    await expect(activeLink).toHaveAttribute('aria-label', 'View biography of Julius');
  });

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Navigation should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Content should be readable
    await expect(page.locator('h2').first()).toContainText('Julius');
    expect(await page.locator('section').count()).toBeGreaterThan(0);
  });

  test('bilingual mode responsive behavior', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Switch to bilingual mode
    await page.click('button:has-text("Bilingual")');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(200);
    
    // Should have single column grid in bilingual mode sections on mobile
    const mobileGrid = page.locator('.chapter-content .grid-cols-1').first();
    await expect(mobileGrid).toBeVisible();
    
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(200);
    
    // Should be side-by-side on desktop
    const desktopGrid = page.locator('.chapter-content .md\\:grid-cols-2').first();
    await expect(desktopGrid).toBeVisible();
  });

  test('page metadata and SEO', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Julius/);
    
    // Check meta description (page-specific one is usually second)
    const metaDescription = page.locator('meta[name="description"]');
    if (await metaDescription.count() > 0) {
      await expect(metaDescription.last()).toHaveAttribute('content', /./);
    }
  });

  test('navigation accessibility', async ({ page }) => {
    await page.goto(baseUrl + 'julius');
    await page.waitForLoadState('networkidle');

    // Navigation links should have proper aria labels
    const navLinks = page.locator('nav a[href*="/"]');
    await expect(navLinks).toHaveCount(12);
    
    // Each link should have aria-label
    for (let i = 0; i < await navLinks.count(); i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveAttribute('aria-label', /View biography of/);
    }
    
    // Current page should have aria-current="page"
    const activeLink = page.locator('a[aria-current="page"]');
    await expect(activeLink).toBeVisible();
  });
});
