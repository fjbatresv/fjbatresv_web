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

test('redirects www to apex before legacy redirects or index rewrites', () => {
  for (const [uri, querystring, host, expected] of [
    ['/', {}, 'www.fjbatresv.com', 'https://fjbatresv.com/'],
    ['/es/', { ref: { value: 'linkedin' } }, 'www.fjbatresv.com', 'https://fjbatresv.com/es/?ref=linkedin'],
    ['/about', {}, 'WWW.FJBATRESV.COM', 'https://fjbatresv.com/about'],
    [
      '/search',
      { 'tag%20name': { multiValue: [{ value: 'hello%20world' }, { value: 'a%2Bb' }] } },
      'www.fjbatresv.com',
      'https://fjbatresv.com/search?tag%20name=hello%20world&tag%20name=a%2Bb',
    ],
  ]) {
    const result = handler({ request: { uri, querystring, headers: { host: { value: host } } } });
    assert.equal(result.statusCode, 301);
    assert.equal(result.headers.location.value, expected);
    assert.equal(result.headers['cache-control'].value, 'max-age=3600');
  }
});

test('requests without a host header continue through the normal handler', () => {
  const result = handler({ request: { uri: '/nope' } });
  assert.equal(result.uri, '/nope/index.html');
  assert.equal(result.statusCode, undefined);
});
