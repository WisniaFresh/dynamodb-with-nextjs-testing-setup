import { URLS } from '@/frontend/constants/urls';
import { test, expect } from '@playwright/test';

test.describe('Dummies', () => {
  test.beforeEach(() => {
    console.log('New test starting!');
  });

  test('create new', async ({ page }) => {
    await page.goto(URLS.dummiesTest);
    await expect(page).toHaveURL(URLS.dummiesTest);
    await page.getByPlaceholder('Name').fill('Jakub');
    await page.getByPlaceholder('Name').press('Tab');
    await page.getByPlaceholder('Description').fill('Hej');
    await page.getByPlaceholder('Name').fill('plawright_test');
    const [response] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/dummies') && response.status() === 201
      ),
      page.getByRole('button', { name: 'Submit' }).click(),
    ]);

    const responseData = await response.json();
    const createdId = responseData.id;
    await page.screenshot({
      path: 'playwright/test-screenshots/dummies/page01.png',
    });
    await page.getByTestId(`check-button-${createdId}`).click();
    await expect(page.getByRole('heading', { name: 'Dummy Details' }))
      .toBeVisible;
    await page.getByRole('button', { name: '← Go Back' }).click();
    await expect(page).toHaveURL(URLS.dummiesTest);
  });
});
