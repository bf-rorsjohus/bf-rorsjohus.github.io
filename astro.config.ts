import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// The site is the GitHub organization site, served from the root of this address.
// If a custom domain is added later, change `site` and the Pages settings; nothing else.
export default defineConfig({
  site: 'https://bf-rorsjohus.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    react(),
    // Only canonical pages: no 404, and not the sorted variants of /dokument/.
    sitemap({
      filter: (page) => !page.includes('/404') && !/\/dokument\/[^/]+\/$/.test(page),
    }),
  ],
});
