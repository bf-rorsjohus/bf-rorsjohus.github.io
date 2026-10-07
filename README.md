# BF Rörsjöhus – webbplats

The public website of BF Rörsjöhus u p a (Föreningsgatan 43 B, Malmö), published at
<https://bf-rorsjohus.github.io/>.

- **Static site** built with Astro 7 and React/TSX, rendered to plain HTML at build time.
  No JavaScript is shipped, no cookies are set, nothing is loaded from third parties.
- **Content comes from Google Drive.** The board edits one private folder, `Hemsida`, in the
  association's Google account. The build reads it every 30 minutes and republishes when
  something changed. Board members never need GitHub. See `docs/board-guide.md` (Swedish).
- **Hosting:** GitHub Pages, deployed by GitHub Actions. Cost: 0 kr.

## How it fits together

```
Hemsida/ (Google Drive, private)          GitHub Actions (.github/workflows/deploy.yml)
  startsida/     (Doc + image)─┐          1. sign in to Google as a service account
  filer/         (any files)   ├─ sync ─▶ 2. scripts/sync-drive.ts  → generated content
  bilder/        (images)      │          3. scripts/check-changed.ts (skip if nothing changed)
  bra_att_veta/  (Google Docs) ┘          4. astro build + scripts/check-dist.ts
                                          5. deploy to GitHub Pages
```

| Drive           | Becomes                                       | Generated into                                          |
| --------------- | --------------------------------------------- | ------------------------------------------------------- |
| `startsida/`    | Doc: welcome text on `/`; image: start image  | `src/content/startsida/`, `src/assets/drive/startsida/` |
| `filer/`        | Table on `/dokument/`, files at `/dokument/*` | `public/dokument/`                                      |
| `bilder/`       | Gallery on `/bilder/`                         | `src/assets/drive/bilder/`                              |
| `bra_att_veta/` | One page per Doc at `/bra-att-veta/<slug>/`   | `src/content/bra-att-veta/`                             |
| (index of all)  | Data for the pages above                      | `src/data/generated/drive.json`                         |

Everything generated is gitignored. Names starting with `_` are skipped (drafts). In `startsida/`
names don't matter: the first Google Doc and the first image (alphabetically) are used. Word files
are reported in the job summary with a hint to convert them.

### Google access, without any stored secret

The workflow uses `google-github-actions/auth` with **Workload Identity Federation**: GitHub's
OIDC token is exchanged for a short-lived token for the service account
`webbplats-lasare@bf-rorsjohus-webb.iam.gserviceaccount.com`, scope `drive.readonly`. The
service account has no project roles; its only access is Viewer on `Hemsida`. The federation
provider only trusts this repository. Setup and recovery: `docs/runbook.md`.

Repository **variables** (Settings → Secrets and variables → Actions → Variables):

| Variable                   | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `GCP_WIF_PROVIDER`         | Federation provider resource name                       |
| `GCP_SERVICE_ACCOUNT`      | Service account email                                   |
| `DRIVE_HEMSIDA_FOLDER_ID`  | ID of the `Hemsida` folder                              |
| `INDEXING`                 | `true` once launched; otherwise every page is `noindex` |
| `GOOGLE_SITE_VERIFICATION` | Optional: Search Console meta-tag token                 |

## Working on the code

Instructions for Claude (and a compact summary of the rules for anyone) are in `CLAUDE.md`.

Requires Node 24 (see `.nvmrc`; Node ≥ 22.18 also works). Scripts are plain TypeScript run by
Node's built-in type stripping.

```bash
npm ci
npm run sync:fixtures   # sample content from src/data/fixtures/ (no Google access needed)
npm run dev             # http://localhost:4321
npm test                # unit tests
npm run lint
npm run build           # astro check + build + post-build checks
```

`src/data/fixtures/` holds the real texts of the three "Bra att veta" pages (copied from the old
SBC site) plus placeholder files and images.

## Code layout and conventions

- `src/pages/*.astro` – thin route files: load data, build the SEO object, render one TSX page.
- `src/layouts/BaseLayout.astro` – `<html>`, `<head>`, meta tags, JSON-LD, global CSS.
- `src/components/**/*.tsx` – all visible UI, rendered on the server only. **No `client:`
  directives and no `useState`/`useEffect`** (enforced by ESLint). Styles are CSS Modules next
  to each component; tokens live in `src/styles/global.css`.
- `src/lib/*.ts` – data loading (`content.ts`, `images.ts`), SEO (`seo.ts`), helpers.
- `src/data/association.ts` – fixed facts (name, address, org nr, e-mail, member portal link).
- `scripts/` – `sync-drive.ts`, `check-changed.ts`, `check-dist.ts`.

`check-dist.ts` fails the build if a page references JavaScript, lacks a title, description,
canonical or exactly one `<h1>`, has an `<img>` without `alt`, or links to something that does
not exist. (`@astrojs/react` always emits an unused client runtime file; the check deletes it.)

## Deploys

- Push to `main` → deploy. Pull requests run `ci.yml` with fixtures.
- Schedule: minutes 7 and 37 of hours 06–23, Europe/Stockholm. Deploys only if the Drive
  manifest differs from the live `/_drive-manifest.json`.
- Manual: Actions → Deploy → Run workflow. Tick "allow shrink" if the board deliberately removed
  more than half of the content (otherwise the build refuses, to catch accidents).
- GitHub disables schedules in public repos after 60 days without activity; scheduled runs call
  the "enable workflow" API to prevent that. If it ever stops anyway: Actions → Deploy → Enable.

## Key decisions

- Astro + TSX without hydration: familiar components, zero client JS.
- Sorting on `/dokument/` without JavaScript: each sort order is its own pre-rendered page
  (`/dokument/`, `/dokument/namn-o-a/`, `/dokument/nyast/`, `/dokument/aldst/`), canonical to
  `/dokument/` and left out of the sitemap. Default: name A–Ö.
- Build-time Drive sync instead of browser fetching or embeds: no API key in the page, no
  cookies, documents served from our own address, site works even if Drive is down.
- Private folder + service account via federation: nothing public in Drive, no secrets in GitHub.
- No custom domain at launch; adding one later = Pages settings + `site` in `astro.config.ts`.
- No analytics; Google Search Console only.

Licence: MIT for the code. Texts and images © BF Rörsjöhus u p a.
