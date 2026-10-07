// Cleans Markdown exported from Google Docs before it reaches the site.
// The board is trusted, but we still never pass raw HTML or embedded images through.

/** Removes image syntax: inline images, reference images and their base64 definitions. */
export function removeImages(markdown: string): { text: string; removed: number } {
  let removed = 0;
  const count = () => {
    removed += 1;
    return '';
  };
  const text = markdown
    // Reference definitions Google uses for embedded images: [image1]: <data:image/png;base64,...>
    .replace(/^\s*\[[^\]]+\]:\s*<?data:image\/[^\s>]+>?\s*$/gm, '')
    // ![alt](url "title") and ![alt][ref]
    .replace(/!\[[^\]]*\]\([^)]*\)/g, count)
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, count);
  return { text, removed };
}

/** Removes raw HTML tags (keeps their text content) and HTML comments. */
export function stripHtml(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/g, '');
}

/** Collapses runs of 3+ blank lines and trims. */
export function tidy(markdown: string): string {
  return (
    markdown
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

export function cleanDocMarkdown(markdown: string): { markdown: string; imagesRemoved: number } {
  const { text, removed } = removeImages(markdown);
  return { markdown: tidy(stripHtml(text)), imagesRemoved: removed };
}

/** Plain text of the first real paragraph (not a heading, list or table), for summaries. */
export function firstParagraph(markdown: string, maxLength = 160): string {
  const blocks = markdown.split(/\n\s*\n/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|\||>|```)/.test(trimmed)) continue;
    const plain = trimmed
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]+/g, '')
      .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) continue;
    if (plain.length <= maxLength) return plain;
    const cut = plain.slice(0, maxLength);
    return cut.slice(0, Math.max(cut.lastIndexOf(' '), 40)).trimEnd() + '…';
  }
  return '';
}
