import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = 'dist/javier-batres-site/browser';

export function findInlineIssue(html) {
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi);
  for (const match of scripts) {
    const attributes = match[1];
    if (/(?:^|\s)src(?:\s|=|$)/i.test(attributes)) continue;

    const type = attributes.match(/(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const value = type?.[1] ?? type?.[2] ?? type?.[3];
    if (value !== 'application/json' && value !== 'application/ld+json') {
      return { snippet: match[0].slice(0, 180) };
    }
  }

  const inlineHandler = html.match(/\son[a-z]+\s*=/i);
  return inlineHandler ? { snippet: inlineHandler[0] } : null;
}

async function collectHtml(directory, htmlFiles) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectHtml(path, htmlFiles);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}

async function checkBuiltHtml() {
  const htmlFiles = [];
  await collectHtml(root, htmlFiles);
  let failed = false;
  for (const file of htmlFiles) {
    const issue = findInlineIssue(await readFile(file, 'utf8'));
    if (issue) {
      failed = true;
      console.error(`${file}: ${issue.snippet}`);
    }
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkBuiltHtml();
}
