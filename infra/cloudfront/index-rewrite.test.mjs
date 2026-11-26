import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./index-rewrite.js', import.meta.url), 'utf8');
const handler = new Function(`${source}\nreturn handler;`)();

test('rewrites extensionless routes to their prerendered index', () => {
  for (const [uri, expected] of [
    ['/', '/'],
    ['/es', '/es/index.html'],
    ['/es/', '/es/index.html'],
    ['/assets/i18n.v2/', '/assets/i18n.v2/index.html'],
  ])
    assert.equal(handler({ request: { uri } }).uri, expected);
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
  const request = { uri: '/nope', querystring };
  assert.equal(handler({ request }).querystring, querystring);
});

test('permanently redirects retired pages, including localized trailing slashes', () => {
  const targets = {
    about: 'experience',
    experience: 'experience',
    skills: 'experience',
    projects: 'projects',
    contact: 'contact',
    writing: '',
  };
  for (const [oldPath, section] of Object.entries(targets)) {
    for (const slash of ['', '/']) {
      for (const locale of ['', '/es']) {
        const expected = `${locale}/${section ? `#${section}` : ''}` || '/';
        const result = handler({ request: { uri: `${locale}/${oldPath}${slash}` } });
        assert.equal(result.statusCode, 301);
        assert.equal(result.headers.location.value, expected || '/');
      }
    }
  }
});

test('rewrites locales and unknown paths without redirecting', () => {
  for (const [uri, expected] of [
    ['/es', '/es/index.html'],
    ['/nope', '/nope/index.html'],
  ]) {
    const result = handler({ request: { uri } });
    assert.equal(result.uri, expected);
    assert.equal(result.statusCode, undefined);
  }
});
