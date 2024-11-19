import { URLS } from '@/frontend/constants/urls';
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(() => {
    console.log('New test starting!');
  });

  test('should load successfully', async ({ page }) => {
    await page.goto(URLS.home);
    await expect(page).toHaveURL(URLS.home);
    await expect(page.locator('h1')).toContainText(
      'Welcome to my Next.js App!'
    );
    await expect(page.locator('a')).toContainText('Go to dummies test');
    await expect(
      page.getByRole('link', { name: 'Go to dummies test' })
    ).toBeVisible();
  });

  test('go to dummies by clicking link and get back ', async ({ page }) => {
    await page.goto(URLS.home);
    await expect(page).toHaveURL(URLS.home);

    // go to dummies
    await page.getByRole('link', { name: 'Go to dummies test' }).click();
    await expect(page).toHaveURL(URLS.dummiesTest);

    //go back
    await page.getByRole('button', { name: '← Go Back' }).click();
    await expect(page).toHaveURL(URLS.home);
    await expect(page.locator('h1')).toContainText(
      'Welcome to my Next.js App!'
    );
  });
});
