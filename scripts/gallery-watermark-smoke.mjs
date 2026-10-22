import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const email = process.env.PLAYWRIGHT_AUTH_EMAIL ?? "dev-admin@localhost.test";
const password = process.env.PLAYWRIGHT_AUTH_PASSWORD ?? "local-development-only-password";
const title = `__settings-verification-${Date.now()}__`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let galleryId = null;
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

  const create = await context.request.post(`${baseURL}/api/galleries`, {
    headers: { "content-type": "application/json" },
    data: { title, description: "Disposable settings verification fixture", category: "Verification", accessPin: "2468" },
  });
  check(create.status() === 201, `fixture gallery creation status=${create.status()}`);
  if (!create.ok()) throw new Error(`Fixture gallery creation failed: ${await create.text()}`);
  const created = await create.json();
  galleryId = created.gallery?.id ?? null;
  check(Boolean(galleryId), "fixture gallery has an ID");
  if (!galleryId) throw new Error("Fixture gallery did not return an ID.");

  const page = await context.newPage();
  await page.goto(`${baseURL}/admin/galleries/${galleryId}`, { waitUntil: "networkidle", timeout: 30_000 });
  await page.getByTestId("gallery-tab-settings").click();
  await page.getByRole("heading", { name: "General" }).waitFor({ state: "visible", timeout: 30_000 });
  check(true, "actual gallery Settings tab and watermark editor render");

  const galleryName = page.locator('input[type="text"]').first();
  const originalTitle = await galleryName.inputValue();
  await galleryName.fill(`${originalTitle} Verification`);
  await page.getByRole("button", { name: "Save Settings" }).click();
  await page.getByText("Saved successfully").waitFor({ state: "visible", timeout: 15_000 });
  check(true, "gallery settings save successfully");
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("gallery-tab-settings").click();
  await page.getByRole("heading", { name: "General" }).waitFor({ state: "visible", timeout: 30_000 });
  check((await page.locator('input[type="text"]').first().inputValue()) === `${originalTitle} Verification`, "gallery setting persists after reload");
  const publish = await context.request.post(`${baseURL}/api/galleries/${galleryId}/publish`, {
    headers: { "content-type": "application/json" },
    data: { publish: true },
  });
  check(publish.ok(), `fixture publish status=${publish.status()}`);
  const gallerySlug = created.gallery?.slug;
  const clientPage = await context.newPage();
  await clientPage.goto(`${baseURL}/portal/g/${galleryId}/${gallerySlug}`, { waitUntil: "networkidle", timeout: 30_000 });
  await clientPage.getByPlaceholder("PIN").fill("2468");
  await clientPage.getByRole("button", { name: /unlock gallery/i }).click();
  check(await clientPage.getByText(originalTitle, { exact: false }).isVisible(), "client portal unlocks published fixture gallery");
  await clientPage.close();
  await page.close();
} finally {
  if (galleryId) {
    const deleted = await context.request.delete(`${baseURL}/api/galleries/${galleryId}`);
    check(deleted.ok(), `fixture cleanup status=${deleted.status()}`);
  }
  await context.close();
  await browser.close();
}

if (failures > 0) {
  console.error(`Gallery watermark smoke failed with ${failures} failure(s).`);
  process.exit(1);
}
console.log("Gallery watermark smoke passed.");
