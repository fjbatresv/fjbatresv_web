import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = 'dist/javier-batres-site/browser';
const htmlFiles = [];

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

await collect(root);
let failed = false;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const inlineScript = html.match(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script\s*>/i);
  const allowedDataScript = inlineScript && /\btype\s*=\s*["']application\/(?:json|ld\+json)["']/i.test(inlineScript[0]);
  const inlineHandler = html.match(/\son[a-z]+\s*=/i);
  if ((inlineScript && !allowedDataScript) || inlineHandler) {
    failed = true;
    console.error(`${file}: ${(inlineScript && !allowedDataScript ? inlineScript[0] : inlineHandler[0]).slice(0, 180)}`);
  }
}
if (failed) process.exitCode = 1;
