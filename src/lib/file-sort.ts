// Sort orders for the Dokument page. Each order is a separate pre-rendered page, so sorting
// works without any JavaScript: the sort links are ordinary links.
import type { DriveFile } from './drive-index.ts';
import { swedishCollator } from './format.ts';

export type FileSort = {
  key: string; // URL segment; '' is the default page /dokument/
  label: string; // link text
  caption: string; // completes "Dokument, sorterade …"
  compare: (a: DriveFile, b: DriveFile) => number;
};

/** Year shown in the table: from the name, else the year the file was last changed. */
export const fileYear = (f: DriveFile) => f.year ?? new Date(f.modifiedTime).getFullYear();

const byName = (a: DriveFile, b: DriveFile) => swedishCollator.compare(a.title, b.title);

export const FILE_SORTS: readonly FileSort[] = [
  { key: '', label: 'Namn A–Ö', caption: 'efter namn, A till Ö', compare: byName },
  {
    key: 'namn-o-a',
    label: 'Namn Ö–A',
    caption: 'efter namn, Ö till A',
    compare: (a, b) => byName(b, a),
  },
  {
    key: 'nyast',
    label: 'Nyast först',
    caption: 'efter år, nyast först',
    compare: (a, b) =>
      fileYear(b) - fileYear(a) || b.modifiedTime.localeCompare(a.modifiedTime) || byName(a, b),
  },
  {
    key: 'aldst',
    label: 'Äldst först',
    caption: 'efter år, äldst först',
    compare: (a, b) =>
      fileYear(a) - fileYear(b) || a.modifiedTime.localeCompare(b.modifiedTime) || byName(a, b),
  },
];

export const fileSortHref = (sort: FileSort) =>
  sort.key ? `/dokument/${sort.key}/` : '/dokument/';

export const sortFiles = (files: readonly DriveFile[], sort: FileSort) =>
  [...files].sort(sort.compare);
