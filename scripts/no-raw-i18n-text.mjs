import assert from 'node:assert/strict';
import { parse } from 'parse5';

const rawTranslationKey =
  /^(hero|projects|nav|experience|verde|contact|howIWork|a11y|footer)\.[a-zA-Z.]+$/;

export function assertNoRawI18nText(html, label = 'HTML') {
  const visit = (node) => {
    if (node.nodeName === '#text') {
      const text = node.value.trim();
      assert.ok(!rawTranslationKey.test(text), `${label}: raw translation key in text: ${text}`);
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(parse(html));
}
