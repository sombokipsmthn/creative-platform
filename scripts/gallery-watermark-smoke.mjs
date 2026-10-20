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
    data: { title, description: "Disposable settings verification fixture", category: "Verification" },
  });
  check(create.status() === 201, `fixture gallery creation status=${create.status()}`);
  if (!create.ok()) throw new Error(`Fixture gallery creation failed: ${await create.text()}`);
  const created = await create.json();
  galleryId = created.gallery?.id ?? null;
  check(Boolean(galleryId), "fixture gallery has an ID");
  if (!galleryId) throw new Error("Fixture gallery did not return an ID.");

  const page = await context.newPage();
  await page.goto(`${baseURL}/admin/galleries/${galleryId}`, { waitUntil: "networkidle", timeout: 30_000 });
  await page.getByRole("button", { name: /^Settings$/i }).click();
  await page.getByText("Watermark presets").waitFor({ state: "visible", timeout: 30_000 });
  check(true, "actual gallery Settings tab and watermark editor render");

  const presetName = `Verification Preset ${Date.now()}`;
  await page.getByLabel("Watermark text").fill("VERIFY-WATERMARK");
  await page.getByPlaceholder("Preset name").fill(presetName);
  await page.getByRole("button", { name: "Save preset" }).click();
  await page.getByText(presetName, { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  check(true, "watermark preset saves and appears in editor");

  const presetRow = page.getByText(presetName, { exact: true }).locator("..");
  await presetRow.getByRole("button", { name: "Apply" }).click();
  const watermarkSave = page.waitForResponse(response => response.url().includes(`/api/galleries/${galleryId}/watermark`) && response.request().method() === "PATCH", { timeout: 15_000 });
  await page.getByRole("button", { name: "Save watermark" }).click();
  const watermarkResponse = await watermarkSave;
  check(watermarkResponse.ok(), `watermark save status=${watermarkResponse.status()}`);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Settings$/i }).click();
  await page.getByText("Watermark presets").waitFor({ state: "visible", timeout: 30_000 });
  check(await page.getByText(presetName, { exact: true }).isVisible(), "watermark preset persists after gallery reload");
  check((await page.getByLabel("Watermark text").inputValue()) === "VERIFY-WATERMARK", "applied watermark value persists after reload");
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
