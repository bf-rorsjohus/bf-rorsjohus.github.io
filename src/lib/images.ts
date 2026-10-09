// Turns the synced images into responsive <img> data at build time (no client JS).
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { driveIndex } from './content';
import { capitalizeFirst } from './format';

const modules = import.meta.glob<ImageMetadata>(
  '/src/assets/drive/{bilder,startsida}/*.{png,jpg,jpeg,webp}',
  { eager: true, import: 'default' },
);

export type ResponsiveImage = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
  fullSrc: string; // capped full-size version for "open image"
};

const WIDTHS = [480, 800, 1200, 1600];
const FULL_MAX = 2400;

type Folder = 'bilder' | 'startsida';

function metadataFor(folder: Folder, fileName: string): ImageMetadata {
  const meta = modules[`/src/assets/drive/${folder}/${fileName}`];
  if (!meta)
    throw new Error(`Image ${folder}/${fileName} listed in drive.json but not found on disk.`);
  return meta;
}

async function toResponsive(
  folder: Folder,
  fileName: string,
  alt: string,
  sizes: string,
): Promise<ResponsiveImage> {
  const meta = metadataFor(folder, fileName);
  const widths = WIDTHS.filter((w) => w < meta.width).concat(Math.min(meta.width, WIDTHS.at(-1)!));
  const img = await getImage({ src: meta, widths: [...new Set(widths)], sizes, format: 'webp' });
  const full = await getImage({ src: meta, width: Math.min(meta.width, FULL_MAX), format: 'webp' });
  const width = Math.min(meta.width, WIDTHS.at(-1)!);
  return {
    src: img.src,
    srcSet: img.srcSet.attribute,
    sizes,
    width,
    height: Math.round((meta.height / meta.width) * width),
    alt,
    fullSrc: full.src,
  };
}

export async function getGalleryImages(): Promise<ResponsiveImage[]> {
  return Promise.all(
    driveIndex.images.map((i) =>
      toResponsive(
        'bilder',
        i.fileName,
        capitalizeFirst(i.title),
        '(min-width: 1344px) 588px, (min-width: 704px) 44vw, 90vw',
      ),
    ),
  );
}

export async function getStartImage(): Promise<ResponsiveImage | null> {
  const fileName = driveIndex.startsida?.image;
  if (!fileName) return null;
  return toResponsive(
    'startsida',
    fileName,
    'BF Rörsjöhus, fastigheten i Rörsjöstaden',
    '(min-width: 1344px) 580px, (min-width: 704px) 44vw, 90vw',
  );
}

const SOCIAL = { width: 1200, height: 630 }; // the size link previews are designed for

/** The start image cropped for link previews (og:image). JPEG, as some apps ignore WebP. */
export async function getSocialImage(): Promise<{
  src: string;
  width: number;
  height: number;
  alt: string;
} | null> {
  const fileName = driveIndex.startsida?.image;
  if (!fileName) return null;
  const img = await getImage({
    src: metadataFor('startsida', fileName),
    ...SOCIAL,
    fit: 'cover',
    format: 'jpeg',
    quality: 80,
  });
  return { src: img.src, ...SOCIAL, alt: 'BF Rörsjöhus, fastigheten i Rörsjöstaden' };
}
