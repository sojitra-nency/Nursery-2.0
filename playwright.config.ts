import { defineConfig, devices } from "@playwright/test";

/** Override with E2E_PORT when something else occupies 3000 locally. */
const PORT = process.env.E2E_PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  // Compile every locale route once before the workers start — see the file for why.
  globalSetup: "./e2e/global-setup.ts",
  // Headroom for the first hit on a route the warm-up missed.
  expect: { timeout: 15_000 },
  use: { baseURL: BASE_URL, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // npm, matching package-lock.json and the CI workflow — `pnpm dev` here meant
    // the suite could only ever run against a server someone had already started.
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
