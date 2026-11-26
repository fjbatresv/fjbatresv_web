// One-off asset capture: NODE_PATH=<npx Playwright node_modules> node scripts/capture-projects.mjs
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const projects = ['sdg19', 'guso', 'sinergia', 'rockers', 'pettzi', 'sar', 'migo', 'pdei'];
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);
await mkdir('/tmp/jb-project-captures', { recursive: true });
for (const id of projects) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  await page.goto(`https://${id}.fjbatresv.com`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.screenshot({ path: `/tmp/jb-project-captures/${id}.png`, fullPage: false });
  console.log(
    `${id}: ${await page.title()} — ${(await page.locator('body').innerText()).slice(0, 240).replace(/\s+/g, ' ')}`
  );
  await page.close();
}
await browser.close();
