const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

dotenv.config();

const storeUrl = process.env.STORE_URL && process.env.STORE_URL.trim();
const baseURL = storeUrl ? `https://${storeUrl}` : undefined;

module.exports = defineConfig({
  testDir: '.',
  testMatch: [
    'playwright-config/**/*.spec.js',
    'playwright-config/**/*.spec.ts',
    'features/**/*.spec.js',
    'features/**/*.spec.ts',
  ],
  globalSetup: './playwright-config/global-setup.js',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  retries: 1,
  workers: 1,
  maxFailures: 1,

  reporter: [['list']],

  use: {
    baseURL,
    screenshot: 'off',
    video: 'off',
    trace: 'off',

    viewport: { width: 1280, height: 720 },

    storageState: 'playwright-config/.auth/storage-state.json',
  },

  projects: [
    {
      name: 'desktop',
      grepInvert: /\[mobile\]|\[tablet\]|\[tablet-lg\]/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'tablet-lg',
      grepInvert: /\[desktop\]|\[mobile\]|\[tablet\]/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'tablet',
      grepInvert: /\[desktop\]|\[mobile\]|\[tablet-lg\]/,
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile',
      grepInvert: /\[desktop\]|\[tablet\]|\[tablet-lg\]/,
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      },
    },
  ],
});
