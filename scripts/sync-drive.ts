// Reads the private Google Drive folder "Hemsida" and turns it into site content.
//
//   Hemsida/
//     startsida/       (one Google Doc, one image)
//                      Doc   -> src/content/startsida/startsida.md
//                      image -> src/assets/drive/startsida/<file>
//     filer/                         -> public/dokument/<slug>.<ext>
//     bilder/                        -> src/assets/drive/bilder/<file>
//     bra_att_veta/    (Google Docs) -> src/content/bra-att-veta/<slug>.md
//
// Plus src/data/generated/drive.json (index for the site) and public/_drive-manifest.json
// (used by scripts/check-changed.ts).
//
// Usage:
//   GOOGLE_ACCESS_TOKEN=... DRIVE_HEMSIDA_FOLDER_ID=... node scripts/sync-drive.ts
//   node scripts/sync-drive.ts --fixtures      (offline: uses src/data/fixtures/)
//
// Items whose name starts with "_" are drafts and are skipped.

import { mkdir, readdir, readFile, rm, stat, writeFile, appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  slugify,
  splitExtension,
  yearFromTitle,
  isDraft,
  swedishCollator,
} from '../src/lib/format.ts';
import { cleanDocMarkdown, firstParagraph } from '../src/lib/markdown.ts';
import type {
  DriveIndex,
  DriveFile,
  DriveImage,
  DrivePage,
  DriveManifest,
} from '../src/lib/drive-index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = {
  files: join(ROOT, 'public/dokument'),
  images: join(ROOT, 'src/assets/drive/bilder'),
  startsida: join(ROOT, 'src/content/startsida'),
  startImage: join(ROOT, 'src/assets/drive/startsida'),
  pages: join(ROOT, 'src/content/bra-att-veta'),
  index: join(ROOT, 'src/data/generated/drive.json'),
  manifest: join(ROOT, 'public/_drive-manifest.json'),
};
const FIXTURES = join(ROOT, 'src/data/fixtures');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DOC_MIME = 'application/vnd.google-apps.document';
const GOOGLE_PREFIX = 'application/vnd.google-apps.';
const EXPORTABLE_TO_PDF = new Set([
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
]);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const WORD_EXTENSIONS = new Set(['docx', 'doc', 'odt', 'rtf']);
const SUBFOLDERS = {
  start: 'startsida',
  files: 'filer',
  images: 'bilder',
  pages: 'bra_att_veta',
} as const;

type Item = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
};

type Source = {
  kind: 'drive' | 'fixtures';
  listRoot(): Promise<Item[]>;
  list(folder: Item): Promise<Item[]>;
  download(item: Item): Promise<Buffer>;
  exportAs(item: Item, mimeType: 'text/markdown' | 'application/pdf'): Promise<Buffer>;
};

/** Uploaded Word (or similar) files are not Google Docs and cannot be read as text. */
const isWordFile = (item: Item) => WORD_EXTENSIONS.has(splitExtension(item.name).ext);
const convertHint = (where: string, item: Item) =>
  `${where}/${item.name} is a Word file, not a Google Doc. In Drive: right-click it, ` +
  `Open with → Google Docs, then delete the Word file.`;

const warnings: string[] = [];
const warn = (message: string) => {
  warnings.push(message);
  console.warn(`warning: ${message}`);
};

// ---------------------------------------------------------------------------
// Google Drive source (authenticated with a short-lived OAuth access token)
// ---------------------------------------------------------------------------

function driveSource(token: string, rootId: string): Source {
  const api = 'https://www.googleapis.com/drive/v3/files';

  async function request(url: string): Promise<Response> {
    for (let attempt = 1; ; attempt++) {
      let response: Response | undefined;
      try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        if (attempt >= 3) throw new Error(`Network error for ${url}: ${String(error)}`);
      }
      if (response?.ok) return response;
      const retryable = !response || response.status === 429 || response.status >= 500;
      if (!retryable || attempt >= 3) {
        const body = response ? await response.text() : '';
        throw new Error(
          `Drive API ${response?.status ?? 'error'} for ${url}\n${body.slice(0, 500)}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }

  async function listChildren(folderId: string): Promise<Item[]> {
    const items: Item[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
        pageSize: '1000',
        supportsAllDrives: 'true',
        includeItemsFromAllDrives: 'true',
      });
      if (pageToken) params.set('pageToken', pageToken);
      const data = (await (await request(`${api}?${params}`)).json()) as {
        nextPageToken?: string;
        files: {
          id: string;
          name: string;
          mimeType: string;
          size?: string;
          modifiedTime: string;
        }[];
      };
      for (const f of data.files) {
        items.push({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          size: Number(f.size ?? 0),
          modifiedTime: f.modifiedTime,
        });
      }
      pageToken = data.nextPageToken;
    } while (pageToken);
    return items;
  }

  return {
    kind: 'drive',
    listRoot: () => listChildren(rootId),
    list: (folder) => listChildren(folder.id),
    download: async (item) =>
      Buffer.from(
        await (await request(`${api}/${item.id}?alt=media&supportsAllDrives=true`)).arrayBuffer(),
      ),
    exportAs: async (item, mimeType) =>
      Buffer.from(
        await (
          await request(`${api}/${item.id}/export?mimeType=${encodeURIComponent(mimeType)}`)
        ).arrayBuffer(),
      ),
  };
}

// ---------------------------------------------------------------------------
// Fixture source (offline development and pull-request CI)
// Fixture "Docs" are .md files; their name without .md is the Doc name.
// ---------------------------------------------------------------------------

function fixtureSource(): Source {
  async function itemsIn(dir: string): Promise<Item[]> {
    const names = await readdir(dir).catch(() => [] as string[]);
    const items: Item[] = [];
    for (const name of names) {
      if (name.startsWith('.')) continue;
      const path = join(dir, name);
      const info = await stat(path);
      const isMarkdown = name.endsWith('.md');
      items.push({
        id: path,
        name: info.isDirectory() ? name : isMarkdown ? name.slice(0, -3) : name,
        mimeType: info.isDirectory()
          ? FOLDER_MIME
          : isMarkdown
            ? DOC_MIME
            : 'application/octet-stream',
        size: info.size,
        modifiedTime: info.mtime.toISOString(),
      });
    }
    return items;
  }
  return {
    kind: 'fixtures',
    listRoot: () => itemsIn(FIXTURES),
    list: (folder) => itemsIn(folder.id),
    download: (item) => readFile(item.id),
    exportAs: async (item, mimeType) => {
      if (mimeType === 'text/markdown') return readFile(item.id);
      throw new Error(`Fixtures cannot export ${item.name} to ${mimeType}`);
    },
  };
}

// ---------------------------------------------------------------------------
// Processing
// ---------------------------------------------------------------------------

async function resetOutputs() {
  for (const dir of [
    OUT.files,
    OUT.images,
    OUT.startsida,
    OUT.startImage,
    OUT.pages,
    dirname(OUT.index),
  ]) {
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
  }
}

function yamlString(value: string): string {
  return JSON.stringify(value); // JSON strings are valid YAML scalars
}

function uniqueSlug(slug: string, used: Set<string>, what: string): string {
  if (!slug) throw new Error(`${what} has a name that gives an empty address. Rename it.`);
  if (used.has(slug))
    throw new Error(`Two items in ${what} get the same address "${slug}". Rename one of them.`);
  used.add(slug);
  return slug;
}

async function main() {
  const useFixtures = process.argv.includes('--fixtures');
  const token = process.env.GOOGLE_ACCESS_TOKEN;
  const rootId = process.env.DRIVE_HEMSIDA_FOLDER_ID;

  let source: Source;
  if (useFixtures) {
    source = fixtureSource();
  } else if (token && rootId) {
    source = driveSource(token, rootId);
  } else {
    throw new Error(
      'GOOGLE_ACCESS_TOKEN and DRIVE_HEMSIDA_FOLDER_ID must be set. For offline work, run: npm run sync:fixtures',
    );
  }

  console.log(`Syncing from ${source.kind === 'drive' ? 'Google Drive' : 'fixtures'}…`);
  const root = await source.listRoot();
  await resetOutputs();

  const index: DriveIndex = {
    generatedAt: new Date().toISOString(),
    source: source.kind,
    startsida: null,
    files: [],
    images: [],
    pages: [],
    warnings,
  };
  const manifest: DriveManifest = {
    generatedAt: index.generatedAt,
    counts: { files: 0, images: 0, pages: 0 },
    items: [],
  };

  const findFolder = (name: string) =>
    root.find((i) => i.mimeType === FOLDER_MIME && i.name === name);
  const known = new Set<string>(Object.values(SUBFOLDERS));
  for (const item of root) {
    if (!known.has(item.name) && !isDraft(item.name)) {
      warn(
        `"${item.name}" in Hemsida is not used. Only the folders startsida, filer, bilder and bra_att_veta are read.`,
      );
    }
  }

  // --- startsida --------------------------------------------------------------
  // One Google Doc (the welcome text) and one image, both with any name.
  const startFolder = findFolder(SUBFOLDERS.start);
  if (!startFolder) throw new Error(`The folder "${SUBFOLDERS.start}" is missing from Hemsida.`);
  {
    const items = (await source.list(startFolder))
      .filter((i) => !isDraft(i.name))
      .sort((a, b) => swedishCollator.compare(a.name, b.name));
    const docs = items.filter((i) => i.mimeType === DOC_MIME);
    const images = items.filter((i) => IMAGE_EXTENSIONS.has(splitExtension(i.name).ext));
    for (const item of items) {
      if (docs.includes(item) || images.includes(item)) continue;
      warn(
        isWordFile(item)
          ? convertHint('startsida', item)
          : `startsida/${item.name}: not used. Only one Google Doc and one image (JPEG, PNG, WebP) are read.`,
      );
    }

    const startDoc = docs[0];
    if (!startDoc) {
      throw new Error(
        'There is no Google Doc in Hemsida/startsida. Create one with the welcome text' +
          (items.some(isWordFile) ? ' (a Word file is there: open it with Google Docs).' : '.'),
      );
    }
    if (docs.length > 1)
      warn(`startsida: ${docs.length} Google Docs found; using "${startDoc.name}". Keep only one.`);
    const raw = (await source.exportAs(startDoc, 'text/markdown')).toString('utf8');
    const { markdown, imagesRemoved } = cleanDocMarkdown(raw);
    if (imagesRemoved)
      warn(
        `startsida/${startDoc.name}: ${imagesRemoved} image(s) in the Doc removed. Put the image in the startsida folder instead.`,
      );
    await writeFile(join(OUT.startsida, 'startsida.md'), markdown);
    manifest.items.push({
      kind: 'startsida',
      id: startDoc.id,
      name: startDoc.name,
      modifiedTime: startDoc.modifiedTime,
    });

    let image: string | null = null;
    const startImage = images[0];
    if (startImage) {
      if (images.length > 1)
        warn(
          `startsida: ${images.length} images found; using "${startImage.name}". Keep only one.`,
        );
      const { base, ext } = splitExtension(startImage.name);
      image = `${slugify(base) || 'startbild'}.${ext}`;
      await writeFile(join(OUT.startImage, image), await source.download(startImage));
      manifest.items.push({
        kind: 'startbild',
        id: startImage.id,
        name: startImage.name,
        modifiedTime: startImage.modifiedTime,
      });
    } else {
      warn('startsida: no image found; the start page is shown without one.');
    }

    index.startsida = {
      summary: firstParagraph(markdown),
      modifiedTime: startDoc.modifiedTime,
      image,
    };
  }

  // --- filer ----------------------------------------------------------------
  const filesFolder = findFolder(SUBFOLDERS.files);
  if (!filesFolder) throw new Error(`The folder "${SUBFOLDERS.files}" is missing from Hemsida.`);
  {
    const used = new Set<string>();
    for (const item of await source.list(filesFolder)) {
      if (isDraft(item.name)) continue;
      if (item.mimeType === FOLDER_MIME) {
        warn(`filer/${item.name}: subfolders are not shown. Move the files directly into filer.`);
        continue;
      }
      let title: string;
      let ext: string;
      let content: Buffer;
      if (EXPORTABLE_TO_PDF.has(item.mimeType)) {
        title = item.name;
        ext = 'pdf';
        content = await source.exportAs(item, 'application/pdf');
      } else if (item.mimeType.startsWith(GOOGLE_PREFIX)) {
        warn(`filer/${item.name}: this kind of Google file cannot be published. Save it as PDF.`);
        continue;
      } else {
        ({ base: title, ext } = splitExtension(item.name));
        if (!ext) {
          warn(`filer/${item.name}: no file extension, skipped. Name it e.g. "${item.name}.pdf".`);
          continue;
        }
        content = await source.download(item);
      }
      const slug = uniqueSlug(slugify(title), used, 'filer');
      const fileName = `${slug}.${ext}`;
      await writeFile(join(OUT.files, fileName), content);
      const file: DriveFile = {
        title,
        slug,
        ext,
        url: `/dokument/${fileName}`,
        year: yearFromTitle(title),
        modifiedTime: item.modifiedTime,
        size: content.length,
      };
      index.files.push(file);
      manifest.items.push({
        kind: 'file',
        id: item.id,
        name: item.name,
        modifiedTime: item.modifiedTime,
      });
    }
    // Newest first: by year in the name, then by modified date, then by title.
    index.files.sort(
      (a, b) =>
        (b.year ?? 0) - (a.year ?? 0) ||
        b.modifiedTime.localeCompare(a.modifiedTime) ||
        swedishCollator.compare(a.title, b.title),
    );
  }

  // --- bilder ---------------------------------------------------------------
  const imagesFolder = findFolder(SUBFOLDERS.images);
  if (!imagesFolder) throw new Error(`The folder "${SUBFOLDERS.images}" is missing from Hemsida.`);
  {
    const used = new Set<string>();
    for (const item of await source.list(imagesFolder)) {
      if (isDraft(item.name)) continue;
      const { base, ext } = splitExtension(item.name);
      if (!IMAGE_EXTENSIONS.has(ext)) {
        warn(`bilder/${item.name}: only JPEG, PNG and WebP images are shown.`);
        continue;
      }
      const slug = uniqueSlug(slugify(base), used, 'bilder');
      const fileName = `${slug}.${ext}`;
      await writeFile(join(OUT.images, fileName), await source.download(item));
      const image: DriveImage = { title: base, fileName };
      index.images.push(image);
      manifest.items.push({
        kind: 'image',
        id: item.id,
        name: item.name,
        modifiedTime: item.modifiedTime,
      });
    }
    index.images.sort((a, b) => swedishCollator.compare(a.title, b.title));
  }

  // --- bra_att_veta -----------------------------------------------------------
  const pagesFolder = findFolder(SUBFOLDERS.pages);
  if (!pagesFolder) throw new Error(`The folder "${SUBFOLDERS.pages}" is missing from Hemsida.`);
  {
    const used = new Set<string>();
    for (const item of await source.list(pagesFolder)) {
      if (isDraft(item.name)) continue;
      if (item.mimeType !== DOC_MIME) {
        warn(
          isWordFile(item)
            ? convertHint('bra_att_veta', item)
            : `bra_att_veta/${item.name}: only Google Docs become pages. Put files in filer.`,
        );
        continue;
      }
      const title = item.name.trim();
      const slug = uniqueSlug(slugify(title), used, 'bra_att_veta');
      const raw = (await source.exportAs(item, 'text/markdown')).toString('utf8');
      const { markdown, imagesRemoved } = cleanDocMarkdown(raw);
      if (imagesRemoved)
        warn(
          `bra_att_veta/${title}: ${imagesRemoved} image(s) removed. Put images in bilder instead.`,
        );
      const summary = firstParagraph(markdown);
      const frontmatter = `---\ntitle: ${yamlString(title)}\nsummary: ${yamlString(summary)}\nmodifiedTime: ${yamlString(item.modifiedTime)}\n---\n\n`;
      await writeFile(join(OUT.pages, `${slug}.md`), frontmatter + markdown);
      const page: DrivePage = { title, slug, summary, modifiedTime: item.modifiedTime };
      index.pages.push(page);
      manifest.items.push({
        kind: 'page',
        id: item.id,
        name: item.name,
        modifiedTime: item.modifiedTime,
      });
    }
    index.pages.sort((a, b) => swedishCollator.compare(a.title, b.title));
  }

  // --- Sanity checks and output -------------------------------------------------
  manifest.counts = {
    files: index.files.length,
    images: index.images.length,
    pages: index.pages.length,
  };
  if (manifest.counts.files + manifest.counts.images + manifest.counts.pages === 0) {
    throw new Error(
      'Hemsida is empty: no files, images or pages found. Refusing to publish an empty site.',
    );
  }
  manifest.items.sort((a, b) => a.id.localeCompare(b.id));

  await writeFile(OUT.index, JSON.stringify(index, null, 2) + '\n');
  await writeFile(OUT.manifest, JSON.stringify(manifest, null, 2) + '\n');

  const summary = [
    `### Innehåll från ${source.kind === 'drive' ? 'Google Drive' : 'fixtures'}`,
    '',
    `- Dokument: ${index.files.length}`,
    `- Bilder: ${index.images.length}`,
    `- Bra att veta-sidor: ${index.pages.length}`,
    '',
    ...(warnings.length
      ? ['**Varningar**', '', ...warnings.map((w) => `- ${w}`)]
      : ['Inga varningar.']),
    '',
  ].join('\n');
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
