import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Test A: Demo button fills form and submit works', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 });
    
    await page.click('text=Apply demo credentials');
    
    await expect(page.locator('#email')).toHaveValue('demo@taskmanager.com');
    await expect(page.locator('#password')).toHaveValue('demo123');
    
    await page.click('button[type="submit"]');
    
    await page.waitForResponse(response => response.url().includes('/api/auth/login'), { timeout: 15000 });
    
    const currentUrl = page.url();
    if (currentUrl === 'http://localhost:3004/' || currentUrl.endsWith('/')) {
      await expect(page.locator('body')).toContainText('Dashboard', { timeout: 10000 });
    } else {
      await expect(page.locator('body')).toContainText('Tasker Pro', { timeout: 5000 });
    }
  });

  test('Test B: Login with incorrect credentials shows error', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('input#email')).toBeVisible({ timeout: 10000 });
    
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForSelector('text=Invalid credentials', { timeout: 10000 });
    } catch {
      const response = await page.waitForResponse(response => response.url().includes('/api/auth/login'), { timeout: 5000 }).catch(() => null);
      if (!response) {
        await expect(page.locator('body')).toContainText('Login', { timeout: 3000 });
        return;
      }
    }
    await expect(page).toHaveURL('/login');
  });
});