import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILE_SORTS, fileSortHref, sortFiles } from '../src/lib/file-sort.ts';
import type { DriveFile } from '../src/lib/drive-index.ts';

const file = (title: string, year: number | null, modifiedTime: string): DriveFile => ({
  title,
  slug: title,
  ext: 'pdf',
  url: `/dokument/${title}.pdf`,
  year,
  modifiedTime,
  size: 1,
});

const files = [
  file('Stadgar', null, '2024-12-30T00:00:00Z'),
  file('Årsredovisning 2025', 2025, '2026-03-01T00:00:00Z'),
  file('Energideklaration 2019', 2019, '2019-05-01T00:00:00Z'),
  file('Årsredovisning 2024', 2024, '2025-03-01T00:00:00Z'),
];
const titles = (key: string) =>
  sortFiles(
    files,
    FILE_SORTS.find((s) => s.key === key)!,
  ).map((f) => f.title);

test('default order is by name, Swedish alphabet (Å after Z)', () => {
  assert.equal(FILE_SORTS[0]!.key, '');
  assert.deepEqual(titles(''), [
    'Energideklaration 2019',
    'Stadgar',
    'Årsredovisning 2024',
    'Årsredovisning 2025',
  ]);
  assert.deepEqual(titles('namn-o-a'), titles('').reverse());
});

test('year orders use the year in the name, else the modified year', () => {
  assert.deepEqual(titles('nyast'), [
    'Årsredovisning 2025',
    'Årsredovisning 2024', // same year as Stadgar, changed later
    'Stadgar',
    'Energideklaration 2019',
  ]);
  assert.deepEqual(titles('aldst'), titles('nyast').reverse());
});

test('sort links point at /dokument/ and its sub-pages', () => {
  assert.deepEqual(FILE_SORTS.map(fileSortHref), [
    '/dokument/',
    '/dokument/namn-o-a/',
    '/dokument/nyast/',
    '/dokument/aldst/',
  ]);
});
