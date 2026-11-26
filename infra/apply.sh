#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true
: "${AWS_PROFILE:?Set AWS_PROFILE}"
: "${SENTRY_CSP_REPORT_URI:?Set SENTRY_CSP_REPORT_URI}"
AWS=(aws --profile "$AWS_PROFILE")
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

jq --arg report "$SENTRY_CSP_REPORT_URI" '.ResponseHeadersPolicyConfig | (.CustomHeadersConfig.Items[] | select(.Header == "Content-Security-Policy-Report-Only" or .Header == "Content-Security-Policy").Value) |= sub("__SENTRY_CSP_REPORT_URI__"; $report)' infra/cloudfront/security-headers-policy.json > "$TMP_DIR/headers.json"

DIST=$("${AWS[@]}" cloudfront get-distribution-config --id E2EV9RW3Q35Z60)
DIST_ETAG=$(jq -r '.ETag' <<< "$DIST")
jq --arg policy "$("${AWS[@]}" cloudfront list-response-headers-policies --type custom | jq -r '.ResponseHeadersPolicyList.Items[]? | select(.ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name == "fjbatresv-security-headers") | .ResponseHeadersPolicy.Id' | head -n1)" \
  '.DistributionConfig | .DefaultCacheBehavior.FunctionAssociations.Items = ((.DefaultCacheBehavior.FunctionAssociations.Items // []) | map(select(.EventType != "viewer-request"))) + [{"EventType":"viewer-request","FunctionARN":"arn:aws:cloudfront::605134457500:function/fjbatresv-index-rewrite"}] | .DefaultCacheBehavior.FunctionAssociations.Quantity = (.DefaultCacheBehavior.FunctionAssociations.Items | length) | if $policy != "" then .DefaultCacheBehavior.ResponseHeadersPolicyId = $policy else . end | .CustomErrorResponses.Items = ((.CustomErrorResponses.Items // []) | map(select(.ErrorCode != 403 and .ErrorCode != 404))) + [{"ErrorCode":403,"ResponsePagePath":"/404.html","ResponseCode":"404","ErrorCachingMinTTL":60},{"ErrorCode":404,"ResponsePagePath":"/404.html","ResponseCode":"404","ErrorCachingMinTTL":60}] | .CustomErrorResponses.Quantity = (.CustomErrorResponses.Items | length)' <<< "$DIST" > "$TMP_DIR/distribution.json"

if $DRY_RUN; then
  echo 'Proposed distribution configuration:'
  diff -u <(jq '.DistributionConfig' <<< "$DIST" | jq -S .) <(jq -S . "$TMP_DIR/distribution.json") || true
  cat <<'COMMANDS'
Planned writes:
  cloudfront create-function or update-function + publish-function: fjbatresv-index-rewrite
  cloudfront create-response-headers-policy or update-response-headers-policy: fjbatresv-security-headers
  iam create-role or update-assume-role-policy: fjbatresv-web-gha-deploy
  iam put-role-policy: fjbatresv-web-gha-deploy/deploy
  cloudfront update-distribution: E2EV9RW3Q35Z60
COMMANDS
  exit 0
fi

if "${AWS[@]}" cloudfront describe-function --name fjbatresv-index-rewrite > "$TMP_DIR/function.json" 2>/dev/null; then
  FUNCTION_ETAG=$(jq -r '.ETag' "$TMP_DIR/function.json")
  "${AWS[@]}" cloudfront update-function --name fjbatresv-index-rewrite --if-match "$FUNCTION_ETAG" --function-config 'Comment=Index rewrite for prerendered routes,Runtime=cloudfront-js-2.0' --function-code fileb://infra/cloudfront/index-rewrite.js > /dev/null
  FUNCTION_ETAG=$("${AWS[@]}" cloudfront describe-function --name fjbatresv-index-rewrite | jq -r '.ETag')
else
  "${AWS[@]}" cloudfront create-function --name fjbatresv-index-rewrite --function-config 'Comment=Index rewrite for prerendered routes,Runtime=cloudfront-js-2.0' --function-code fileb://infra/cloudfront/index-rewrite.js > "$TMP_DIR/function.json"
  FUNCTION_ETAG=$(jq -r '.ETag' "$TMP_DIR/function.json")
fi
"${AWS[@]}" cloudfront publish-function --name fjbatresv-index-rewrite --if-match "$FUNCTION_ETAG" > /dev/null

POLICY_ID=$("${AWS[@]}" cloudfront list-response-headers-policies --type custom | jq -r '.ResponseHeadersPolicyList.Items[]? | select(.ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name == "fjbatresv-security-headers") | .ResponseHeadersPolicy.Id' | head -n1)
if [[ -n "$POLICY_ID" ]]; then
  POLICY_ETAG=$("${AWS[@]}" cloudfront get-response-headers-policy-config --id "$POLICY_ID" | jq -r '.ETag')
  "${AWS[@]}" cloudfront update-response-headers-policy --id "$POLICY_ID" --if-match "$POLICY_ETAG" --response-headers-policy-config "file://$TMP_DIR/headers.json" > /dev/null
else
  POLICY_ID=$("${AWS[@]}" cloudfront create-response-headers-policy --response-headers-policy-config "file://$TMP_DIR/headers.json" | jq -r '.ResponseHeadersPolicy.Id')
fi

if "${AWS[@]}" iam get-role --role-name fjbatresv-web-gha-deploy > /dev/null 2>&1; then
  "${AWS[@]}" iam update-assume-role-policy --role-name fjbatresv-web-gha-deploy --policy-document file://infra/iam/gha-deploy-trust.json
else
  "${AWS[@]}" iam create-role --role-name fjbatresv-web-gha-deploy --assume-role-policy-document file://infra/iam/gha-deploy-trust.json > /dev/null
fi
"${AWS[@]}" iam put-role-policy --role-name fjbatresv-web-gha-deploy --policy-name deploy --policy-document file://infra/iam/gha-deploy-policy.json

jq --arg policy "$POLICY_ID" --arg function "arn:aws:cloudfront::605134457500:function/fjbatresv-index-rewrite" '.DefaultCacheBehavior.ResponseHeadersPolicyId = $policy | .DefaultCacheBehavior.FunctionAssociations.Items |= map(if .EventType == "viewer-request" then .FunctionARN = $function else . end)' "$TMP_DIR/distribution.json" > "$TMP_DIR/distribution-final.json"
"${AWS[@]}" cloudfront update-distribution --id E2EV9RW3Q35Z60 --if-match "$DIST_ETAG" --distribution-config "file://$TMP_DIR/distribution-final.json" > /dev/null
