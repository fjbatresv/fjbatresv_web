import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('portfolio data keeps the eight production projects in the agreed order with both images', async () => {
  const source = await readFile(
    new URL('../src/app/sections/projects/projects.data.ts', import.meta.url),
    'utf8'
  );
  const ids = [...source.matchAll(/id: '(\w+)',[\s\S]*?url: 'https:\/\/([\w-]+)\.fjbatresv\.com'/g)];
  assert.deepEqual(
    ids.map(([, id, domain]) => [id, domain]),
    [
      ['sdg19', 'sdg19'],
      ['guso', 'guso'],
      ['sinergia', 'sinergia'],
      ['rockers', 'rockers'],
      ['pettzi', 'pettzi'],
      ['sar', 'sar'],
      ['migo', 'migo'],
      ['pdei', 'pdei'],
    ]
  );
  for (const [, id] of ids)
    for (const width of [640, 1280]) {
      await readFile(new URL(`../public/projects/${id}-${width}.webp`, import.meta.url));
    }
});
