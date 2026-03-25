import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/12c/',
    reuseExistingServer: !process.env.CI
  },
  use: {
    baseURL: 'http://localhost:4173'
  }
});
