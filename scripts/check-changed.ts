// Compares the freshly synced Drive manifest with the one on the live site.
//
// - Writes `changed=true|false` to $GITHUB_OUTPUT (scheduled runs skip deploy when false).
// - Fails if the new content has shrunk to less than half of what is live (a folder
//   unshared or renamed by mistake), unless ALLOW_SHRINK=true.
//
// Usage: node scripts/check-changed.ts   (after npm run sync)

import { readFile, appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DriveManifest } from '../src/lib/drive-index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = process.env.SITE_URL ?? 'https://bf-rorsjohus.github.io';

const total = (m: DriveManifest) => m.counts.files + m.counts.images + m.counts.pages;
const fingerprint = (m: DriveManifest) =>
  JSON.stringify(m.items.map((i) => [i.kind, i.id, i.name, i.modifiedTime]));

async function output(changed: boolean) {
  console.log(`changed=${changed}`);
  if (process.env.GITHUB_OUTPUT)
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
}

async function main() {
  const local = JSON.parse(
    await readFile(join(ROOT, 'public/_drive-manifest.json'), 'utf8'),
  ) as DriveManifest;

  let live: DriveManifest | null = null;
  try {
    const response = await fetch(`${SITE_URL}/_drive-manifest.json`, { cache: 'no-store' });
    if (response.ok) live = (await response.json()) as DriveManifest;
    else console.log(`No live manifest (HTTP ${response.status}); treating as changed.`);
  } catch (error) {
    console.log(`Could not fetch live manifest (${String(error)}); treating as changed.`);
  }

  if (!live) return output(true);

  if (total(local) < total(live) / 2 && process.env.ALLOW_SHRINK !== 'true') {
    throw new Error(
      `Content shrank from ${total(live)} to ${total(local)} items. Is Hemsida still shared with the ` +
        'service account, and are the subfolders still named filer, bilder and bra_att_veta? ' +
        'If the removal is intended, run the workflow manually with "allow shrink".',
    );
  }

  await output(fingerprint(local) !== fingerprint(live));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
