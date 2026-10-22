import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const routes = [
    'http://localhost:3000/',
    'http://localhost:3000/admin',
    'http://localhost:3000/portal',
    'http://localhost:3000/sign-in',
    'http://localhost:3000/sign-up',
    'http://localhost:3000/portal/g/demo',
  ];

  for (const route of routes) {
    page.removeAllListeners('response');
    page.on('response', response => {
      if (response.url().includes(route)) {
        console.log(`[${response.status()}] ${response.url()}`);
        const location = response.headers()['location'];
        const refresh = response.headers()['refresh'];
        if (location) console.log(`  Location: ${location}`);
        if (refresh) console.log(`  Refresh: ${refresh}`);
      }
    });

    try {
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`SUCCESS: ${route} -> ${page.url()}`);
    } catch (error) {
      const err = error as Error;
      console.log(`FAILED: ${route} -> ${err.message.substring(0, 100)}`);
    }
  }

  await browser.close();
})();
