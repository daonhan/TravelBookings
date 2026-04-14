import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for running E2E tests against the Docker Compose stack.
 * The full stack (frontend on Nginx + all backends) must be running before tests execute.
 *
 * Usage:
 *   npx playwright test --config=playwright.docker.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['junit', { outputFile: '../../test-results/e2e-results.xml' }], ['html', { open: 'never' }]]
    : 'html',
  use: {
    // In Docker, the frontend Nginx serves on port 80 (mapped to host port 80 by default)
    baseURL: process.env.FRONTEND_URL ?? 'http://localhost:80',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // No webServer — the Docker Compose stack must be running externally
});
