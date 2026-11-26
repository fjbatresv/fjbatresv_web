import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const styles = readFileSync(new URL('../src/styles.scss', import.meta.url), 'utf8');
const lightTheme = styles.match(/body\.theme-light\s*\{([^}]+)\}/)?.[1] ?? '';
const color = (name) => lightTheme.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, 'i'))?.[1];
const luminance = (hex) => {
  const fullHex =
    hex.length === 4 ? `#${[...hex.slice(1)].map((value) => value.repeat(2)).join('')}` : hex;
  const channels = fullHex.match(/[0-9a-f]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
};

test('light theme accent text meets WCAG AA on page and card backgrounds', () => {
  const foreground = luminance(color('color-accent-strong'));
  for (const backgroundColor of ['color-bg', 'color-surface']) {
    const background = luminance(color(backgroundColor));
    assert.ok((background + 0.05) / (foreground + 0.05) >= 4.5);
  }
});
