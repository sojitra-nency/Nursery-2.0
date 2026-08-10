# Nursery — multilingual plant catalog

A $0, catalog-first nursery website. **Next.js 16** (App Router) + **Tailwind v4** on **Cloudflare**, with
**Sanity** as the headless CMS. **English + the 12 most widely spoken Indian languages** —
हिन्दी · বাংলা · मराठी · తెలుగు · தமிழ் · ગુજરાતી · اردو · ಕನ್ನಡ · ଓଡ଼ିଆ · മലയാളം · ਪੰਜਾਬੀ · অসমীয়া.

> Design docs live in `plan/` (gitignored). This README covers running and finishing setup.

## Stack

- Next.js 16 (RSC + ISR), React 19, TypeScript, Tailwind CSS v4 (hand-built components)
- Sanity (hosted CMS, Studio, image CDN) via `next-sanity` + GROQ
- Native i18n: `/[locale]/` routing + JSON dictionaries (`messages/`) + Sanity field-level localization,
  driven end-to-end by one registry (`lib/i18n/config.ts`); per-script webfonts and full RTL for Urdu
- Cloudflare deploy via `@opennextjs/cloudflare` + Wrangler
- Vitest + Testing Library, Playwright; ESLint 9 + Prettier + Husky + lint-staged (+ optional gitleaks); npm

## Develop

```bash
npm install
npm run dev         # http://localhost:3000  (/ → language chooser)
```

The app runs **before** Sanity is configured: content fetches are guarded and fall back, so pages render with
placeholder data until you complete the steps below.

## Scripts

| Script                            | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Next dev server                                       |
| `npm run build` / `npm start`     | Next production build / serve                         |
| `npm run typecheck`               | `tsc --noEmit`                                        |
| `npm run lint` / `npm run format` | ESLint / Prettier                                     |
| `npm test` / `npm run test:e2e`   | Vitest unit / Playwright e2e                          |
| `npm run cf:build`                | Build the Cloudflare worker (`.open-next/`)           |
| `npm run cf:preview`              | Build + preview the worker locally (Wrangler)         |
| `npm run cf:deploy`               | Build + deploy to Cloudflare (needs `wrangler login`) |
| `npx sanity dev`                  | Run Sanity Studio locally (http://localhost:3333)     |
| `npx sanity deploy`               | Deploy Studio to a free `*.sanity.studio` URL         |

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
npx sanity dev       # local
npx sanity deploy    # hosted, free *.sanity.studio
```

### 2. Cloudflare

Manual, one-off deploy:

```bash
npx wrangler login
npm run cf:deploy
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
app/(entry)/           `/` language chooser (own root layout, locale-neutral)
app/(site)/[locale]/   home, catalog/, plants/[slug]/, about, visit
app/api/revalidate/    Sanity webhook → on-demand ISR
sanity/                sanity.config.ts, schemaTypes/*, lib/{client,fetch,image,enums,queries}
lib/i18n/              config (the locale registry), dictionaries, getLocalized, format,
                       categories, preference          messages/<code>.json × 13
lib/fonts.ts           per-script Noto faces, selected by the active locale
components/i18n/       LanguageGrid, LanguagePicker, BoundaryMessages
components/            layout, ui, sections, catalog, plant, seo
open-next.config.ts  wrangler.jsonc
```

## Languages

One registry drives everything: `lib/i18n/config.ts`. Adding a language = add a row there + a
`messages/<code>.json`. Routing, `generateStaticParams`, the chooser, hreflang, the sitemap, Sanity's
localized field sets, `dir` and the script font all follow automatically, and
`tests/messages.test.ts` fails if the new catalog is missing keys, has blank values or drops a
`{placeholder}`.

**UI strings** live in `messages/` and are complete in all 13 languages. Missing or blank values fall back
to English key-by-key (`mergeDictionary`), so a partial catalog can never render an empty button.

**CMS content** (plant names, descriptions, address) is authored in English and translated into the other
twelve. Anything untranslated falls back to English, so a half-translated dataset is a working site.

```bash
npm run check-translations          # read-only audit of the live dataset (wrong script, untranslated, mixed)
npm run translate                   # dry run: list every field that needs translating
npm run translate -- --commit       # fill the blanks (never overwrites existing text)
npm run translate -- --locales=ta,ml --limit=1 --commit
```

Two engines, both free — pick with `TRANSLATE_PROVIDER` (see `.env.example`):

| Provider   | Setup                                                   | Quality                                                                                                 |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `gemini`   | Free `GEMINI_API_KEY` from aistudio.google.com, no card | Best — an LLM given a horticulture glossary and tone rules; all 12 languages per request                |
| `bhashini` | Free registration at bhashini.gov.in (3 env vars)       | Strong on Indic pairs (IndicTrans2); one request per language                                           |
| `mymemory` | None — the default                                      | Poor on Indic pairs, ~1000 words/day. Also powers the Studio's Translate button, which can't hold a key |

The Studio's **Translate** button fills only the blank languages and never overwrites text an editor has
corrected; "Re-translate all" is a separate, confirmed action. All machine output should be reviewed by a
native speaker before publishing.

## Notes

- Studio is **standalone** (not embedded) — keeps the Cloudflare bundle lean.
- `/` serves the **language chooser** — a real, crawlable page (the `x-default` hreflang target), not a redirect.
  A blocking script sends returning visitors to their saved locale; `/?change=1` forces the chooser. Client-side
  because Next 16's proxy/middleware isn't supported by OpenNext Cloudflare — and because a crawler carries no
  stored preference, so it always sees the hub page.
- `next/image` is `unoptimized` — Sanity's CDN handles image optimization.
- See `plan/02-project-setup.md` for the full list of as-built decisions.
