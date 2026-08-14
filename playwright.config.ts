import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Global setup runs before all tests — seeds the test database */
  globalSetup: './e2e/global-setup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    /* Always start a fresh server: reusing an existing dev server would ignore
       the DB_DATABASE_URL injected below and hit whatever DB it was started
       with, while global-setup seeds the test DB — a silent mismatch. */
    reuseExistingServer: false,
    timeout: 120_000,
    /* NEXT_PUBLIC_APP_URL is required at request time (SEO metadata, robots,
       sitemap), but .env files are gitignored so CI has no .env. Inject it so
       the dev server always has it; keep matching baseURL above. */
    env: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      /* Inject the test database URL into the dev server so it uses the test DB.
         DATABASE_TEST_URL wins over DB_DATABASE_URL when both are set, so the
         dev database is never wiped by the e2e seed. */
      ...(process.env.DATABASE_TEST_URL || process.env.DB_DATABASE_URL
        ? {
            DB_DATABASE_URL:
              process.env.DATABASE_TEST_URL ||
              process.env.DB_DATABASE_URL ||
              '',
          }
        : {}),
    },
  },
})
