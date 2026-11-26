#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true
: "${AWS_PROFILE:?Set AWS_PROFILE}"
: "${SENTRY_CSP_REPORT_URI:?Set SENTRY_CSP_REPORT_URI}"
AWS=(aws --profile "$AWS_PROFILE")
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

node - "$SENTRY_CSP_REPORT_URI" infra/cloudfront/security-headers.js "$TMP_DIR/security-headers.js" <<'NODE'
const fs = require('node:fs');
const [reportUri, sourcePath, outputPath] = process.argv.slice(2);
const source = fs.readFileSync(sourcePath, 'utf8');
fs.writeFileSync(outputPath, source.replaceAll('__SENTRY_CSP_REPORT_URI__', () => reportUri));
NODE

DIST=$("${AWS[@]}" cloudfront get-distribution-config --id E2EV9RW3Q35Z60)
DIST_ETAG=$(jq -r '.ETag' <<< "$DIST")
REWRITE_ARN=arn:aws:cloudfront::605134457500:function/fjbatresv-index-rewrite
SECURITY_HEADERS_ARN=arn:aws:cloudfront::605134457500:function/fjbatresv-security-headers
jq --arg rewrite "$REWRITE_ARN" --arg security_headers "$SECURITY_HEADERS_ARN" \
  '.DistributionConfig
   | .DefaultCacheBehavior.FunctionAssociations = {"Quantity":2,"Items":[{"EventType":"viewer-request","FunctionARN":$rewrite},{"EventType":"viewer-response","FunctionARN":$security_headers}]}
   | .CustomErrorResponses.Items = ((.CustomErrorResponses.Items // []) | map(select(.ErrorCode != 403 and .ErrorCode != 404))) + [{"ErrorCode":403,"ResponsePagePath":"/404.html","ResponseCode":"404","ErrorCachingMinTTL":60},{"ErrorCode":404,"ResponsePagePath":"/404.html","ResponseCode":"404","ErrorCachingMinTTL":60}]
   | .CustomErrorResponses.Quantity = (.CustomErrorResponses.Items | length)' \
  <<< "$DIST" > "$TMP_DIR/distribution.json"

if $DRY_RUN; then
  echo 'Proposed distribution configuration:'
  diff -u <(jq '.DistributionConfig' <<< "$DIST" | jq -S .) <(jq -S . "$TMP_DIR/distribution.json") || true
  cat <<'COMMANDS'
Planned writes:
  cloudfront create-function or update-function + publish-function: fjbatresv-index-rewrite
  cloudfront create-function or update-function + publish-function: fjbatresv-security-headers
  iam create-role or update-assume-role-policy: fjbatresv-web-gha-deploy
  iam put-role-policy: fjbatresv-web-gha-deploy/deploy
  cloudfront update-distribution: E2EV9RW3Q35Z60
COMMANDS
  exit 0
fi

publish_function() {
  local name="$1" comment="$2" code="$3" function_etag function_json
  function_json="$TMP_DIR/$name.json"
  if "${AWS[@]}" cloudfront describe-function --name "$name" > "$function_json" 2>/dev/null; then
    function_etag=$(jq -r '.ETag' "$function_json")
    "${AWS[@]}" cloudfront update-function --name "$name" --if-match "$function_etag" \
      --function-config "Comment=$comment,Runtime=cloudfront-js-2.0" \
      --function-code "fileb://$code" > /dev/null
    function_etag=$("${AWS[@]}" cloudfront describe-function --name "$name" | jq -r '.ETag')
  else
    "${AWS[@]}" cloudfront create-function --name "$name" \
      --function-config "Comment=$comment,Runtime=cloudfront-js-2.0" \
      --function-code "fileb://$code" > "$function_json"
    function_etag=$(jq -r '.ETag' "$function_json")
  fi
  "${AWS[@]}" cloudfront publish-function --name "$name" --if-match "$function_etag" > /dev/null
}

publish_function fjbatresv-index-rewrite 'Index rewrite for prerendered routes' infra/cloudfront/index-rewrite.js
publish_function fjbatresv-security-headers 'Security response headers' "$TMP_DIR/security-headers.js"

if "${AWS[@]}" iam get-role --role-name fjbatresv-web-gha-deploy > /dev/null 2>&1; then
  "${AWS[@]}" iam update-assume-role-policy --role-name fjbatresv-web-gha-deploy --policy-document file://infra/iam/gha-deploy-trust.json
else
  "${AWS[@]}" iam create-role --role-name fjbatresv-web-gha-deploy --assume-role-policy-document file://infra/iam/gha-deploy-trust.json > /dev/null
fi
"${AWS[@]}" iam put-role-policy --role-name fjbatresv-web-gha-deploy --policy-name deploy --policy-document file://infra/iam/gha-deploy-policy.json

"${AWS[@]}" cloudfront update-distribution --id E2EV9RW3Q35Z60 --if-match "$DIST_ETAG" \
  --distribution-config "file://$TMP_DIR/distribution.json" > /dev/null
