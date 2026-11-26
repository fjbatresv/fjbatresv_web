import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./security-headers.js', import.meta.url), 'utf8');
const handler = new Function(`${source}\nreturn handler;`)();
const csp = "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; report-uri __SENTRY_CSP_REPORT_URI__";

test('sets all six security headers to the required values and preserves other headers', () => {
  const response = {
    statusCode: 200,
    headers: {
      'content-type': { value: 'text/html' },
      'cache-control': { value: 'max-age=60' },
      'x-frame-options': { value: 'SAMEORIGIN' },
    },
  };

  assert.equal(handler({ response }), response);
  assert.deepEqual(response.headers, {
    'content-type': { value: 'text/html' },
    'cache-control': { value: 'max-age=60' },
    'strict-transport-security': { value: 'max-age=31536000' },
    'x-content-type-options': { value: 'nosniff' },
    'x-frame-options': { value: 'DENY' },
    'referrer-policy': { value: 'strict-origin-when-cross-origin' },
    'permissions-policy': {
      value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },
    'content-security-policy-report-only': { value: csp },
  });
});

test('keeps the Sentry CSP report URI placeholder in source for apply.sh substitution', () => {
  assert.match(source, /report-uri __SENTRY_CSP_REPORT_URI__/);
});
