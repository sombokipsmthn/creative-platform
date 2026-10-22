import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const email = process.env.PLAYWRIGHT_AUTH_EMAIL ?? "dev-admin@localhost.test";
const password = process.env.PLAYWRIGHT_AUTH_PASSWORD ?? "local-development-only-password";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let failures = 0;
function check(condition, message) {
  if (!condition) { failures += 1; console.error(`FAIL ${message}`); }
  else console.log(`PASS ${message}`);
}
try {
  const signIn = await context.request.post(`${baseURL}/api/auth/sign-in/email`, {
    headers: { origin: baseURL, "content-type": "application/json" },
    data: { email, password, rememberMe: true },
  });
  check(signIn.ok(), `sign-in status=${signIn.status()}`);

  const portfolio = await context.request.get(`${baseURL}/api/portfolio`);
  check(portfolio.ok(), `portfolio API status=${portfolio.status()}`);
  const portfolioBody = await portfolio.json();
  const publicHandle = portfolioBody.user?.handle;
  check(typeof portfolioBody.hasPublishedContent === "boolean", "portfolio API reports publication eligibility");

  const page = await context.newPage();
  await page.goto(`${baseURL}/admin/portfolio`, { waitUntil: "networkidle", timeout: 30_000 });
  check(await page.getByText("Gallery-curated content").isVisible(), "portfolio editor identifies gallery curation as primary");
  check(await page.getByText(/Secondary workflow for published projects/i).isVisible(), "project workflow remains secondary");
  await page.goto(`${baseURL}/admin`, { waitUntil: "networkidle", timeout: 30_000 });
  const sidebarLink = page.getByRole("link", { name: "Public portfolio", exact: true });
  if (portfolioBody.hasPublishedContent && publicHandle) {
    check(await sidebarLink.isVisible(), "public portfolio sidebar link is visible when content exists");
    check((await sidebarLink.getAttribute("href")) === `/p/${publicHandle}`, "sidebar points to the canonical public portfolio URL");
  } else {
    check(!(await sidebarLink.isVisible()), "public portfolio sidebar link is hidden when no content exists");
  }
  await page.close();

  const galleries = await context.request.get(`${baseURL}/api/galleries`);
  check(galleries.ok(), `gallery API status=${galleries.status()}`);
  for (const gallery of (await galleries.json()).galleries ?? []) {
    if (!gallery.slug) continue;
    const response = await context.request.get(`${baseURL}/api/public/galleries/${gallery.slug}`);
    check([200, 401, 410].includes(response.status()), `public gallery ${gallery.slug} preserves access boundary`);
  }
} finally {
  await context.close();
  await browser.close();
}
if (failures) process.exit(1);
console.log("Portfolio gallery smoke passed.");
