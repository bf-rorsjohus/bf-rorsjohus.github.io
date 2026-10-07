import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanDocMarkdown, firstParagraph } from '../src/lib/markdown.ts';

test('removes embedded images and their base64 definitions', () => {
  const input =
    'Text\n\n![][image1]\n\n![bild](https://example.com/a.png)\n\n[image1]: <data:image/png;base64,AAAA>\n';
  const { markdown, imagesRemoved } = cleanDocMarkdown(input);
  assert.equal(imagesRemoved, 2);
  assert.equal(markdown, 'Text\n');
});

test('strips raw HTML but keeps text', () => {
  const { markdown } = cleanDocMarkdown(
    'Hej <span style="color:red">där</span><script>x</script>\n',
  );
  assert.equal(markdown, 'Hej därx\n');
});

test('firstParagraph skips headings and lists and removes formatting', () => {
  const md = '## Rubrik\n\n- punkt\n\n**Viktigt:** läs [stadgarna](/dokument/stadgar.pdf) först.\n';
  assert.equal(firstParagraph(md), 'Viktigt: läs stadgarna först.');
});
