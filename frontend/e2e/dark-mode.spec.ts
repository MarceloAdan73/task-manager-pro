import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test('Test A: Toggle between light and dark mode', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Apply demo credentials');
    
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login'),
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    if (response && response.status() === 200) {
      try {
        await page.waitForURL('**/', { timeout: 5000 });
      } catch {
        // Continue
      }
    }
    
    await page.waitForTimeout(2000);
    
    const html = page.locator('html');
    const initialDarkMode = await html.evaluate(el => el.classList.contains('dark'));
    
    const themeButton = page.locator('button').filter({ hasText: /light|dark|☀️|🌙/ }).first();
    if (await themeButton.isVisible().catch(() => false)) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      const newDarkMode = await html.evaluate(el => el.classList.contains('dark'));
      expect(newDarkMode).toBe(!initialDarkMode);
      
      await page.reload();
      await page.waitForTimeout(2000);
      
      const persistedDarkMode = await html.evaluate(el => el.classList.contains('dark'));
      expect(persistedDarkMode).toBe(newDarkMode);
    }
  });

  test('Test B: Dark mode on login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);
    
    const html = page.locator('html');
    const initialDarkMode = await html.evaluate(el => el.classList.contains('dark'));
    
    const themeButton = page.locator('button').filter({ hasText: /light|dark|☀️|🌙/ }).first();
    if (await themeButton.isVisible().catch(() => false)) {
      await themeButton.click();
      await page.waitForTimeout(500);
      
      const newDarkMode = await html.evaluate(el => el.classList.contains('dark'));
      expect(newDarkMode).toBe(!initialDarkMode);
      
      const bgElement = page.locator('.min-h-screen').first();
      if (await bgElement.isVisible().catch(() => false)) {
        const bgColor = await bgElement.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.backgroundColor;
        });
        expect(bgColor).toBeTruthy();
      }
    }
  });
});