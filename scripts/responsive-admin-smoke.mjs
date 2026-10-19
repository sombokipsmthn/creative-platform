import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3010";
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
];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];
const themes = ["light", "dark"];

const browser = await chromium.launch({ headless: true });
let failures = 0;

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
          if (
            message.type() === "error" &&
            !message.text().includes("favicon") &&
            !message.text().includes("/_next/hmr")
          ) {
            errors.push(`console: ${message.text()}`);
          }
        });

        try {
        const bootstrap = await page.request.post(`${baseURL}/api/dev-auth/bootstrap`);
        if (!bootstrap.ok()) {
          throw new Error(`Local auth bootstrap failed: ${bootstrap.status()} ${await bootstrap.text()}`);
        }
        const response = await page.goto(`${baseURL}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 30_000,
        });
          await page.evaluate((selectedTheme) => {
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(selectedTheme);
          }, theme);
          await page.waitForTimeout(250);

          const metrics = await page.evaluate(() => ({
            width: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
          }));
          const overflow =
            metrics.documentWidth > metrics.width || metrics.bodyWidth > metrics.width;
          const failed = response?.status() !== 200 || overflow || errors.length > 0;
          if (failed) failures += 1;

          console.log(
            `${failed ? "FAIL" : "PASS"} ${theme} ${viewport.name} ${route} ` +
              `status=${response?.status() ?? "none"} overflow=${overflow} errors=${errors.length}`,
          );
          if (errors.length > 0) {
            for (const error of errors) console.error(`  ${error}`);
          }
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
