import assert from 'node:assert/strict';

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
const meta = (html, name, value) => {
  const tag = html.match(/<meta\b[^>]*>/gi)?.find((item) => attr(item, name) === value);
  return tag && attr(tag, 'content');
};

export function assertIndexableSeo(html, path) {
  assert.equal(meta(html, 'name', 'robots'), undefined, `${path}: indexable page has noindex`);
  assert.ok(meta(html, 'property', 'og:image:alt'), `${path}: og:image:alt missing`);
  assert.ok(meta(html, 'name', 'twitter:image'), `${path}: twitter:image missing`);
  const title = (html.match(/<title>(.*?)<\/title>/i)?.[1] ?? '').replaceAll('&amp;', '&');
  assert.ok(title.length <= 60, `${path}: title longer than 60 characters`);
}

export function assertNotFoundSeo(html) {
  assert.equal(meta(html, 'name', 'robots'), 'noindex', '404: noindex missing');
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  assert.ok(!links.some((tag) => attr(tag, 'rel') === 'canonical'), '404: canonical present');
  assert.ok(
    !links.some((tag) => attr(tag, 'rel') === 'alternate' && attr(tag, 'hreflang')),
    '404: hreflang present'
  );
}
