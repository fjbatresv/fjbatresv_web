import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = 'dist/javier-batres-site/browser';

export function findInlineIssue(html) {
  const document = parse(html);
  const nodes = [...(document.childNodes ?? [])];

  while (nodes.length) {
    const node = nodes.pop();
    if (!node) continue;

    const attributes = node.attrs ?? [];
    if (attributes.some(({ name }) => /^on[a-z]+$/i.test(name))) {
      return { snippet: `<${node.tagName ?? 'element'}>` };
    }

    if (node.tagName === 'script') {
      const hasSrc = attributes.some(({ name }) => name === 'src');
      const type = attributes
        .find(({ name }) => name === 'type')
        ?.value.trim()
        .toLowerCase();
      if (!hasSrc && type !== 'application/json' && type !== 'application/ld+json') {
        return { snippet: '<script>' };
      }
    }

    nodes.push(...(node.childNodes ?? []), ...(node.content?.childNodes ?? []));
  }

  return null;
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
