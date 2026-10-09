// Pure helpers for the lightbox viewer (no DOM, no Astro).

/** Whether the browser's own viewer can show this file type inside the lightbox. */
export function isPdf(ext: string): boolean {
  return ext.toLowerCase().replace(/^\./, '') === 'pdf';
}
