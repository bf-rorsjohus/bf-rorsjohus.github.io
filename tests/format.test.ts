import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  splitExtension,
  yearFromTitle,
  formatFileSize,
  isDraft,
  capitalizeFirst,
} from '../src/lib/format.ts';

test('slugify handles Swedish letters and punctuation', () => {
  assert.equal(slugify('Vanliga frågor'), 'vanliga-fragor');
  assert.equal(slugify('Årsredovisning 2025'), 'arsredovisning-2025');
  assert.equal(slugify('Tvättstuga'), 'tvattstuga');
  assert.equal(slugify('Stadgar (registrerade 2024-12-30)'), 'stadgar-registrerade-2024-12-30');
  assert.equal(slugify('  Hörnfasaden mot Föreningsgatan!  '), 'hornfasaden-mot-foreningsgatan');
});

test('splitExtension separates the file type', () => {
  assert.deepEqual(splitExtension('Årsredovisning 2025.pdf'), {
    base: 'Årsredovisning 2025',
    ext: 'pdf',
  });
  assert.deepEqual(splitExtension('Bild.JPG'), { base: 'Bild', ext: 'jpg' });
  assert.deepEqual(splitExtension('Utan filändelse'), { base: 'Utan filändelse', ext: '' });
});

test('yearFromTitle finds a plausible year', () => {
  assert.equal(yearFromTitle('Årsredovisning 2025'), 2025);
  assert.equal(yearFromTitle('Stadgar (registrerade 2024-12-30)'), 2024);
  assert.equal(yearFromTitle('Energideklaration 2019'), 2019);
  assert.equal(yearFromTitle('Stadgar'), null);
  assert.equal(yearFromTitle('Kundnummer 18470'), null);
});

test('formatFileSize uses Swedish decimals', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2_200_000), '2,1 MB');
  assert.equal(formatFileSize(15_000_000), '14 MB');
});

test('isDraft recognises the underscore rule', () => {
  assert.equal(isDraft('_Utkast budget 2027.pdf'), true);
  assert.equal(isDraft('Budget 2027.pdf'), false);
});

test('capitalizeFirst upper-cases the first letter only', () => {
  assert.equal(capitalizeFirst('innergården med tornen'), 'Innergården med tornen');
  assert.equal(capitalizeFirst('Ålderdom'), 'Ålderdom');
  assert.equal(capitalizeFirst('åtgärd'), 'Åtgärd');
  assert.equal(capitalizeFirst(''), '');
});
