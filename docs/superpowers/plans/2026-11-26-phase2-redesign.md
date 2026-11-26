# Phase 2 — Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild fjbatresv.com as one prerendered page per locale (`/`, `/es/`) in Javier's brand ("Antracita" direction) that invites both clients and employers to contact him, showcases 8 live projects and the Verde framework, and passes `seo-review`.

**Architecture:** Same Angular 22 SSG app (Phase 1). `HomePageComponent` renders all sections eagerly (no `@defer` for content) so prerendered HTML has every word. Brand lives in CSS custom properties with a dark (default) and light theme. Old section URLs 301 to anchors via the existing CloudFront viewer-request function.

**Tech Stack:** Angular 22 standalone + OnPush, ngx-translate (JSON import loader), SCSS, Karma/Jasmine, CloudFront Functions (`node --test`), Playwright (one-off asset capture only).

**Spec:** `docs/superpowers/specs/2026-11-25-hardening-redesign-design.md` — §7 and **§10 (overrides §7)**. Visual reference: artboard "2 · Antracita" in https://claude.ai/artifact/Xet942bjNU3jxnQriCDF4m (Javier can share it; if you cannot open it, the tokens and copy in this plan are sufficient).

## Global Constraints

- Branch `fjbatresv/redesign` (already exists with these docs). PR to `main`. Gitmoji commits; Husky hooks on; never bypass.
- Font: **Poppins only**, self-hosted woff2 (400, 500, 600, 700; latin + latin-ext), `font-display: swap`, preload 400 + 600 only.
- Tokens (exact): `--jb-turquoise:#4dbec5; --jb-mint:#def5ed; --jb-teal:#689b9e; --jb-slate:#82908f; --jb-anthracite:#283232`. Dark theme: bg `#283232`, surface `#303c3c`, border `#3a4848`, text `#def5ed`, muted text `#b5c9c4`, accent `#4dbec5`. Light theme: bg `#def5ed`, surface `#ffffff`, border `#c9ece2`, text `#283232`, muted `#3d4a4a`, accent-strong `#3f6f72` (for small accent text; `#4dbec5` only as fill or ≥24px text).
- **Never white or mint text on turquoise**; text on turquoise is `#283232`. All text ≥ 4.5:1 (large ≥ 3:1) in both themes.
- Default theme **dark** when nothing is stored (`localStorage['fj-theme']`); toggle persists.
- Logo only inside its circle; never distorted; rendered through one `<app-logo>` component (PNG now; SVG + dark variant come later from the designer).
- Section ids (same in both locales): `top`, `projects`, `verde`, `experience`, `how-i-work`, `contact`.
- Portfolio order and URLs (exact): sdg19 → https://sdg19.fjbatresv.com, guso → https://guso.fjbatresv.com, sinergia → https://sinergia.fjbatresv.com, rockers → https://rockers.fjbatresv.com, pettzi → https://pettzi.fjbatresv.com, sar → https://sar.fjbatresv.com, migo → https://migo.fjbatresv.com, pdei → https://pdei.fjbatresv.com. Verde → https://verde.fjbatresv.com. External links `target="_blank" rel="noopener"`.
- Contact: email `fjbatresv@gmail.com`; LinkedIn `https://www.linkedin.com/in/fjbatresv`; GitHub `https://github.com/fjbatresv`; booking `https://calendar.notion.so/meet/javierbatres/7v3284yxr`. No CV.
- Mailto subjects: project path `Proyecto: ` / `Project: `; hire path `Oportunidad laboral: ` / `Job opportunity: `.
- No inline scripts / `on*=` attributes (existing `check-inline-scripts` must stay green). No new third-party origins.
- Coverage ≥ Phase 1 (100% statements/functions/lines; branches ≥ 92%). Sonar gate green. Lighthouse mobile on `/`: Perf ≥ 95, A11y 100, BP 100, SEO 100.
- All user-visible text in `src/i18n/en.json` + `es.json`; components hold keys only. Copy drafted from the landings listed in Task 4 and marked for Javier's review in the PR.
- Respect `prefers-reduced-motion` (no smooth scroll / transitions under `reduce`).

## Review Focus

1. Visiting an old URL (`/about`, `/es/skills/`, `/projects`) must 301 to the right `/#anchor` or `/es/#anchor`, not 404 — Task 2 function tests.
2. A first-time visitor whose OS is in light mode still gets the dark theme with no flash — Task 1 theme-init test.
3. Analytics events must not fire without consent (cookie `analytics_consent=accepted`) — Task 3 analytics spec.
4. Spanish page must have every section translated (no raw keys, no English leftovers) — Task 8 dist check greps for `"projects.` / `"hero.` key patterns in `es/index.html`.
5. Keyboard: both hero paths, every project card link, theme/lang toggles reachable and visibly focused — Task 9 a11y pass.

---

### Task 1: Brand foundation (tokens, fonts, theme, logo, favicon)

**Files:** Modify `src/styles.scss`, `src/index.html`, `public/theme-init.js`, `src/app/core/services/theme.service.ts`; Create `public/fonts/poppins-*.woff2`, `src/app/core/components/logo/logo.component.ts` (+spec), `public/brand/jb-isotipo.png` (already committed) + optimized `jb-isotipo-96.webp`, `favicon.ico`/`apple-touch-icon.png` (180) generated from the isotipo.

**Interfaces — Produces:** CSS vars `--color-bg|surface|border|text|muted|accent|accent-strong|on-accent` per `body.theme-dark` / `body.theme-light`; `<app-logo size="sm|md|lg">` (renders the isotipo `<img>` with explicit width/height and `alt="Javier Batres"`).

- [ ] **Step 1: Failing tests:** `theme-init.spec` — nothing stored + `matchMedia('(prefers-color-scheme: light)')` true → `theme-dark`; stored `light` → `theme-light`. `theme.service.spec` — initial theme `dark` when storage empty. `logo.component.spec` — `size="lg"` renders img 96×96, alt text.
- [ ] **Step 2:** Run → FAIL. Implement. Remove the Google Fonts `<link>`s from `index.html`; add `@font-face` for self-hosted Poppins and `<link rel="preload" as="font" type="font/woff2" crossorigin>` for 400/600.
- [ ] **Step 3:** `npm run test:coverage && npm run build` green. Commit `🎨 Add brand tokens, self-hosted Poppins and logo`.

### Task 2: Single-page routing + legacy redirects

**Files:** Modify `src/app/app.routes.ts`, `src/app/app.routes.server.ts`, `src/app/core/components/navbar/*`, `src/app/core/i18n/lang.ts`, `infra/cloudfront/index-rewrite.js` (+test), `public/sitemap.xml` (unchanged content, verify). Delete `src/app/sections/{about,skills,writing}` and their i18n keys and specs.

**Interfaces:** Routes = `''` and `'es'` (both `HomePageComponent`, `data.lang`) + `'**'` NotFound. `localizedPath(lang): '/' | '/es/'`. Navbar items scroll to `#<id>` (`<a href="#projects">`, router `anchorScrolling` already on). Language switch → `/es/` ↔ `/`, keeping the current hash.

- [ ] **Step 1: Failing tests** in `index-rewrite.test.mjs`: 301 with `location` for each of `/about`,`/experience`,`/skills` → `/#experience`; `/projects` → `/#projects`; `/contact` → `/#contact`; `/writing` → `/`; same set under `/es/` → `/es/#…`; trailing-slash variants (`/about/`) too; `/es` → rewrite `/es/index.html` (not redirect); unknown `/nope` → `/nope/index.html` (404 handled by CloudFront). `app.routes.spec`: exactly 3 routes.
- [ ] **Step 2:** Implement the `REDIRECTS` map (keys normalized without trailing slash). Run `npm run test:infra && npm test` → PASS.
- [ ] **Step 3:** Build: dist contains only `index.html`, `es/index.html`, `404.html` (+`404/`) as HTML. Commit `♻️ Collapse sections into one page per locale with legacy redirects`.

### Task 3: Hero with the two paths + analytics events

**Files:** Rewrite `src/app/sections/home/hero.component.*`; Create `src/app/core/services/analytics.service.ts` (+spec).

**Interfaces — Produces:** `AnalyticsService.track(event: AnalyticsEvent, params?: Record<string,string>): void`, `type AnalyticsEvent = 'cta_project'|'cta_hire'|'project_open'|'verde_open'|'contact_email'|'contact_linkedin'|'contact_calendar'|'contact_github'`. Calls `window.gtag('event', event, params)` only in the browser, only if `document.cookie` has `analytics_consent=accepted` and `gtag` is a function.

Hero content (keys `hero.*`): status line ("Disponible para proyectos y rol fijo · Guatemala, remoto"), H1 "Dureza técnica, suavidad humana." with the second clause in accent, paragraph (12 años; banca, pasarelas de pago, identidad digital, salud), round photo (`face.webp`, 300×300, `fetchpriority="high"`), two path cards: **Tengo un proyecto →** (turquoise fill, `#283232` text; href `#how-i-work`; event `cta_project`) and **Busco contratar →** (surface card; href `#experience`; event `cta_hire`). Exactly one `<h1>` on the page.

- [ ] **Step 1: Failing tests:** analytics — no consent → gtag not called; consent + gtag → called with args; server platform → no-op. hero — renders one h1, both path links with correct hrefs, clicking each calls `track` with the right event.
- [ ] **Step 2:** Implement → PASS. Commit `✨ Add dual-path hero and consent-gated analytics events`.

### Task 4: Projects section (8 live projects)

**Files:** Create `src/app/sections/projects/projects.data.ts`; rewrite `projects.component.*`; Create `public/projects/<id>-{640,1280}.webp`; Create `scripts/capture-projects.mjs` (one-off, documented in README, not run in CI).

**Interfaces — Produces:** `interface PortfolioProject { id: ProjectId; url: string; tags: string[]; image: { base: string; width: 1280; height: 800 } }`, `type ProjectId = 'sdg19'|'guso'|'sinergia'|'rockers'|'pettzi'|'sar'|'migo'|'pdei'`, `PORTFOLIO_PROJECTS: readonly PortfolioProject[]` in the Global Constraints order. Keys `projects.items.<id>.{title,summary,role}`.

Copy sources (draft EN + ES summaries ≤ 160 chars from these; flag for review):
| id | title | landing says |
|---|---|---|
| sdg19 | SDG19 | Event-driven serverless e-commerce on AWS: Cognito, API Gateway, Lambda, DynamoDB streams, SNS/SQS, SES, Parquet data lake. Angular, Nx, CDK. |
| guso | Guso | Patient healthcare app for appointments, prescriptions and care records — Flutter + NestJS. |
| sinergia | Sinergia Dorada | Volunteer-editable nonprofit site turned fast, accessible infrastructure for dog-assisted therapy in Guatemala. |
| rockers | Rockers 502 MC | Engineering case study: decisions, architecture and process behind the club's site. |
| pettzi | Pettzi | Serverless pet-care platform; Nx, Angular, AWS CDK, Lambda; public architecture reference. |
| sar | SAR | Multi-location restaurant platform: inventory, cash, sales, events, reporting on AWS. |
| migo | Migo Payments | Payment platform for Central America & LatAm, architected and led Nov 2021 – Jun 2022. |
| pdei | Pdei+ | Investment portal: from financial brand guidelines to a tested vanilla UI library. |

Layout (Antracita): section header "Proyectos" + "8 en producción"; first project as a wide feature card (image left 560px, text right), remaining 7 in a responsive grid (3 cols ≥1024px, 2 ≥640px, 1 below) — each card is ONE `<a>` (whole card clickable, visible focus ring), image `loading="lazy"` with width/height + `srcset` 640/1280, domain label in accent, title, summary, 3–4 tag chips. Click → `track('project_open', { project: id })`.

- [ ] **Step 1:** Capture screenshots: `scripts/capture-projects.mjs` with Playwright (`npx playwright@latest` one-off is fine) at 1280×800 viewport, then convert to webp 1280 and 640 wide (≤ 90 kB each; any converter). Commit the images.
- [ ] **Step 2: Failing tests:** data — 8 items, ids/urls/order exactly as above, every image file exists (Karma can't read fs → put this assertion in a `node --test scripts/projects-data.test.mjs` that imports the ids from a small JSON mirror or parses the TS file with a regex). component — renders 8 links with `href` = urls, `target="_blank"`, `rel` includes `noopener`; click tracks event.
- [ ] **Step 3:** Implement → PASS. Commit `✨ Showcase the 8 live projects`.

### Task 5: Verde section

**Files:** Create `src/app/sections/verde/verde.component.*` (+spec).

Content: light (mint) block inside the dark page (inverse in light theme: anthracite block), label "Mi framework", H2 "Verde", text "Vault-Driven Development: un framework para desarrollar aplicaciones con agentes de IA, con roles fijos, memoria fuera del chat y nada integrado sin evidencia." (EN equivalent), CTA "Conocer Verde ↗" → https://verde.fjbatresv.com (`track('verde_open')`), and the five steps V·E·R·D·E = Vault, Encargo, Revisión, Decisión, Evidencia (EN: Vault, Brief, Review, Decision, Evidence) as an ordered list.

- [ ] Test (renders 5 `li`, CTA href, event) → implement → commit `✨ Feature the Verde framework`.

### Task 6: Experience section (timeline + achievements + stack)

**Files:** Rewrite `src/app/sections/experience/*`; delete old skills data usage.

Content: timeline from current data (Banco G&T Continental 2025–present; Halo Media 2023–2025; Truelogic 2022–2023; Yalutec 2021–2022; PayPal 2020–2021; Early journey 2013–2020) with role + 2 bullets each (reuse existing keys, trim to 2). Under the relevant roles add achievements: Journey to Cloud (G&T), Mercer VIP (Halo), Hecho Capriccio, Ascend/Novuskills (early) — reuse `projects.*` copy from the old en/es.json. A "Stack" row of chips: AWS, Azure, NestJS, Angular, Node.js, TypeScript, Python, Nx, DynamoDB, MongoDB, PostgreSQL/MySQL, Redis, GitHub Actions, SonarQube, Observability. Sector line from the brand manual: banca, eventos a gran escala, identidad digital, mensajería transaccional, apps móviles, blockchain, pasarelas de pago, telecom, investigación médica. Ends with a "Busco contratar" CTA → `mailto:` with hire subject (`track('contact_email', { path: 'hire' })`).

- [ ] Tests (6 entries in order, achievements present, mailto subject per locale) → implement → commit `✨ Rework experience with achievements and stack`.

### Task 7: How I work + Contact

**Files:** Create `src/app/sections/how-i-work/*`; rewrite `src/app/sections/contact/*`; footer in `app.component.html`.

How I work (project path): three engagement cards — Arquitectura y revisión técnica; MVP / producto de punta a punta; Migración y DevOps a la nube — each 1 line; plus a 4-step process (Llamada de 30 min → Propuesta → Entrega iterativa → Traspaso documentado). CTA "Agendar llamada ↗" → booking URL (`track('contact_calendar')`).
Contact: H2 "Hablemos", three actions: email (project subject), LinkedIn, booking; GitHub as tertiary link. Footer: logo, © year, links, "Construido con Angular" (keep).

- [ ] Tests (hrefs exact, events) → implement → commit `✨ Add how-I-work and contact sections`.

### Task 8: SEO, structured data, OG image, CSP fonts

**Files:** Modify `src/app/core/seo/*` (Phase 1 `SeoLinksService`; add title/description/OG per locale), Create `src/app/core/seo/json-ld.ts` (+spec), `public/og-image-{en,es}.png` (1200×630, brand: anthracite bg, logo, name, "Solutions Architect", turquoise accent — render from a small HTML file with Playwright, script in `scripts/og-image.mjs`), `scripts/check-seo.mjs` wired into `npm run build` after the inline-script check, `infra/cloudfront/security-headers.js` (+test).

- Titles: EN "Javier Batres — Solutions Architect & Senior Full Stack Engineer"; ES "Javier Batres — Arquitecto de Soluciones y Senior Full Stack Engineer". Descriptions ≤ 155 chars from the hero copy.
- JSON-LD (`<script type="application/ld+json">`, rendered at prerender): `ProfilePage` with `mainEntity` `Person` {name "Javier Batres", alternateName "Fernando Javier Batres Velásquez", jobTitle, url, image (face), sameAs [LinkedIn, GitHub], address country GT, knowsAbout [...stack]} and `hasPart`/`about` an `ItemList` of the 8 projects as `CreativeWork` {name, url, description}.
- `check-seo.mjs` asserts on `browser/index.html` and `browser/es/index.html`: one `<h1>`; `<title>`, meta description, canonical, 3 hreflang links, `og:image` absolute URL, `og:locale`, `twitter:card`, valid JSON parse of the ld+json with `@type` ProfilePage; `es/index.html` contains no `"hero.`/`"projects.` raw keys and has `lang="es"`.
- CSP (`security-headers.js`): remove `https://fonts.googleapis.com` and `https://fonts.gstatic.com`; `font-src 'self'`; keep Report-Only; update the test.

- [ ] Tests → implement → `npm run build` (check-seo green) → commit `🔍️ Add structured data, localized meta, OG images and self-hosted font CSP`.

### Task 9: Polish, a11y, verification, PR

- [ ] Skip link "Saltar al contenido", visible focus rings (2px turquoise outline, offset 3px) in both themes, `prefers-reduced-motion` respected, touch targets ≥ 44px, 375/768/1024/1440 widths without horizontal scroll.
- [ ] `npm run lint && npm run test:coverage && npm run test:infra && npm run build` green.
- [ ] Lighthouse (mobile) on `npx http-server dist/javier-batres-site/browser` for `/` and `/es/` — paste scores.
- [ ] Screenshots: dark+light × EN+ES × 390/1440 in the PR.
- [ ] PR `✨ Phase 2: redesign` with: summary, copy-review checklist for Javier (every new EN/ES string grouped by section), Lighthouse, screenshots, follow-ups (designer SVG/dark logo swap; CSP enforce ~2026-12-03; apply `infra/apply.sh` after merge for the redirects + CSP font change), end with "Implemented by Codex, planned and reviewed by Claude Code."
