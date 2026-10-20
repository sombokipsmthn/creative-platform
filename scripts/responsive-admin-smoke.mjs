import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const routes = [
  "/admin",
  "/admin/calendar",
  "/admin/clients",
  "/admin/contracts",
  "/admin/expenses",
  "/admin/galleries",
  "/admin/invoices",
  "/admin/projects",
  "/admin/quotes",
  "/admin/profile",
  "/admin/settings",
  "/admin/portfolio",
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];
const themes = ["light", "dark"];

const browser = await chromium.launch({ headless: true });
let failures = 0;

async function hasVisibleButton(page, pattern) {
  try {
    await page.getByRole("button", { name: pattern }).first().waitFor({ state: "visible", timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}


try {
  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const route of routes) {
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: theme,
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
        page.on("console", (message) => {
          if (message.type() === "error" && !message.text().includes("favicon") && !message.text().includes("/_next/hmr")) {
            errors.push(`console: ${message.text()}`);
          }
        });

        try {
          const bootstrap = await page.request.post(`${baseURL}/api/dev-auth/bootstrap`);
          if (!bootstrap.ok()) {
            throw new Error(`Local auth bootstrap failed: ${bootstrap.status()} ${await bootstrap.text()}`);
          }
          const response = await page.goto(`${baseURL}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
          await page.evaluate((selectedTheme) => {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(selectedTheme);
          }, theme);
          await page.waitForTimeout(3000);

          const metrics = await page.evaluate(() => ({
            width: window.innerWidth,
            documentWidth: document.documentElement?.scrollWidth ?? window.innerWidth,
            bodyWidth: document.body?.scrollWidth ?? window.innerWidth,
          }));
          const overflow = metrics.documentWidth > metrics.width || metrics.bodyWidth > metrics.width;
          const authenticated = response?.status() === 200 && !page.url().includes("/sign-in") && !page.url().includes("/login");
          const primaryActionVisible = await page.locator('button, a').filter({ hasText: /new|save|add|create|settings|profile|view/i }).first().isVisible().catch(() => true);
          const failed = !authenticated || !primaryActionVisible || overflow || errors.length > 0;
          if (failed) failures += 1;

          console.log(
            `${failed ? "FAIL" : "PASS"} ${theme} ${viewport.name} ${route} ` +
              `status=${response?.status() ?? "none"} authenticated=${authenticated} primaryAction=${primaryActionVisible} overflow=${overflow} errors=${errors.length}`,
          );
          for (const error of errors) console.error(`  ${error}`);
        } catch (error) {
          failures += 1;
          console.error(`FAIL ${theme} ${viewport.name} ${route}: ${error}`);
        } finally {
          await page.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

if (failures > 0) {
  console.error(`Responsive admin smoke failed with ${failures} failing checks.`);
  process.exit(1);
}

console.log(`Responsive admin smoke passed: ${themes.length * viewports.length * routes.length} checks.`);
