# CloudFront and deployment IAM

- `cloudfront/index-rewrite.js` maps extensionless requests to prerendered `index.html` files and leaves requests for files unchanged.
- `cloudfront/security-headers-policy.json` defines the report-only CSP and response headers. `SENTRY_CSP_REPORT_URI` fills the report endpoint placeholder.
- `iam/gha-deploy-trust.json` and `iam/gha-deploy-policy.json` define the GitHub Actions OIDC role and its scoped deployment permissions.
- `apply.sh` creates or updates the function, policy, role, and distribution attachments. It requires `AWS_PROFILE` and `SENTRY_CSP_REPORT_URI`.

Rollout order: deploy the static build, run `infra/apply.sh --dry-run` and review its distribution diff, run `infra/apply.sh`, verify deep links and headers, then invalidate the CloudFront distribution. To enforce CSP after review, rename `Content-Security-Policy-Report-Only` to `Content-Security-Policy` in the policy JSON and run the apply script again.
