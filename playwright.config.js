const { defineConfig, devices } = require('@playwright/test');
const dotenv = require('dotenv');

dotenv.config();

const storeUrl = process.env.STORE_URL && process.env.STORE_URL.trim();
const baseURL = storeUrl ? `https://${storeUrl}` : undefined;

module.exports = defineConfig({
  testDir: '.',
  testMatch: [
    'tests/**/*.spec.js',
    'tests/**/*.spec.ts',
    'features/**/*.spec.js',
    'features/**/*.spec.ts',
  ],
  globalSetup: './tests/global-setup.js',

  timeout: 30_000,
  expect: { timeout: 10_000 },

  fullyParallel: false,
  retries: 1,
  workers: 1,

  reporter: [['list']],

  use: {
    baseURL,
    screenshot: 'off',
    video: 'off',
    trace: 'off',

    viewport: { width: 1280, height: 720 },

    storageState: 'tests/.auth/storage-state.json',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'tablet',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],
});
