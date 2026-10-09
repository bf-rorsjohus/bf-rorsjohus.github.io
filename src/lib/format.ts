// Small, dependency-free helpers shared by the build scripts and the site.

const TRANSLITERATE: Record<string, string> = {
  å: 'a',
  ä: 'a',
  ö: 'o',
  é: 'e',
  è: 'e',
  ü: 'u',
  æ: 'ae',
  ø: 'o',
};

/** "Vanliga frågor" → "vanliga-fragor", "Årsredovisning 2025" → "arsredovisning-2025". */
export function slugify(input: string): string {
  return input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[åäöéèüæø]/g, (ch) => TRANSLITERATE[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Splits "Årsredovisning 2025.pdf" into { base: "Årsredovisning 2025", ext: "pdf" }. */
export function splitExtension(fileName: string): { base: string; ext: string } {
  const match = /^(.*)\.([A-Za-z0-9]{1,5})$/.exec(fileName);
  if (!match) return { base: fileName, ext: '' };
  return { base: match[1]!, ext: match[2]!.toLowerCase() };
}

/** First plausible four-digit year (1850–2099) in a title, or null. */
export function yearFromTitle(title: string): number | null {
  const match = /(?:^|\D)(18[5-9]\d|19\d\d|20\d\d)(?:\D|$)/.exec(title);
  return match ? Number(match[1]) : null;
}

/** 2_154_000 → "2,1 MB" (Swedish decimal comma). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['kB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 ? Math.round(value).toString() : value.toFixed(1);
  return `${rounded.replace('.', ',')} ${units[unit]}`;
}

/** ISO date → "7 oktober 2026". */
export function formatSwedishDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Stockholm',
  }).format(date);
}

/** Swedish alphabetical comparison (å, ä, ö sort after z). */
export const swedishCollator = new Intl.Collator('sv-SE', { sensitivity: 'base', numeric: true });

/** Should this Drive item be skipped? Names starting with "_" are drafts. */
export function isDraft(name: string): boolean {
  return name.trimStart().startsWith('_');
}

/** Human-readable file type label for the document table. */
export function fileTypeLabel(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    ppt: 'PowerPoint',
    pptx: 'PowerPoint',
    txt: 'Text',
    jpg: 'Bild',
    jpeg: 'Bild',
    png: 'Bild',
  };
  return map[ext.toLowerCase()] ?? ext.toUpperCase();
}

/** Upper-cases the first letter (Swedish-aware), e.g. for image names typed in lower case. */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase('sv-SE') + text.slice(1);
}
