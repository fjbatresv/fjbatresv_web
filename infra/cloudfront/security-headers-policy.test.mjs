import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const document = JSON.parse(
  await readFile(new URL('./security-headers-policy.json', import.meta.url), 'utf8')
);
const policy = document.ResponseHeadersPolicyConfig;

test('response headers policy has its required quantity and root configuration shape', () => {
  assert.equal(policy.CustomHeadersConfig.Quantity, policy.CustomHeadersConfig.Items.length);
  assert.equal(policy.Name, 'fjbatresv-security-headers');
  assert.equal('ResponseHeadersPolicyConfig' in policy, false);
});
