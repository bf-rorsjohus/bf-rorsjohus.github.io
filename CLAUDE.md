# CLAUDE.md

Static website for the housing association BF Rörsjöhus u p a (Föreningsgatan 43 B, Malmö),
published at <https://bf-rorsjohus.github.io/>. Astro 7 + React/TSX rendered to plain HTML, content
synced at build time from a private Google Drive folder, deployed to GitHub Pages. Cost: 0 kr.

Read `README.md` for architecture, `docs/runbook.md` for operations and Google setup, and
`docs/board-guide.md` (Swedish) for how the board edits content.

## Commands

```bash
npm ci
npm run sync:fixtures   # REQUIRED before dev/build locally: generated content is gitignored
npm run dev             # http://localhost:4321
npm test                # node:test unit tests in tests/
npm run lint            # eslint + prettier --check (fix with: npx prettier --write .)
npm run build           # astro check + astro build + scripts/check-dist.ts
```

Before calling a change done: `sync:fixtures`, `lint`, `test` and `build` must all pass.

Node 24 (`.nvmrc`). Scripts and tests are `.ts` run by Node's type stripping, so files imported by
`scripts/` or `tests/` must import each other with explicit `.ts` extensions.

## Hard rules

- **Client-side JavaScript only for the image and document viewers.** The only script is
  `src/scripts/viewer/` (GLightbox, MIT, bundled by Astro; PDFs use the browser's own viewer in a
  same-origin iframe). Don't hand-roll a replacement; configure or theme GLightbox. No `client:*` directives, no `useState`/`useEffect`, no event handlers in
  TSX, no inline scripts except JSON-LD, no script from any other origin. Viewer links must keep
  their normal `href` so the page works without JS. ESLint and `check-dist.ts` enforce this. Other
  interactivity is still pre-rendered pages and links (see the sort orders under `/dokument/`) or
  plain HTML such as `<details>`.
- **No third parties at runtime.** No analytics, cookies, embeds, CDNs or external fonts (Inter is
  self-hosted via `@fontsource-variable`). No paid services, no Google Cloud billing.
- **No secrets.** Google access is keyless (Workload Identity Federation in `deploy.yml`). Never add
  API keys, service account keys or tokens. The repository is public: never commit Drive content,
  personal data or credentials.
- **Content belongs in Drive, not in code.** The board edits `Hemsida/` in Google Drive. Never edit
  generated paths (`src/content/`, `src/assets/drive/`, `src/data/generated/`, `public/dokument/`,
  `public/_drive-manifest.json`); they are rewritten by `scripts/sync-drive.ts`.
- **Don't change the association's texts or facts** (welcome text, "Bra att veta" pages,
  `src/data/association.ts`) unless explicitly asked. They are copied verbatim from the old SBC
  site. `src/data/fixtures/` holds those real texts as the offline stand-in for Drive.
- **Drive folder names are a contract with the board**: `startsida/`, `filer/`, `bilder/`,
  `bra_att_veta/`. Changing the structure means updating, together: `scripts/sync-drive.ts`,
  `src/data/fixtures/`, `src/lib/drive-index.ts`, the zod schema in `src/lib/content.ts`,
  `docs/board-guide.md`, the README tables and the runbook's troubleshooting table.
- **The site URL** lives in `astro.config.ts`, `src/lib/seo.ts`, `public/robots.txt` and
  `scripts/check-changed.ts`. Change all of them together.

## Code conventions

- `src/pages/*.astro` are thin: load data, call `buildSeo`, render one TSX page component from
  `src/components/pages/`. All UI is TSX in `src/components/`, rendered on the server.
- Styles: a CSS Module next to each component, using the tokens in `src/styles/global.css`.
- Every page: exactly one `<h1>`, a title and description via `buildSeo`, `alt` on every image
  (`check-dist.ts` fails the build otherwise). Pages that are variants of another set
  `canonicalPath` and are excluded from the sitemap in `astro.config.ts`.
- Accessibility: semantic HTML, `aria-current` for the current page, visible focus, tap targets of
  at least 44px, layouts that work at 390px width.
- Swedish sorting and URLs: use `swedishCollator` and `slugify` from `src/lib/format.ts`.
- Pure logic goes in `src/lib/` (no Astro imports where scripts or tests need it) with tests in
  `tests/`.
- Keep it small. Prefer deleting unused code over keeping it.

## Language

- Visitor-facing text and `docs/board-guide.md`: Swedish.
- Code, comments, `README.md`, `docs/runbook.md`, this file: English.
- Commit messages: short Swedish subject line, English body.

## Deploys

- Push to `main` deploys via `.github/workflows/deploy.yml`. Pull requests run `ci.yml` with
  fixtures (no Google access).
- Scheduled runs (minutes 7 and 37, 06–23 Europe/Stockholm) deploy only when the Drive manifest
  differs from the live `/_drive-manifest.json`. A drop below half the content is refused unless
  the run is started manually with "allow shrink".
- Every page is `noindex` until the repository variable `INDEXING` is `true`.
