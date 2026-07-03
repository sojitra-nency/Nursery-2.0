# Nursery — trilingual plant catalog

A $0, catalog-first nursery website. **Next.js 16** (App Router) + **Tailwind v4** on **Cloudflare**, with
**Sanity** as the headless CMS. Trilingual: **English / हिन्दी / ગુજરાતી**.

> Design docs live in `plan/` (gitignored). This README covers running and finishing setup.

## Stack

- Next.js 16 (RSC + ISR), React 19, TypeScript, Tailwind CSS v4 (hand-built components)
- Sanity (hosted CMS, Studio, image CDN) via `next-sanity` + GROQ
- Native i18n: `/[locale]/` routing + JSON dictionaries (`messages/`) + Sanity field-level localization
- Cloudflare deploy via `@opennextjs/cloudflare` + Wrangler
- Vitest + Testing Library, Playwright; ESLint 9 + Prettier + Husky + lint-staged (+ optional gitleaks); pnpm

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000  (/ → /en)
```

The app runs **before** Sanity is configured: content fetches are guarded and fall back, so pages render with
placeholder data until you complete the steps below.

## Scripts

| Script                        | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| `pnpm dev`                    | Next dev server                                       |
| `pnpm build` / `pnpm start`   | Next production build / serve                         |
| `pnpm typecheck`              | `tsc --noEmit`                                        |
| `pnpm lint` / `pnpm format`   | ESLint / Prettier                                     |
| `pnpm test` / `pnpm test:e2e` | Vitest unit / Playwright e2e                          |
| `pnpm cf:build`               | Build the Cloudflare worker (`.open-next/`)           |
| `pnpm cf:preview`             | Build + preview the worker locally (Wrangler)         |
| `pnpm cf:deploy`              | Build + deploy to Cloudflare (needs `wrangler login`) |
| `pnpm sanity dev`             | Run Sanity Studio locally (http://localhost:3333)     |
| `pnpm sanity deploy`          | Deploy Studio to a free `*.sanity.studio` URL         |

## Finish setup (credentialed steps)

These need interactive login / accounts and aren't scripted.

### 1. Sanity

```bash
cp .env.example .env.local
npx sanity login
npx sanity init --env        # create/select a project; dataset: production
```

Then in `.env.local` set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_STUDIO_PROJECT_ID` to the new project id
(dataset `production`). In the Sanity manage dashboard:

- **API → CORS origins:** add `http://localhost:3000` and your production URL (allow credentials).
- **API → Tokens:** create a **Viewer** token → `SANITY_API_READ_TOKEN` (for draft previews).
- **API → Webhooks:** add a webhook → `POST https://<your-site>/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`,
  projection including `_type`.

Run the Studio and add content (nursery settings + a few plants/categories):

```bash
pnpm sanity dev      # local
pnpm sanity deploy   # hosted, free *.sanity.studio
```

### 2. Cloudflare

Manual, one-off deploy:

```bash
npx wrangler login
pnpm cf:deploy
```

Add the deployed origin to Sanity CORS (step 1). Enable **Cloudflare Web Analytics** for the site (free).

#### Auto-deploy (GitHub Actions)

`.github/workflows/deploy.yml` builds and deploys on every push to `main` (and via
manual **Run workflow**), gated on typecheck + lint + unit tests. Configure once in
**GitHub → Settings → Secrets and variables → Actions**:

- **Secrets:**
  - `CLOUDFLARE_API_TOKEN` — token with the _Edit Cloudflare Workers_ template
  - `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard
- **Variables** (public, inlined at build time):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`

The app currently reads only **published** content via a token-less client, so the build
needs nothing beyond the variables above. The one runtime secret in use —
`SANITY_REVALIDATE_SECRET` (webhook auth, see `app/api/revalidate/route.ts`) — persists on
the Worker across deploys, so set it **once** with `wrangler secret put SANITY_REVALIDATE_SECRET`
(or in the dashboard); the Action doesn't manage it. `SANITY_API_READ_TOKEN` is only needed
if/when draft previews get wired up — it isn't used yet.

## Project structure

```
app/[locale]/          home, catalog/, plants/[slug]/, categories/…, about, visit
app/api/revalidate/    Sanity webhook → on-demand ISR
sanity/                sanity.config.ts, schemaTypes/*, lib/{client,fetch,image,enums,queries}
lib/i18n/              config, dictionaries, getLocalized      messages/{en,hi,gu}.json
components/            layout, ui, sections, catalog, plant, seo
open-next.config.ts  wrangler.jsonc
```

## Notes

- Studio is **standalone** (not embedded) — keeps the Cloudflare bundle lean.
- Locale entry is a static redirect `/` → `/en` (Next 16 proxy/middleware isn't supported by OpenNext Cloudflare);
  English is the default landing locale, switchable in-app.
- `next/image` is `unoptimized` — Sanity's CDN handles image optimization.
- See `plan/02-project-setup.md` for the full list of as-built decisions.
