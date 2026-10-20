import { chromium } from 'playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`PASS ${message}`);
  else { failures += 1; console.error(`FAIL ${message}`); }
};

try {
  const bootstrap = await context.request.post(`${baseURL}/api/dev-auth/bootstrap`);
  check(bootstrap.ok(), `local auth bootstrap status=${bootstrap.status()}`);

  const clientsResponse = await context.request.get(`${baseURL}/api/clients`);
  check(clientsResponse.ok(), `clients API status=${clientsResponse.status()}`);
  const clientsPayload = await clientsResponse.json();
  const clients = Array.isArray(clientsPayload) ? clientsPayload : clientsPayload.clients;
  check(Array.isArray(clients) && clients.length > 0, 'at least one persisted client is available');

  const templatesResponse = await context.request.get(`${baseURL}/api/contracts/templates`);
  check(templatesResponse.ok(), `template API status=${templatesResponse.status()}`);
  const templatesPayload = await templatesResponse.json();
  const templates = Array.isArray(templatesPayload) ? templatesPayload : templatesPayload.templates;
  check(Array.isArray(templates), 'template response contains an array');

  const page = await context.newPage();
  await page.goto(`${baseURL}/admin/contracts/templates`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.getByRole('heading', { name: 'Contract templates' }).waitFor({ state: 'visible', timeout: 30_000 });
  check(true, 'template library renders');

  const card = page.locator('article').first();
  const emptyState = page.getByText('No templates found', { exact: true });
  await Promise.race([
    card.waitFor({ state: 'visible', timeout: 30_000 }),
    emptyState.waitFor({ state: 'visible', timeout: 30_000 }),
  ]);

  let builderURL = `${baseURL}/admin/contracts/builder`;
  if (templates.length > 0) {
    check(await card.isVisible(), 'persisted template cards render');
    await card.getByRole('button', { name: 'Preview' }).click();
    check(await page.getByRole('dialog').isVisible(), 'template preview opens');
    await page.getByRole('link', { name: /Use template/ }).last().click();
    await page.waitForURL(/\/admin\/contracts\/builder\?templateId=/, { timeout: 30_000 });
    builderURL = page.url();
    check(true, 'Use Template opens the document-first builder');
  } else {
    check(await emptyState.isVisible(), 'persisted empty template state renders');
    await page.getByRole('link', { name: 'Start from scratch' }).click();
    await page.waitForURL(/\/admin\/contracts\/builder$/, { timeout: 30_000 });
    builderURL = page.url();
    check(true, 'empty state opens the scratch builder');
  }

  await page.getByText('Contract completion', { exact: true }).waitFor({ state: 'visible', timeout: 30_000 });
  check(true, 'document-first builder loads');

  const client = clients[0];
  const title = `Browser Contract ${Date.now()}`;
  const titleInput = page.getByPlaceholder('e.g. Brand Photography Agreement');
  await titleInput.fill(title);
  const selects = page.locator('select');
  await selects.first().selectOption(client.id);
  const saveResponse = page.waitForResponse((response) => response.url().endsWith('/api/contracts') && response.request().method() === 'POST', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Save Draft' }).click();
  const createdResponse = await saveResponse;
  check(createdResponse.ok(), `draft save status=${createdResponse.status()}`);
  const created = await createdResponse.json();
  check(Boolean(created.id), 'draft save returns a contract ID');
  await page.getByText('Saved', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 });
  check(true, 'draft save feedback renders');

  await page.goto(`${baseURL}/admin/contracts/${created.id}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.getByText('Contract completion', { exact: true }).waitFor({ state: 'visible', timeout: 30_000 });
  const titleValue = await page.locator('input').first().inputValue();
  check(titleValue === title, 'saved draft reopens with the same title');
  check(page.url().endsWith(`/admin/contracts/${created.id}`), 'saved draft reopens at its existing contract ID');
  await page.close();
} finally {
  await context.close();
  await browser.close();
}

if (failures) process.exit(1);
console.log('Contracts smoke passed.');
