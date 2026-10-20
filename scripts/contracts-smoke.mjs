import { chromium } from 'playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let failures = 0;
const check = (condition, message) => { if (condition) console.log(`PASS ${message}`); else { failures += 1; console.error(`FAIL ${message}`); } };
try {
  const bootstrap = await context.request.post(`${baseURL}/api/dev-auth/bootstrap`);
  check(bootstrap.ok(), `local auth bootstrap status=${bootstrap.status()}`);
  const templatesResponse = await context.request.get(`${baseURL}/api/contracts/templates`);
  check(templatesResponse.ok(), `template API status=${templatesResponse.status()}`);
  const templatesPayload = await templatesResponse.json();
  const templates = Array.isArray(templatesPayload) ? templatesPayload : templatesPayload.templates;
  check(Array.isArray(templates), 'template response contains an array');
  const page = await context.newPage();
  await page.goto(`${baseURL}/admin/contracts/templates`, { waitUntil: 'networkidle', timeout: 30_000 });
  check(await page.getByRole('heading', { name: 'Contract templates' }).isVisible(), 'template library renders');
  if (templates?.length) {
    await page.locator('article').first().waitFor({ state: 'visible', timeout: 30_000 });
    const first = page.locator('article').first();
    await first.getByRole('button', { name: 'Preview' }).click();
    check(await page.getByRole('dialog').isVisible(), 'template preview opens');
    await page.getByRole('link', { name: /Use template/ }).last().click();
    await page.waitForURL(/\/admin\/contracts\/builder\?templateId=/, { timeout: 30_000 });
    check(await page.getByText(/Loading contract builder|Contract completion/).first().isVisible(), 'document builder route opens');
  }
  await page.close();
} finally { await context.close(); await browser.close(); }
if (failures) process.exit(1);
console.log('Contracts smoke passed.');
