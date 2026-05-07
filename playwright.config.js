import { defineConfig } from '@playwright/test';

const PLAYWRIGHT_PORT = 4176;
const BASE_URL = `http://127.0.0.1:${PLAYWRIGHT_PORT}`;

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --strictPort --port ${PLAYWRIGHT_PORT}`,
    url: `${BASE_URL}/`,
    reuseExistingServer: false
  },
  use: {
    baseURL: BASE_URL
  }
});
