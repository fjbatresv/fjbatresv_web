// Report-Only ignores upgrade-insecure-requests; add it when enforcing CSP.
var CSP_HEADER = 'content-security-policy-report-only';
var CSP_VALUE = "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; report-uri __SENTRY_CSP_REPORT_URI__";

function handler(event) {
  var response = event.response;
  var headers = response.headers;

  headers['strict-transport-security'] = { value: 'max-age=31536000' };
  headers['x-content-type-options'] = { value: 'nosniff' };
  headers['x-frame-options'] = { value: 'DENY' };
  headers['referrer-policy'] = { value: 'strict-origin-when-cross-origin' };
  headers['permissions-policy'] = {
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  };
  headers[CSP_HEADER] = { value: CSP_VALUE };

  return response;
}
