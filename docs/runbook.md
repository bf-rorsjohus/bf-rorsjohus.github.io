# Runbook

## Accounts (konton)

| Konto / tjänst                                               | Ägare                                        | Anteckning                                                                       |
| ------------------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------- |
| GitHub-organisationen `bf-rorsjohus`                         | Jespers personliga GitHub-konto (enda ägare) | Free plan. Överlämning: lägg till ny ägare, ta sedan bort den gamla              |
| Repo `bf-rorsjohus.github.io`                                | Organisationen                               | Publikt (krävs för gratis GitHub Pages)                                          |
| Google-kontot bfrorsjohus@gmail.com                          | Föreningen, delas av styrelsen               | Tvåstegsverifiering på; lösenord och reservkoder i styrelsens lösenordshanterare |
| Google Cloud-projektet `bf-rorsjohus-webb` (nr 761987763854) | bfrorsjohus@gmail.com                        | **Inget betalkonto, någonsin**                                                   |
| Search Console                                               | bfrorsjohus@gmail.com                        | URL-prefix-egendom för https://bf-rorsjohus.github.io/                           |

**Gör inte:** gör inte repot privat (då kostar Pages pengar), lägg inte till betalkonto i
Google Cloud, byt inte namn på mapparna i Hemsida.

## Google setup (what exists and how to recreate it)

All in project `bf-rorsjohus-webb`, created from Cloud Shell as bfrorsjohus@gmail.com:

- APIs enabled: `drive`, `iam`, `iamcredentials`, `sts`.
- Service account `webbplats-lasare@bf-rorsjohus-webb.iam.gserviceaccount.com`, no roles.
- Workload identity pool `github`, OIDC provider `github-repo`:
  issuer `https://token.actions.githubusercontent.com`,
  mapping `google.subject=assertion.sub,attribute.repository=assertion.repository`,
  condition `assertion.repository=='bf-rorsjohus/bf-rorsjohus.github.io'`.
- Binding on the service account: `roles/iam.workloadIdentityUser` for
  `principalSet://iam.googleapis.com/projects/761987763854/locations/global/workloadIdentityPools/github/attribute.repository/bf-rorsjohus/bf-rorsjohus.github.io`.
- Drive: `Hemsida` shared with the service account as Viewer.

Recreate with the commands in the implementation plan (Phase 1). If the repository or
organization is renamed, update the provider's attribute condition and the binding's member.

## Something is wrong

| Symptom                                     | Check                                                                                 | Fix                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Changes in Hemsida don't appear             | Actions → Deploy: recent scheduled runs?                                              | If the workflow is disabled: Actions → Deploy → **Enable workflow**, then **Run workflow** |
| Deploy fails at "Sign in to Google"         | Repository variables `GCP_WIF_PROVIDER`, `GCP_SERVICE_ACCOUNT`                        | Compare with this runbook; check the provider's condition still names this repo            |
| Deploy fails at "Read Hemsida" with 404/403 | Is Hemsida still shared with the service account? Is `DRIVE_HEMSIDA_FOLDER_ID` right? | Reshare as Viewer; fix the variable                                                        |
| "folder … is missing from Hemsida"          | Someone renamed `filer`, `bilder` or `bra_att_veta`, or the Doc `Startsida`           | Rename back                                                                                |
| "Content shrank from X to Y items"          | Was something deleted on purpose?                                                     | If yes: Run workflow with **allow shrink**. If not: restore from Drive's trash             |
| "Two items … get the same address"          | Two files with names that differ only in å/ä/ö or punctuation                         | Rename one                                                                                 |
| `check-dist` fails                          | Read the listed problems                                                              | Fix in code (pull request)                                                                 |

The job summary of each run lists what was found in Drive and any warnings (skipped files etc.).

## Removing something urgently

Delete it from Hemsida, then Actions → Deploy → Run workflow (tick "allow shrink" if needed).
If Google may have indexed it: Search Console → Removals.

## Launch checklist

1. Board reviews the site (it is `noindex` until launch).
2. Add repository variable `INDEXING` = `true`; Run workflow.
3. Search Console: add URL-prefix property, verify with the meta tag (put the token in variable
   `GOOGLE_SITE_VERIFICATION`, Run workflow), submit `sitemap-index.xml`.

## Adding a domain later

1. Register it in the association's name. DNS: `www` CNAME `bf-rorsjohus.github.io.`; apex A
   records 185.199.108.153, .109.153, .110.153, .111.153 (and AAAA 2606:50c0:8000::153 …
   8003::153). Verify the domain in the organization's Pages settings first.
2. Repo Settings → Pages → Custom domain; Enforce HTTPS.
3. Change `site` in `astro.config.ts`, `SITE_URL` in `src/lib/seo.ts` and `public/robots.txt`,
   and `SITE_URL` default in `scripts/check-changed.ts`.
4. Search Console: add the domain property, use Change of address.

## Board change / handover checklist

- [ ] New board members get the Google account password via the password manager.
- [ ] Change the Google password if someone with access leaves the board.
- [ ] GitHub: if Jesper hands over, add the new owner to the organization first, then remove Jesper.
- [ ] Annual check (after föreningsstämman): scheduled runs still green? Hemsida still shared
      with the service account? GitHub owner reachable?
