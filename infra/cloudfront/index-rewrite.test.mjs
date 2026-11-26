import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./index-rewrite.js', import.meta.url), 'utf8');
const handler = new Function(`${source}\nreturn handler;`)();

test('rewrites extensionless routes to their prerendered index', () => {
  for (const [uri, expected] of [
    ['/', '/'],
    ['/projects', '/projects/index.html'],
    ['/projects/', '/projects/index.html'],
    ['/es', '/es/index.html'],
    ['/es/', '/es/index.html'],
    ['/assets/i18n.v2/', '/assets/i18n.v2/index.html'],
    ['/es/contact', '/es/contact/index.html'],
  ]) assert.equal(handler({ request: { uri } }).uri, expected);
});

test('leaves files and query strings unchanged', () => {
  const querystring = { a: { value: '1' } };
  for (const uri of [
    '/main-ABC123.js',
    '/assets/logo.webp',
    '/assets/i18n.v2/x.json',
    '/privacy-policy.pdf',
    '/robots.txt',
  ]) {
    const request = { uri, querystring };
    const result = handler({ request });
    assert.equal(result.uri, uri);
    assert.equal(result.querystring, querystring);
  }
  const request = { uri: '/projects', querystring };
  assert.equal(handler({ request }).querystring, querystring);
});
