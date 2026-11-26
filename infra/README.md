# CloudFront and deployment IAM

- `cloudfront/index-rewrite.js` maps extensionless requests to prerendered `index.html` files and leaves requests for files unchanged.
- `cloudfront/security-headers.js` adds the response security headers, including a report-only CSP. `SENTRY_CSP_REPORT_URI` replaces the CSP report URI placeholder when the function is deployed.
- The distribution is on CloudFront's Free flat-rate plan, which does not support custom response headers policies. Security headers are attached with the `fjbatresv-security-headers` viewer-response CloudFront Function instead.
- `iam/gha-deploy-trust.json` and `iam/gha-deploy-policy.json` define the GitHub Actions OIDC role and its scoped deployment permissions.
- `apply.sh` creates or updates and publishes both CloudFront Functions, updates the distribution associations and custom error responses, and idempotently configures the deployment role. It requires `AWS_PROFILE` and `SENTRY_CSP_REPORT_URI`.

Review the distribution diff with `infra/apply.sh --dry-run` before applying with `infra/apply.sh`. To enforce CSP after review, change the top-level `CSP_HEADER` in `cloudfront/security-headers.js` from `content-security-policy-report-only` to `content-security-policy`, then run the apply script again.
