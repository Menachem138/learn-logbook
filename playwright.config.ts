import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000, // Increase timeout to 60 seconds
  use: {
    baseURL: 'https://youtube-content-app-lysnx1fq.devinapps.com',
    trace: 'on-first-retry',
    video: 'on-first-retry',
    actionTimeout: 30000, // Add action timeout
    headless: true, // Run in headless mode
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
