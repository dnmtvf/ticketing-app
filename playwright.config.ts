import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8282',
    trace: 'on-first-retry',
    headless: true,
    locale: 'ru-RU'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'NUXT_PUBLIC_API_BASE=http://localhost:3022 pnpm dev',
    url: 'http://localhost:8282',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})

