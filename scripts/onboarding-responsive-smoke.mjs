import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const browser = await chromium.launch({ headless: true });
let failures = 0;

function check(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL ${message}`);
  } else {
    console.log(`PASS ${message}`);
  }
}

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.name === "mobile",
      hasTouch: viewport.name === "mobile",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("favicon")) {
        errors.push(`console: ${message.text()}`);
      }
    });

    const bootstrap = await context.request.post(`${baseURL}/api/dev-auth/bootstrap`);
    check(bootstrap.ok(), `${viewport.name} auth bootstrap status=${bootstrap.status()}`);

    await page.goto(`${baseURL}/admin`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(500);

    const onboarding = await context.request.get(`${baseURL}/api/onboarding`);
    const onboardingBody = await onboarding.json();
    check(onboarding.ok(), `${viewport.name} onboarding API status=${onboarding.status()}`);

    if (onboardingBody.eligible !== true) {
      console.log(`SKIP ${viewport.name} modal interaction: local user is not eligible`);
      await context.close();
      continue;
    }

    const modal = page.getByRole("dialog");
    await modal.waitFor({ state: "visible", timeout: 30_000 });
    const bounds = await modal.boundingBox();
    const metrics = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    check(Boolean(bounds), `${viewport.name} modal visible`);
    if (bounds) {
      check(bounds.x >= 0 && bounds.y >= 0, `${viewport.name} modal starts inside viewport`);
      check(bounds.x + bounds.width <= metrics.width + 1, `${viewport.name} modal fits horizontally`);
      check(bounds.y + bounds.height <= metrics.height + 1, `${viewport.name} modal fits vertically`);
    }
    check(metrics.documentWidth <= metrics.width && metrics.bodyWidth <= metrics.width, `${viewport.name} modal no horizontal overflow`);
    check(await page.getByRole("button", { name: /continue/i }).isVisible(), `${viewport.name} continue action visible`);
    check(await page.getByRole("button", { name: /skip for now/i }).isVisible(), `${viewport.name} skip action visible`);

    await page.getByLabel("Bio").scrollIntoViewIfNeeded();
    check(await page.getByLabel("Bio").isVisible(), `${viewport.name} lower form field reachable`);
    await page.getByRole("button", { name: /continue/i }).scrollIntoViewIfNeeded();
    check(await page.getByRole("button", { name: /continue/i }).isVisible(), `${viewport.name} continue remains reachable`);
    check(errors.length === 0, `${viewport.name} browser errors=${errors.length}`);
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures > 0) {
  console.error(`Onboarding responsive smoke failed with ${failures} failure(s).`);
  process.exit(1);
}

console.log("Onboarding responsive smoke passed.");
