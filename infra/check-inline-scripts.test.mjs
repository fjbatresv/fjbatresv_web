import assert from 'node:assert/strict';
import test from 'node:test';
import { findInlineIssue } from '../scripts/check-inline-scripts.mjs';

test('rejects an executable inline script after an allowed JSON block', () => {
  assert.ok(findInlineIssue('<script type="application/json">{}</script><script>run()</script>'));
});

test('does not read an allowed script type from its body or data-type attribute', () => {
  assert.ok(findInlineIssue('<script>application/json; run()</script>'));
  assert.ok(findInlineIssue('<script data-type="application/json">run()</script>'));
});

test('allows only JSON and JSON-LD inline scripts', () => {
  assert.equal(
    findInlineIssue(
      '<script type="application/json">{}</script><script type="application/ld+json">{}</script>'
    ),
    null
  );
});

test('rejects inline event handlers', () => {
  assert.ok(findInlineIssue('<button onclick="run()">Go</button>'));
});
