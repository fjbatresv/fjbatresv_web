// One-off OG asset render: NODE_PATH=<npx Playwright node_modules> node scripts/og-image.mjs
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [template, logo, font400, font600] = await Promise.all([
  readFile(new URL('./og-image.html', import.meta.url), 'utf8'),
  readFile(new URL('../public/brand/jb-isotipo.png', import.meta.url)),
  readFile(new URL('../public/fonts/poppins-400-latin.woff2', import.meta.url)),
  readFile(new URL('../public/fonts/poppins-600-latin.woff2', import.meta.url)),
]);
const dataUri = `data:image/png;base64,${logo.toString('base64')}`;
const fontUri = (font) => `data:font/woff2;base64,${font.toString('base64')}`;
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
for (const [lang, role] of [
  ['en', 'Solutions Architect'],
  ['es', 'Arquitecto de Soluciones'],
]) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    template
      .replace('{{LOGO}}', dataUri)
      .replace('{{ROLE}}', role)
      .replace('{{FONT400}}', fontUri(font400))
      .replace('{{FONT600}}', fontUri(font600))
  );
  await page.screenshot({
    path: new URL(`../public/og-image-${lang}.png`, import.meta.url).pathname,
  });
  await page.close();
}
await browser.close();
