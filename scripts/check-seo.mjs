import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../dist/javier-batres-site/browser/', import.meta.url);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
const meta = (html, name, value) => {
  const tag = html.match(/<meta\b[^>]*>/gi)?.find((item) => attr(item, name) === value);
  return tag && attr(tag, 'content');
};

for (const [lang, path, locale, canonical, title] of [
  [
    'en',
    'index.html',
    'en_US',
    'https://fjbatresv.com/',
    'Javier Batres — Solutions Architect &amp; Senior Full Stack Engineer',
  ],
  [
    'es',
    'es/index.html',
    'es_GT',
    'https://fjbatresv.com/es/',
    'Javier Batres — Arquitecto de Soluciones y Senior Full Stack Engineer',
  ],
]) {
  const html = await readFile(new URL(path, root), 'utf8');
  assert.equal(attr(html.match(/<html\b[^>]*>/i)?.[0] ?? '', 'lang'), lang);
  assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${path}: expected one h1`);
  assert.ok(html.includes(`<title>${title}</title>`), `${path}: title mismatch`);
  const description = meta(html, 'name', 'description');
  assert.ok(description && description.length <= 155, `${path}: description missing or too long`);
  const pageLinks = html.match(/<link\b[^>]*>/gi) ?? [];
  assert.ok(
    pageLinks.some((tag) => attr(tag, 'rel') === 'canonical' && attr(tag, 'href') === canonical)
  );
  const alternates = pageLinks.filter(
    (tag) => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang')
  );
  assert.deepEqual(
    alternates.map((tag) => [attr(tag, 'hreflang'), attr(tag, 'href')]),
    [
      ['en', 'https://fjbatresv.com/'],
      ['es', 'https://fjbatresv.com/es/'],
      ['x-default', 'https://fjbatresv.com/'],
    ]
  );
  assert.equal(meta(html, 'property', 'og:image'), `https://fjbatresv.com/og-image-${lang}.png`);
  assert.equal(meta(html, 'property', 'og:locale'), locale);
  assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
  const jsonLd = html.match(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i
  )?.[1];
  assert.ok(jsonLd, `${path}: JSON-LD missing`);
  assert.equal(JSON.parse(jsonLd)['@type'], 'ProfilePage');
  if (lang === 'es') assert.doesNotMatch(html, /"(?:hero|projects)\./);
}
