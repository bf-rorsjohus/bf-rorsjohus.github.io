import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPdf } from '../src/lib/viewer.ts';

test('isPdf accepts case and leading dot', () => {
  assert.equal(isPdf('pdf'), true);
  assert.equal(isPdf('.PDF'), true);
  assert.equal(isPdf('docx'), false);
});
