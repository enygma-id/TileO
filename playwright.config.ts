import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './src/browser',
  timeout: 120000,
  workers: 1,
  use: {
    baseURL: process.env.TILEO_TEST_URL ?? 'http://127.0.0.1:8091',
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
