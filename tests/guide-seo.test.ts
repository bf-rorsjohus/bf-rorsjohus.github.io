import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guideDescription } from '../src/lib/guide-seo.ts';

test('keeps a long enough summary as is', () => {
  const summary =
    'Regler för hur vi tar hand om huset och varandra, från tystnad till sophantering.';
  assert.equal(guideDescription('Ordningsregler', summary), summary);
});

test('adds context to a short summary', () => {
  assert.equal(
    guideDescription('Tvättstuga', 'Bokas mellan kl: 07-12'),
    'Bra att veta i BF Rörsjöhus, Föreningsgatan 43 i Malmö: Bokas mellan kl: 07-12',
  );
});

test('falls back to the title when there is no summary', () => {
  assert.equal(
    guideDescription('Tvättstuga', '  '),
    'Tvättstuga: bra att veta i BF Rörsjöhus, Föreningsgatan 43 i Malmö.',
  );
});
