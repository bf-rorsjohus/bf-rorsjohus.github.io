// Turns the synced images into responsive <img> data at build time (no client JS).
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { driveIndex } from './content';

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
        i.title,
        '(min-width: 1100px) 340px, (min-width: 700px) 45vw, 100vw',
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
    '(min-width: 1100px) 1040px, 100vw',
  );
}
