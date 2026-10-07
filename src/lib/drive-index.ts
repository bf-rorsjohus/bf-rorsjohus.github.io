// Shape of src/data/generated/drive.json, written by scripts/sync-drive.ts.
// Kept free of Astro imports so the Node build scripts can import the types.

export type DriveFile = {
  title: string; // file name without extension, shown in the table
  slug: string;
  ext: string;
  url: string; // e.g. /dokument/arsredovisning-2025.pdf
  year: number | null;
  modifiedTime: string;
  size: number;
};

export type DriveImage = {
  title: string; // caption and alt text
  fileName: string; // file in src/assets/drive/bilder/
  isStart: boolean;
};

export type DrivePage = {
  title: string;
  slug: string;
  summary: string;
  modifiedTime: string;
};

export type DriveIndex = {
  generatedAt: string;
  source: 'drive' | 'fixtures';
  startsida: { summary: string; modifiedTime: string } | null;
  files: DriveFile[];
  images: DriveImage[];
  pages: DrivePage[];
  warnings: string[];
};

/** Minimal manifest published at /_drive-manifest.json and used for the change check. */
export type DriveManifest = {
  generatedAt: string;
  counts: { files: number; images: number; pages: number };
  items: {
    kind: 'startsida' | 'file' | 'image' | 'page';
    id: string;
    name: string;
    modifiedTime: string;
  }[];
};
