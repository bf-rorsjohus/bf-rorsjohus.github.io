// Loads and validates the index written by scripts/sync-drive.ts.
import { z } from 'astro/zod';
import raw from '../data/generated/drive.json';
import type { DriveIndex } from './drive-index';

const schema = z.object({
  generatedAt: z.string(),
  source: z.enum(['drive', 'fixtures']),
  startsida: z.object({ summary: z.string(), modifiedTime: z.string() }).nullable(),
  files: z.array(
    z.object({
      title: z.string(),
      slug: z.string(),
      ext: z.string(),
      url: z.string().startsWith('/dokument/'),
      year: z.number().nullable(),
      modifiedTime: z.string(),
      size: z.number(),
    }),
  ),
  images: z.array(z.object({ title: z.string(), fileName: z.string(), isStart: z.boolean() })),
  pages: z.array(
    z.object({
      title: z.string(),
      slug: z.string(),
      summary: z.string(),
      modifiedTime: z.string(),
    }),
  ),
  warnings: z.array(z.string()),
});

export const driveIndex: DriveIndex = schema.parse(raw);
