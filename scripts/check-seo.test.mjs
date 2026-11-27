import assert from 'node:assert/strict';
import test from 'node:test';
import { assertNoRawI18nText } from './no-raw-i18n-text.mjs';
import { assertIndexableSeo, assertNotFoundSeo } from './seo-assertions.mjs';

test('rejects unquoted raw translation keys in text nodes', () => {
  assert.throws(() => assertNoRawI18nText('<h1>hero.title</h1>'), /raw translation key/);
});

test('accepts translated Spanish text nodes', () => {
  assert.doesNotThrow(() => assertNoRawI18nText('<h1>Dureza técnica</h1>'));
});

test('checks indexable SEO metadata', () => {
  const valid =
    '<title>Javier Batres — Solutions Architect</title><meta property="og:image:alt" content="Javier"><meta name="twitter:image" content="/image.png">';
  assert.doesNotThrow(() => assertIndexableSeo(valid, 'index.html'));
  assert.throws(
    () =>
      assertIndexableSeo(
        valid.replace('</title>', ' longer longer longer longer longer longer longer</title>'),
        'index.html'
      ),
    /longer than 60/
  );
  assert.throws(
    () => assertIndexableSeo(valid.replace('twitter:image', 'twitter:title'), 'index.html'),
    /twitter:image missing/
  );
  assert.throws(
    () =>
      assertIndexableSeo(
        valid.replace('<title>', '<meta name="robots" content="noindex"><title>'),
        'index.html'
      ),
    /has noindex/
  );
});

test('checks not-found robots and link metadata', () => {
  assert.doesNotThrow(() => assertNotFoundSeo('<meta name="robots" content="noindex">'));
  assert.throws(() => assertNotFoundSeo('<link rel="canonical" href="/">'), /noindex missing/);
  assert.throws(
    () =>
      assertNotFoundSeo(
        '<meta name="robots" content="noindex"><link rel="alternate" hreflang="en">'
      ),
    /hreflang present/
  );
});
