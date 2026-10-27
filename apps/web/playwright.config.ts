import { defineConfig, devices } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // Conectar ao LiveKit pode levar alguns segundos.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Permite apontar para um Chromium já instalado (ex.: no ambiente de desenvolvimento remoto).
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
      },
    },
  ],
  // Sobe a API e o front já compilados; o preview do Vite repassa /api para a API.
  webServer: [
    {
      command: "pnpm --filter @thoth/api build && pnpm --filter @thoth/api start",
      url: "http://localhost:3000/health",
      env: { LOG_LEVEL: "warn" },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm build && pnpm preview --port ${port} --strictPort`,
      port,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
