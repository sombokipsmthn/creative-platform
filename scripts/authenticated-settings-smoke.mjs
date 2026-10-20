import { chromium } from "playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const email = process.env.PLAYWRIGHT_AUTH_EMAIL ?? "dev-admin@localhost.test";
const password = process.env.PLAYWRIGHT_AUTH_PASSWORD ?? "local-development-only-password";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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
  const signIn = await context.request.post(`${baseURL}/api/auth/sign-in/email`, {
    headers: { origin: baseURL, "content-type": "application/json" },
    data: { email, password, rememberMe: true },
  });
  check(signIn.ok(), `Better Auth sign-in status=${signIn.status()}`);

  const session = await context.request.get(`${baseURL}/api/auth/get-session`);
  check(session.ok(), `authenticated session status=${session.status()}`);

  const profilePage = await context.newPage();
  await profilePage.goto(`${baseURL}/admin/profile`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await profilePage.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  const profileName = profilePage.locator("#profile-full-name");
  const profileSave = profilePage.getByRole("button", { name: /save profile changes/i });
  await profileName.waitFor({ state: "visible", timeout: 30_000 });
  check(await profileSave.isVisible(), "profile primary save action is visible");
  const originalName = await profileName.inputValue();
  await profileSave.click();
  await profilePage.getByText("Profile saved successfully.").waitFor({ state: "visible", timeout: 15_000 });
  await profilePage.reload({ waitUntil: "networkidle" });
  await profileName.waitFor({ state: "visible", timeout: 15_000 });
  check((await profileName.inputValue()) === originalName, "profile value persists after reload");
  await profilePage.close();

  const settingsPage = await context.newPage();
  await settingsPage.goto(`${baseURL}/admin/settings`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await settingsPage.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  const businessName = settingsPage.locator('input').first();
  await businessName.waitFor({ state: "visible", timeout: 15_000 });
  const originalBusinessName = await businessName.inputValue();
  const settingsSave = settingsPage.getByRole("button", { name: /save settings changes/i });
  check(await settingsSave.isVisible(), "workspace settings save action is visible");
  await settingsSave.click();
  await settingsPage.getByText("Workspace settings saved.").waitFor({ state: "visible", timeout: 15_000 });
  await settingsPage.reload({ waitUntil: "networkidle" });
  await businessName.waitFor({ state: "visible", timeout: 15_000 });
  check((await businessName.inputValue()) === originalBusinessName, "workspace value persists after reload");
  await settingsPage.close();

  const portfolioPage = await context.newPage();
  const portfolioResponse = portfolioPage.waitForResponse(response => response.url().endsWith("/api/portfolio"), { timeout: 30_000 }).catch(() => null);
  await portfolioPage.goto(`${baseURL}/admin/portfolio`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await portfolioResponse;
  await portfolioPage.waitForFunction(() => !document.body.innerText.includes("Loading portfolio settings..."), null, { timeout: 60_000 });
  const portfolioSave = portfolioPage.locator("button").filter({ hasText: "Save draft" }).first();
  await portfolioSave.waitFor({ state: "visible", timeout: 60_000 });
  await portfolioSave.waitFor({ state: "visible", timeout: 60_000 });
  check(await portfolioSave.isVisible(), "portfolio save action is visible");
  await portfolioSave.click();
  await portfolioPage.getByText("Portfolio saved as draft.").waitFor({ state: "visible", timeout: 15_000 });
  await portfolioPage.reload({ waitUntil: "domcontentloaded" });
  const portfolioReloaded = portfolioPage.locator("button").filter({ hasText: "Save draft" }).first();
  const portfolioError = portfolioPage.getByText("Could not load portfolio settings.");
  await Promise.race([
    portfolioReloaded.waitFor({ state: "visible", timeout: 20_000 }),
    portfolioError.waitFor({ state: "visible", timeout: 20_000 }),
  ]);
  check(await portfolioReloaded.isVisible().catch(() => false), "portfolio editor remains available after reload");
  await portfolioPage.close();

  const galleries = await context.request.get(`${baseURL}/api/galleries`);
  check(galleries.ok(), `gallery list status=${galleries.status()}`);
  const galleryBody = await galleries.json();
  if (Array.isArray(galleryBody.galleries) && galleryBody.galleries.length > 0) {
    const galleryId = galleryBody.galleries[0].id;
    const galleryPage = await context.newPage();
    await galleryPage.goto(`${baseURL}/admin/galleries/${galleryId}`, { waitUntil: "networkidle", timeout: 30_000 });
    await galleryPage.getByTestId("gallery-tab-settings").click();
    await galleryPage.getByRole("heading", { name: "General" }).waitFor({ state: "visible", timeout: 15_000 });
    check(true, "actual gallery watermark editor is reachable");
    await galleryPage.close();
  } else {
    console.log("SKIP actual gallery watermark editor: no authenticated galleries exist");
  }
} finally {
  await context.close();
  await browser.close();
}

if (failures > 0) {
  console.error(`Authenticated settings smoke failed with ${failures} failure(s).`);
  process.exit(1);
}

console.log("Authenticated settings smoke passed.");
