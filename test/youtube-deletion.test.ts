import { test, expect } from '@playwright/test';

test.describe('YouTube Video Deletion', () => {
  let videoTitle: string;

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('Browser console:', msg.text()));

    console.log('Starting authentication process...');
    await page.goto('https://youtube-content-app-lysnx1fq.devinapps.com');

    await page.waitForLoadState('networkidle');
    console.log('Page loaded, attempting login...');

    await page.fill('input[name="email"]', 'masterai.digital@gmail.com');
    await page.fill('input[name="password"]', 'TTsghn5896');
    await page.click('button[type="submit"]');

    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/auth/v1/token') &&
        response.status() === 200
      ),
      page.waitForNavigation({ waitUntil: 'networkidle' })
    ]);
    console.log('Authentication successful');

    await page.waitForSelector('h2', { state: 'visible', timeout: 30000 });

    const headers = await page.locator('h2').allTextContents();
    console.log('Available headers:', headers);

    const youtubeHeader = page.getByRole('heading', {
      name: 'ספריית סרטוני YouTube',
      exact: true
    });
    await youtubeHeader.waitFor({ state: 'visible', timeout: 30000 });
    await youtubeHeader.evaluate(node => node.scrollIntoView());

    await page.waitForResponse(response =>
      response.url().includes('/rest/v1/youtube_videos') &&
      response.status() === 200
    );
    console.log('Videos data fetched');

    await page.waitForSelector('h3', {
      state: 'visible',
      timeout: 30000
    });
    console.log('Videos rendered in UI');

    const buttons = await page.locator('button').allTextContents();
    console.log('Available buttons:', buttons);

    videoTitle = await page.locator('h3').first().textContent() || 'Unknown Video';
    console.log(`First video title captured: ${videoTitle}`);
  });

  test('should show Hebrew confirmation dialog when deleting video', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-video-button"]');
    console.log('Delete button count:', await deleteButton.count());

    await deleteButton.first().click();

    await expect(page.getByRole('heading', { name: 'מחיקת סרטון' })).toBeVisible();
    await expect(page.getByText('האם אתה בטוח שברצונך למחוק את הסרטון')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ביטול' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'מחק' })).toBeVisible();

    await page.getByRole('button', { name: 'ביטול' }).click();
    await expect(page.getByRole('heading', { name: 'מחיקת סרטון' })).not.toBeVisible();
  });

  test('should delete video and persist after refresh', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="video-card"]').count();
    console.log(`Initial video count: ${initialCount}`);

    const deleteButton = page.locator('[data-testid="delete-video-button"]');
    await deleteButton.first().click();
    await page.getByRole('button', { name: 'מחק' }).click();

    await expect(page.locator('[data-testid="video-card"]')).toHaveCount(initialCount - 1);
    console.log('Video deleted successfully');

    await page.reload();
    await page.waitForLoadState('networkidle');

    const youtubeHeader = page.getByRole('heading', {
      name: 'ספריית סרטוני YouTube',
      exact: true
    });
    await youtubeHeader.waitFor({ state: 'visible', timeout: 30000 });
    await youtubeHeader.evaluate(node => node.scrollIntoView());

    await expect(page.locator('[data-testid="video-card"]')).toHaveCount(initialCount - 1);
    console.log('Video deletion persisted after refresh');
  });

  test('should show Hebrew error message when deletion fails', async ({ page }) => {
    await page.route('**/rest/v1/youtube_videos*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        await route.continue();
      }
    });

    const deleteButton = page.locator('[data-testid="delete-video-button"]');
    await deleteButton.first().click();
    await page.getByRole('button', { name: 'מחק' }).click();

    await expect(page.getByText('אירעה שגיאה במחיקת הסרטון')).toBeVisible();
    console.log('Error message displayed correctly');

    await expect(page.locator('[data-testid="video-title"]').first()).toHaveText(videoTitle);
  });
});
