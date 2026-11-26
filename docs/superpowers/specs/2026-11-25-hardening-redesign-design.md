# fjbatresv.com — Hardening + Redesign (design)

Date: 2026-11-25 · Owner: Javier Batres · Planner/reviewer: Claude · Builder: Codex (child worktree)

## 1. Intent

fjbatresv.com is Javier's public site. It must (1) be safe and correctly served, and (2) make any
visitor want to know Javier and contact him — **equally** for freelance/consulting projects and for
full-time hiring. It must push visitors toward his portfolio of live projects and his framework
**Verde** (verde.fjbatresv.com).

## 2. Goals / non-goals / anti-goals

Goals

- Phase 1 (hardening): close current dependency vulnerabilities (runtime first), add security
  headers, fix broken deep links, remove long-lived deploy credentials, make CSP possible.
- Phase 2 (redesign): new information architecture with a dual-path hero, portfolio of 8 own
  projects + Verde as a featured block, per-route prerendered HTML with proper SEO, passing a
  `seo-review` audit.

Non-goals

- No backend, contact form server, CMS or blog engine. Contact = mailto + LinkedIn + booking link
  https://calendar.notion.so/meet/javierbatres/7v3284yxr (plain link, `target=_blank`, no embed).
- No CV download for now (to be revisited later).
- No change to hosting model (S3 + CloudFront stays).

Anti-goals (failure even if it "works")

- A generic template look (AI-default gradients, Inter-everywhere, card soup).
- Regressing Lighthouse (today: Perf 92 / A11y 100 / BP 100 / SEO 100) or test coverage
  (today ~97% lines, Sonar quality gate must stay green).
- Breaking the EN/ES bilingual experience.
- Shipping a CSP that breaks GA consent, Sentry, fonts or the theme toggle.

## 3. Current state (verified 2026-11-25)

- Angular 21.2.6, legacy `@angular-devkit/build-angular:browser` (webpack) builder, CSR only,
  ngx-translate runtime i18n (`src/assets/i18n/{en,es}.json`), 7 routes all rendering
  `HomePageComponent` and scrolling to a section. Node 24.11.1 (`.nvmrc`).
- `npm audit`: 79 vulns (5 critical, 35 high). Dependabot: 100+ open (2 critical, 41 high).
  Runtime-relevant: `@angular/core|compiler|common|router` (sanitization-bypass XSS, DoS). The rest
  are build/dev transitive (piscina, tar, shell-quote, websocket-driver, vite, webpack-dev-server,
  svgo, …). Code scanning / secret scanning: 0 open.
- AWS (account 605134457500, profile `fjbatresv-dev`):
  - CloudFront `E2EV9RW3Q35Z60` (alias fjbatresv.com) → S3 `fjbatresv-web` via OAC. WAF attached,
    TLSv1.2_2021, https-only. **No response headers policy, no function, no custom error
    responses.**
  - `https://fjbatresv.com/projects` → **403** (deep links broken). `robots.txt`, `sitemap.xml` → 403
    (don't exist).
  - Deploy uses static access key of IAM user `fjbatresv-web` (policy `fjbatresv_gh_action_deploy`).
    A GitHub OIDC provider already exists in the account. Workflow already has `id-token: write`.
  - **The `fjbatresv-dev` profile is the root user with an active access key (created
    2025-03-09).** Owner action, see §6.4.
- GA4 consent banner + loader is an inline `<script>` in `src/index.html` that uses `innerHTML`.
- `main.js` ≈ 865 KB (budget warning at 900 KB).

## 4. Approaches considered

| | Approach | Trade-off |
|---|---|---|
| **A (chosen)** | Angular 22 + `@angular/build:application` + SSG (`outputMode: "static"`) | Keeps tests/coverage/Sentry/CI; real HTML per route for crawlers & link previews. Cost: major upgrade + SSR-safe code. |
| B | Patch to Angular 21.2.26, keep CSR | Lowest risk, but all routes keep serving the same empty shell; SEO audit will flag it. |
| C | Rewrite in Astro | Ideal static SEO, but discards the test/CI base — a new project, not a redesign. |

Javier picked **A**.

## 5. Delivery shape

Two branches / two PRs, in order. Phase 2 starts from Phase 1 merged.

1. `fjbatresv/hardening` — no visual changes.
2. `fjbatresv/redesign` — new UI/content/SEO.

Commits use gitmoji (Husky `commit-msg`). PRs target `main` and pass CI + SonarCloud + CodeRabbit.

## 6. Phase 1 — Hardening

### 6.1 Dependencies

- Upgrade Angular to latest 22.x (core, cli, compiler-cli, ssr, router…), migrate builder to
  `@angular/build:application` (esbuild), drop `@angular-devkit/build-angular` and webpack-only deps.
  Run official `ng update` migrations. Bump TypeScript to what Angular 22 requires.
- Update the rest (ngx-translate, Sentry, eslint/angular-eslint, karma stack) to compatible latest.
- Re-evaluate every entry in `package.json` `overrides` + `x-overrides-metadata`: remove pins whose
  `removeWhen` is satisfied; add new documented pins only when an upstream fix is missing.
- Exit criterion: `npm audit --omit=dev` = 0; `npm audit` = 0 critical/high, or each remaining one
  documented in the PR with reason (dev-only, no fix upstream).
- Karma: keep it if it works on Angular 22. If not, migrate to the Angular 22 default unit-test
  runner while keeping coverage ≥ current and Sonar LCOV path working (builder's call, explained in PR).

### 6.2 SSG + routing fix

- Add `@angular/ssr`, `outputMode: "static"`, prerender all 7 routes. Output layout
  `dist/.../browser/<route>/index.html`.
- Make code SSR-safe: `TranslationService` (`navigator`, `localStorage`), `ThemeService`, section
  scroll logic, `DeferErrorComponent` (sessionStorage/reload), Sentry init — guard with
  `isPlatformBrowser`/`afterNextRender`.
- Translations must be available at prerender time (load en.json from the filesystem or via a
  server-side loader) so prerendered HTML contains real English text, not keys.
- Locales: prerender **both** `/` (EN) and `/es/` (ES) for every route. Server-side translation
  loader for both languages. Language toggle navigates between `/x` and `/es/x` (no runtime swap
  flash). `<html lang>` correct per prerendered file. First visit to `/` with an `es` browser and no
  stored preference: client-side redirect to `/es/` is allowed only if it doesn't hurt LCP; otherwise
  just offer the toggle (builder's call). *Decided by Javier.*
- CloudFront Function (viewer-request) `fjbatresv-index-rewrite`: `/foo`, `/foo/`, `/es/foo` →
  `.../index.html`; leave paths with an extension untouched. Phase 2 adds 301s for retired routes.
- Unknown paths: S3+OAC returns 403 → custom error responses 403/404 → `/404.html` with HTTP 404
  (prerendered, bilingual). `**` route no longer redirects to `/`. *Claude's call.*
- Rollout order: (1) deploy SSG build to S3 (root `index.html` still works), (2) attach function +
  error responses + headers policy, (3) verify, (4) invalidate. *Claude's call.*

### 6.3 Security headers + CSP

- Move the consent/GA script out of `index.html` into a static file (e.g. `public/consent.js`),
  rewrite with `textContent`/DOM nodes (no `innerHTML`). Theme bootstrap script, if any, likewise.
- CloudFront Response Headers Policy `fjbatresv-security-headers`:
  - `Strict-Transport-Security: max-age=31536000` — no `includeSubDomains`/`preload` (portfolio
    subdomains are hosted elsewhere; preload is effectively irreversible). *Claude's call.*
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
    `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
  - CSP ships in the Phase 1 PR as **`Content-Security-Policy-Report-Only`** with `report-uri` =
    Sentry's CSP security endpoint (DSN-derived URL, put in the policy JSON). After ~1 week with no
    unexpected violations, Claude flips it to enforced as an infra-only change (no PR to app code).
    *Claude's call.* Policy:
    `default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self'
    'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'
    data: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self'
    https://*.google-analytics.com https://*.analytics.google.com https://*.ingest.sentry.io
    https://*.ingest.us.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
    object-src 'none'; upgrade-insecure-requests`
    (`style-src 'unsafe-inline'` is accepted: Angular inlines critical CSS/component styles. If
    Angular's prerender emits inline `<script>` for event replay/transfer state, the builder must
    either disable it or add the exact hashes — no `'unsafe-inline'` for scripts.)
  - Optionally self-host fonts to drop the Google Fonts origins (builder's call; saves a
    connection).
- `robots.txt` (allow all, sitemap link) and a minimal `sitemap.xml` ship in Phase 1 so they stop
  403-ing; Phase 2 finalizes content.
- Infra as code: `infra/cloudfront/` with JSON for the headers policy, function code + a
  `apply.sh` that uses AWS CLI with `AWS_PROFILE` (idempotent: create-or-update, then attach to
  distribution `E2EV9RW3Q35Z60`). Claude applies it with profile `fjbatresv-dev` after review.

### 6.4 CI/CD credentials

- IAM role `fjbatresv-web-gha-deploy` trusted by the existing GitHub OIDC provider, condition
  `repo:fjbatresv/fjbatresv_web:ref:refs/heads/main`, permissions = current
  `fjbatresv_gh_action_deploy` policy scoped to bucket `fjbatresv-web` + invalidation on
  `E2EV9RW3Q35Z60`. Defined in `infra/iam/` + applied by the same script.
- `deploy.yml` uses `role-to-assume`; remove `AWS_ACCESS_KEY_ID/SECRET` usage. After a green deploy,
  Claude deactivates the `fjbatresv-web` access key (Javier confirms, then delete later).
- Deploy sync updated for SSG layout: all `*.html` get `no-cache`; hashed assets get
  `max-age=31536000, immutable`; i18n JSON gets short cache (they're not hashed).
- Pin third-party actions to commit SHAs; add `permissions:` least-privilege to every workflow;
  add `npm audit --omit=dev --audit-level=high` step to `ci.yml`.
- **Owner action (Javier, not automated):** stop using root credentials — create an admin IAM
  Identity Center user/profile, then deactivate & delete the root access key. Tracked as a PR
  checklist item.

### 6.5 Phase 1 acceptance

- The OIDC role `fjbatresv-web-gha-deploy` was created ahead of merge by Claude (2026-11-25).
- Lint, tests, coverage ≥ current, Sonar gate green, production build within budgets.
- `curl -s https://fjbatresv.com/projects | grep -q 'Featured Projects'` confirms section content, and `curl -sI https://fjbatresv.com/projects` confirms status and headers.
- securityheaders.com grade ≥ A; CSP enforced with no console violations (GA accepted/rejected,
  Sentry, theme, language toggle all work).
- No visible UI change vs production (screenshots EN/ES, light/dark, mobile/desktop).

## 7. Phase 2 — Redesign

### 7.1 Audience & message

Two equal audiences: **clients with a project** and **companies hiring**. Hero offers both paths:

```
[Hero] Javier Batres — Solutions Architect & Senior Full Stack Engineer · Guatemala (remote)
       one-line value proposition
       [ Tengo un proyecto → ]   [ Busco contratar → ]
[Portafolio] 8 cards → each opens its subdomain
[Verde] dedicated block: "my framework for building software with AI agents"
[Experiencia] condensed timeline + client achievements                 ← hiring path
[Servicios / cómo trabajo] engagement types + process                   ← project path
[Contacto] email · LinkedIn · Agendar llamada (Notion Calendar)
```

"Tengo un proyecto" scrolls to Services → Contact with a prefilled mailto subject
("Proyecto: …"). "Busco contratar" scrolls to Experience → Contact with subject
("Oportunidad: …"). GA4 events fire on both CTAs, portfolio clicks, Verde click, booking click,
email/LinkedIn clicks (only when consent accepted).

### 7.2 Portfolio (only these, in this order unless the builder has a content reason)

| Project | URL | Source of copy |
|---|---|---|
| SDG19 (AWS SA final project) | https://sdg19.fjbatresv.com | repo `sdg19-final` description |
| Guso (patient healthcare app) | https://guso.fjbatresv.com | repo `guso_landing` |
| Sinergia Dorada | https://sinergia.fjbatresv.com | repo `sinergia_dorada` |
| Rockers MC | https://rockers.fjbatresv.com | repo `rocker-mc` |
| Pettzi (serverless pet-care) | https://pettzi.fjbatresv.com | repo `pettzi` |
| SAR | https://sar.fjbatresv.com | repo `sar_landing` |
| Migo | https://migo.fjbatresv.com | live landing |
| PDEI+ | https://pdei.fjbatresv.com | live landing |

Each card: name, one-line problem/outcome, role, 3–5 stack tags, screenshot/thumbnail (captured from
the live landing, optimized WebP/AVIF, explicit width/height), link with `rel="noopener"`.
Copy is drafted by the builder from each landing (EN + ES) and flagged in the PR for Javier's review.

Verde: separate featured section (not a card) linking to https://verde.fjbatresv.com, explaining
VDD (Vault · Encargo · Revisión · Decisión · Evidencia) in 2–3 lines.

Journey to Cloud, Mercer VIP, Hecho Capriccio, Ascend move out of the portfolio into Experience
as achievements under their employer/client.

The "Writing & Talks" section (placeholder items) is removed unless real links exist — builder
checks; if none, drop the section and its route.

### 7.3 Design process

1. Run `ui-ux-pro-max` to pick style, palette, type pairing for "senior architect, warm, human"
   (coffee/Gaia personality stays as a small human touch, not the headline).
2. Apply `frontend-design` for a distinctive, non-templated execution. Keep the existing
   light/dark theme mechanism and EN/ES.
3. Accessibility: WCAG 2.2 AA, visible focus, `prefers-reduced-motion`, skip link.
4. Performance: initial JS ≤ current; LCP image preloaded; fonts subset/self-hosted if adopted.

### 7.4 SEO

- Per-route `<title>`, description, canonical, OG/Twitter (via `Meta`/`Title` in a route resolver),
  rendered at prerender time.
- JSON-LD: `Person` (name, jobTitle, sameAs GitHub/LinkedIn, url) on `/`; `ProfilePage`; each
  portfolio item as `CreativeWork` (or `SoftwareApplication`) in an `ItemList`.
- Language: `/` EN and `/es/` ES, each with `hreflang` alternates (`en`, `es`, `x-default` → `/`),
  self-canonical, both in `sitemap.xml`.
- Routes in Phase 2: one canonical page per locale (`/`, `/es/`). Old section routes (`/about`,
  `/experience`, `/skills`, `/projects`, `/writing`, `/contact` and `/es/…`) → **301** to
  `/#section` (or `/es/#section`) via the CloudFront function; removed sections go to the top.
  Nav uses in-page anchors. *Claude's call.*
- New `og-image` (1200×630) — current one referenced at `assets/og-image.webp` does not exist in
  the bucket.
- Final step: run `seo-review` against the deployed preview/production and fix what fails.

### 7.5 Phase 2 acceptance

- Lighthouse ≥ 95 / 100 / 100 / 100 on mobile for `/`.
- `seo-review` checklist passes.
- Both CTA paths work end to end; all 8 portfolio links + Verde open correctly.
- Tests cover new components; coverage ≥ Phase 1; Sonar gate green.

## 8. Roles

- Codex (Orca child worktree): implements each phase on its branch, opens the PR.
- Claude: reviews diffs, runs verification (build, tests, Lighthouse, headers via curl), applies
  AWS changes with profile `fjbatresv-dev` after Javier approves the infra diff, runs `seo-review`.
- Javier: approves designs/copy, merges PRs, rotates root credentials.

## 9. Left to the builder / decisions log

- Builder's calls: Karma vs new test runner; self-hosting fonts; exact card layout; GA event names;
  `es`-browser first-visit behavior (see §6.2).
- Decided by Javier: dual-path hero (both audiences equal); approach A; portfolio list; old projects
  move to Experience; `/es/` prerendered routes; booking link; no CV for now.
- Claude's calls (correct if wrong): HSTS without subdomains/preload; CSP Report-Only → enforce
  after ~1 week; 404 page with real 404 status; single canonical page per locale with 301s from old
  section routes; rollout order; OIDC role replaces deploy keys.

## 10. Phase 2 decisions (2026-11-26)

Supersede §7 where they differ.

- **Brand** (manual de marca, Nov 2026): Poppins only; palette turquesa `#4dbec5`, menta `#def5ed`,
  teal `#689b9e`, gris `#82908f`, antracita `#283232`; isotipo JB (single continuous stroke in a
  circle). Concept "Dureza técnica, suavidad humana". 12 years of experience. Logo rules: only the
  circular container, no distortion, no low-contrast backgrounds. Never white text on turquoise.
- **Visual direction: "2 · Antracita"** (canvas https://claude.ai/artifact/Xet942bjNU3jxnQriCDF4m,
  artboard Antracita). Dark (antracita) is the default theme; light theme uses the menta palette.
  Toggle stays. *Decided by Javier.*
- **Pending from the designer (do not block):** isotipo as SVG, and the dark-background variant
  (antracita circle + menta stroke). Ship with the PNG isotipo behind one `<app-logo>` component so the
  swap is one file.
- **Sections (single page per locale, in order):** Hero (dual path) → Proyectos (8) → Verde →
  Experiencia (timeline + client achievements incl. Journey to Cloud, Mercer VIP, Hecho Capriccio,
  Ascend; stack chips replace the old Skills section) → Cómo trabajo (engagement types, for the
  project path) → Contacto (email, LinkedIn, Notion Calendar). About/Skills/Writing sections and
  their routes are removed. No CV.
- **Deferred loading:** content sections render in the prerendered HTML (SEO) without `@defer`;
  only images lazy-load. Incremental hydration is not used because its jsaction inline script
  conflicts with the CSP. This closes the Phase 1 carry-over: the home chunk is small (<30 kB).
  *Claude's call.*
- **Fonts self-hosted** (Poppins 400/500/600/700, latin + latin-ext woff2) → Google Fonts origins
  are removed from the CSP. *Claude's call.*
- **Copy** drafted EN + ES from each project's live landing (title/description) and flagged in the
  PR for Javier's review.
