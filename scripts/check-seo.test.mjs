import assert from 'node:assert/strict';
import test from 'node:test';
import { assertNoRawI18nText } from './no-raw-i18n-text.mjs';

test('rejects unquoted raw translation keys in text nodes', () => {
  assert.throws(() => assertNoRawI18nText('<h1>hero.title</h1>'), /raw translation key/);
});

test('accepts translated Spanish text nodes', () => {
  assert.doesNotThrow(() => assertNoRawI18nText('<h1>Dureza técnica</h1>'));
});
