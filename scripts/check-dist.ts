// Post-build checks on dist/. Fails the build if any rule is broken.
//
// - No page references a JavaScript file (the site is meant to be script-free);
//   unreferenced JS that Astro emits anyway is deleted.
// - Every page has a <title>, a meta description and exactly one <h1>;
//   every indexable page has a canonical link.
// - Every <img> has an alt attribute.
// - Every internal link and file reference resolves to something in dist/.

import { readdir, readFile, rm, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const problems: string[] = [];

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function resolves(href: string): Promise<boolean> {
  const path = decodeURIComponent(href.split(/[?#]/)[0]!);
  if (path === '' || path === '/') return exists(join(DIST, 'index.html'));
  const target = join(DIST, path);
  if (path.endsWith('/')) return exists(join(target, 'index.html'));
  return (await exists(target)) || (await exists(join(target, 'index.html')));
}

async function main() {
  const files = await walk(DIST);
  const rel = (p: string) => p.slice(DIST.length);

  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  const allHtml = (await Promise.all(htmlFiles.map((f) => readFile(f, 'utf8')))).join('\n');

  // @astrojs/react always emits its client runtime, even when nothing hydrates.
  // Unreferenced scripts are never downloaded; remove them so the deploy stays clean.
  for (const file of files.filter((f) => ['.js', '.mjs'].includes(extname(f)))) {
    const name = file.split('/').pop()!;
    if (allHtml.includes(name)) {
      problems.push(
        `${rel(file)}: JavaScript referenced by a page; the site must ship no scripts.`,
      );
    } else {
      await rm(file);
      console.log(`check-dist: removed unreferenced ${rel(file)}`);
    }
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const page = rel(file);
    const isNotFound = page === '/404.html';

    if (/<script(?![^>]*type="application\/ld\+json")/i.test(html))
      problems.push(`${page}: contains a <script>.`);
    if (!/<title>[^<]+<\/title>/i.test(html)) problems.push(`${page}: missing <title>.`);
    if (!/<meta name="description" content="[^"]+"/i.test(html))
      problems.push(`${page}: missing meta description.`);
    if (!isNotFound && !/<link rel="canonical" href="https:\/\/[^"]+"/i.test(html)) {
      problems.push(`${page}: missing canonical link.`);
    }
    const h1s = html.match(/<h1[\s>]/gi)?.length ?? 0;
    if (h1s !== 1) problems.push(`${page}: has ${h1s} <h1> elements, expected 1.`);

    for (const img of html.match(/<img\b[^>]*>/gi) ?? []) {
      if (!/\salt="/i.test(img)) problems.push(`${page}: <img> without alt: ${img.slice(0, 80)}`);
    }

    const refs = [...html.matchAll(/\s(?:href|src)="(\/[^"]*)"/gi)].map((m) => m[1]!);
    for (const ref of new Set(refs)) {
      if (ref.startsWith('//')) continue;
      if (!(await resolves(ref))) problems.push(`${page}: broken internal link ${ref}`);
    }
  }

  if (problems.length) {
    console.error(`check-dist found ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`check-dist: ${files.length} files OK.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
