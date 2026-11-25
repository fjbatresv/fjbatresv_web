# Phase 1 — Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close dependency vulnerabilities, prerender EN + `/es/` routes, make the site CSP-ready, add security headers / index rewrite / 404 as CloudFront IaC, and move deploy to GitHub OIDC — with no visible UI change.

**Architecture:** Angular 22 with the esbuild `@angular/build:application` builder and `outputMode: "static"` prerenders every route for both locales into `dist/javier-batres-site/browser/`. Translations load via dynamic `import()` of JSON so they work at prerender time and in the browser. AWS changes live in `infra/` as JSON + an idempotent `apply.sh` (AWS CLI); the CloudFront Function is unit-tested with `node --test`.

**Tech Stack:** Angular 22, @angular/ssr, ngx-translate 17, Sentry browser, Karma/Jasmine (or Angular 22 default runner), AWS CLI v2, CloudFront Functions (cloudfront-js-2.0), GitHub Actions OIDC.

**Spec:** `docs/superpowers/specs/2026-11-25-hardening-redesign-design.md` (§6 is this phase).

## Global Constraints

- Branch: `fjbatresv/hardening`, PR to `main`. Commits use gitmoji (Husky `commit-msg` hook); pre-commit runs `npm run lint`. End commit messages with `Co-Authored-By` line given by your harness if any.
- Node from `.nvmrc` (24.11.1). Components: standalone + `ChangeDetectionStrategy.OnPush` + `inject()`; selector prefix `app`.
- **No visible UI change** vs production (EN/ES, light/dark, mobile/desktop).
- Coverage must not drop below today's (Statements 97.70 / Branches 81.25 / Functions 98.00 / Lines 97.32). LCOV path stays `coverage/javier-batres-site/lcov.info` (Sonar reads it).
- Every `overrides` entry keeps a matching `x-overrides-metadata` entry (reason, introducedOn, verifiedOn, removeWhen).
- Exit: `npm audit --omit=dev` → 0 vulnerabilities; `npm audit` → 0 critical/high, or each remaining one listed in the PR body with reason.
- No inline executable `<script>` and no `on*=` attributes in any built HTML (CSP has no `'unsafe-inline'` for scripts).
- AWS identifiers: account `605134457500`, distribution `E2EV9RW3Q35Z60`, bucket `fjbatresv-web`, OIDC provider `arn:aws:iam::605134457500:oidc-provider/token.actions.githubusercontent.com`, repo `fjbatresv/fjbatresv_web`.
- **Do not run any AWS write command.** Write the IaC and dry-run output only; Claude applies it.

## Review Focus

1. Deep link loaded directly (`/projects`, `/es/contact`) must render that route's prerendered HTML in the right language and scroll to the section after hydration — test in Task 3 (route/lang spec) and Task 7 (dist check).
2. Visitor with dark theme stored must not see a light flash before Angular boots — Task 4 `theme-init.js` test.
3. GA consent: Accept loads gtag, Reject clears `_ga*` cookies, banner text follows `<html lang>` — Task 4 consent spec.
4. CloudFront rewrite must leave real files (`/main-ABC.js`, `/assets/logo.webp`, `/privacy-policy.pdf`) untouched and keep query strings — Task 6 function tests.
5. Chunk-load failure recovery (`DeferErrorComponent` one-time reload) must not run during prerender — Task 3 SSR-safety test.

---

### Task 1: Angular 22 + application builder

**Files:**
- Modify: `package.json`, `package-lock.json`, `angular.json`, `tsconfig*.json`, `karma.conf.js` (or replace runner), `src/test.ts` if needed
- Modify: `src/main.ts` only if migrations require

**Interfaces:**
- Produces: `npm run build` emits `dist/javier-batres-site/browser/**`; `npm test`, `npm run test:coverage`, `npm run lint` keep working with same names.

- [x] **Step 1:** `npx ng update @angular/core@22 @angular/cli@22` then `npx ng update @angular-eslint/schematics` (or bump angular-eslint packages to the 22-compatible major). Accept the official migrations, including the builder migration to `@angular/build:application`. Remove `@angular-devkit/build-angular`. Bump TypeScript to the version Angular 22 requires.
- [x] **Step 2:** In `angular.json` production config keep budgets (initial warn 900kb / error 1mb; anyComponentStyle 4kb/8kb), hidden sourcemaps, `outputHashing: "all"`, fileReplacements. Set `"optimization": { "scripts": true, "styles": { "minify": true, "inlineCritical": false }, "fonts": true }` (inlineCritical emits an inline `onload` handler that CSP would block).
- [x] **Step 3:** Test runner: keep Karma via `@angular/build:karma` if it works; otherwise move to Angular 22's default runner. Either way `npm run test:coverage` must write `coverage/javier-batres-site/lcov.info`. Note the choice in the PR.
- [x] **Step 4:** Remove unused runtime deps `lodash` and `tar` from `dependencies` (no imports in `src/`; verify with `grep -rn "lodash\|'tar'" src`).
- [x] **Step 5:** Run `npm run lint && npm run test:coverage && npm run build`. Expected: all pass, coverage ≥ Global Constraints, no budget error.
- [x] **Step 6:** Commit `⬆️ Upgrade to Angular 22 and application builder`.

### Task 2: Dependency audit cleanup

**Files:** `package.json`, `package-lock.json`

- [x] **Step 1:** `npx npm-check-updates -u --target minor` for non-Angular deps, then majors one by one where compatible (ngx-translate, @sentry/browser, @sentry/cli, eslint plugins, svgo, husky, gitmoji-cli). `npm install`.
- [x] **Step 2:** For each `overrides` entry: delete it, `npm install`, `npm audit`. If the advisory is gone, leave it deleted (and its metadata). If not, restore with today's `verifiedOn: "2026-11-25"`. Add new pins only for remaining high/critical with a fixed version available, each with full metadata.
- [x] **Step 3:** Run `npm audit --omit=dev` → expected `found 0 vulnerabilities`. Run `npm audit --audit-level=high` → expected exit 0, or list leftovers (package, advisory, dev-only reason) in `docs/security/audit-2026-11-25.md` for the PR body.
- [x] **Step 4:** `npm run lint && npm run test:coverage && npm run build` pass.
- [x] **Step 5:** Commit `🔒️ Resolve dependency vulnerabilities and refresh override pins`.

### Task 3: SSG with EN + `/es/` routes, SSR-safe code

**Files:**
- Create: `src/main.server.ts`, `src/app/app.config.server.ts`, `src/app/app.routes.server.ts`
- Create: `src/app/core/i18n/json-import-translate-loader.ts` (+ `.spec.ts`)
- Delete: `src/app/core/i18n/safe-translate-http-loader.ts` (+ spec)
- Move: `src/assets/i18n/{en,es}.json` → `src/i18n/{en,es}.json`
- Create: `src/app/core/i18n/lang.ts`
- Modify: `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/core/services/translation.service.ts`, `src/app/core/services/theme.service.ts`, `src/app/sections/home/home-page.component.ts`, `src/app/core/components/defer-error/defer-error.component.ts`, `src/app/core/components/navbar/navbar.component.ts|html`, `angular.json`, specs of each.

**Interfaces:**
- Produces:
  - `type Lang = 'en' | 'es'`; `const SUPPORTED_LANGS: readonly Lang[]`; `function langFromUrl(url: string): Lang` (`/es` or `/es/...` → `'es'`, else `'en'`); `function localizedPath(section: string, lang: Lang): string` (`('home','en')→'/'`, `('home','es')→'/es'`, `('contact','es')→'/es/contact'`) — all in `lang.ts`.
  - `class JsonImportTranslateLoader implements TranslateLoader { getTranslation(lang: string): Observable<TranslationObject> }` — `from(import(\`../../../i18n/${lang}.json\`))` mapped to `.default`; on error reports to Sentry (same Karma/Jasmine guard as the old loader) and emits `{}`.
  - Routes: the existing 7 section routes, plus the same 7 under `es` (`es`, `es/about`, …, `es/contact`), each with `data: { section, lang }`. Add a `'**'` route rendering a `NotFoundComponent` (create `src/app/sections/not-found/not-found.component.ts`, bilingual via translate keys `notFound.title`, `notFound.body`, `notFound.cta`) — replaces today's `redirectTo: ''`.
  - `TranslationService.setLanguage(lang: Lang): void` no longer touches localStorage; language is set from route `data.lang` on every `NavigationEnd` (and at prerender). `<html lang>` set via `DOCUMENT`.
  - `NavbarComponent.setLanguage(lang)` navigates to `localizedPath(currentSection, lang)`; `navigate(section)` uses `localizedPath(section, currentLanguage)`.
- First-visit behavior: **no automatic redirect** to `/es/` (decided: protects LCP; URL is the source of truth).

- [x] **Step 1: Failing tests** in `lang.spec.ts`: `langFromUrl('/es') === 'es'`, `langFromUrl('/es/contact?x=1') === 'es'`, `langFromUrl('/estimate') === 'en'`, `langFromUrl('/') === 'en'`; `localizedPath` table above. In `app.routes.spec.ts`: 15 routes; every `es/*` route has `data.lang === 'es'`; `'**'` loads NotFoundComponent. In `json-import-translate-loader.spec.ts`: `getTranslation('es')` emits object with `nav.home === 'Inicio'` (whatever es.json holds); unknown lang emits `{}`. In `home-page.component.spec.ts` / `defer-error` spec: with `PLATFORM_ID = 'server'`, no `document.getElementById`/`location.reload`/`sessionStorage` access (spy asserts not called).
- [x] **Step 2:** Run `npm test` → new tests FAIL.
- [x] **Step 3:** `npx ng add @angular/ssr` then set `"outputMode": "static"` and `"prerender": true` in `angular.json`; `app.routes.server.ts` = `[{ path: '**', renderMode: RenderMode.Prerender }]` with the 404 route prerendered so the build emits `browser/404.html` (if Angular names it `404/index.html`, add a post-build copy step in `package.json` `build` script: `ng build --configuration production && node scripts/postbuild.mjs`, which copies it to `browser/404.html`). Use `provideClientHydration()` **without** `withEventReplay()` (event replay injects an inline script).
- [x] **Step 4:** Implement `lang.ts`, the loader, routes, service/component changes. Guard browser-only code with `isPlatformBrowser(inject(PLATFORM_ID))` or `afterNextRender`. Move Sentry `init` behind a browser check (still `/* istanbul ignore next */`). `ThemeService` reads `localStorage`/`matchMedia` only in the browser.
- [x] **Step 5:** `npm run test:coverage` → PASS, coverage ≥ constraints. `npm run build` → `ls dist/javier-batres-site/browser/{index.html,projects/index.html,es/index.html,es/contact/index.html,404.html}` all exist; `grep -c 'Featured Projects' dist/javier-batres-site/browser/projects/index.html` ≥ 1; `grep -c 'lang="es"' dist/javier-batres-site/browser/es/index.html` = 1.
- [x] **Step 6:** Commit `✨ Prerender EN and /es routes with SSR-safe services`.

### Task 4: Externalize consent + theme bootstrap scripts

**Files:**
- Create: `public/consent.js`, `public/theme-init.js`, `src/app/core/scripts/consent.spec.ts`, `src/app/core/scripts/theme-init.spec.ts` (specs load the files' source and execute it against the test DOM)
- Modify: `src/index.html` (remove inline `<script>` and the `<style>` block moves to `src/styles.scss`), `angular.json` assets (add `{ "glob": "**/*", "input": "public" }` if the migration didn't)

**Interfaces:**
- `index.html` head: `<script src="/consent.js" defer></script>`; first child of `<body>`: `<script src="/theme-init.js"></script>` (synchronous, sets `theme-light|theme-dark` on `document.body` from `localStorage['fj-theme']` or `prefers-color-scheme`, same keys `ThemeService` uses).
- `consent.js` keeps behavior of today's inline IIFE (measurement ID `G-MSCC45EHNV`, cookie `analytics_consent`, 365 days, EN/ES text) but builds the policy link with `document.createElement('a')` + `textContent` — no `innerHTML`.

- [ ] **Step 1: Failing tests:** consent — no stored cookie → banner visible; click accept → cookie `analytics_consent=accepted` and a `script[src*="googletagmanager.com/gtag/js?id=G-MSCC45EHNV"]` exists; click reject → `_ga` test cookie cleared and gtag script removed; `<html lang="es">` → button text `Aceptar`; message node contains an `<a href="/privacy-policy.pdf">` and `innerHTML` was never used (spy on `Element.prototype` setter). theme-init — stored `dark` → `body.classList.contains('theme-dark')`; nothing stored + matchMedia dark → `theme-dark`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the two files and edit `index.html`.
- [ ] **Step 4:** Create `scripts/check-inline-scripts.mjs`: walks `dist/javier-batres-site/browser/**/*.html`, fails (exit 1, listing file + snippet) on any `<script>` without `src` whose `type` is not `application/json`/`application/ld+json`, and on any attribute matching `/\son[a-z]+=/i`. Wire into `package.json` `build` after postbuild. Run `npm run build` → exits 0.
- [ ] **Step 5:** `npm run test:coverage` PASS. Commit `🔒️ Move consent and theme bootstrap out of inline scripts`.

### Task 5: robots.txt + sitemap.xml

**Files:** Create `public/robots.txt`, `public/sitemap.xml`

- [ ] **Step 1:** `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://fjbatresv.com/sitemap.xml`.
- [ ] **Step 2:** `sitemap.xml`: URLs for the 14 locale routes (`https://fjbatresv.com/`, `/about` … and `/es`, `/es/about` …) with `xhtml:link rel="alternate" hreflang="en|es|x-default"` per pair. (Phase 2 replaces it.)
- [ ] **Step 3:** `npm run build` → both files in `dist/.../browser/`. Validate XML with `xmllint --noout public/sitemap.xml`. Commit `🔍️ Add robots.txt and sitemap.xml`.

### Task 6: CloudFront + IAM as code

**Files:**
- Create: `infra/cloudfront/index-rewrite.js`, `infra/cloudfront/index-rewrite.test.mjs`, `infra/cloudfront/security-headers-policy.json`, `infra/iam/gha-deploy-trust.json`, `infra/iam/gha-deploy-policy.json`, `infra/apply.sh`, `infra/README.md`
- Modify: `package.json` script `"test:infra": "node --test infra/"`, `.github/workflows/ci.yml` (run `npm run test:infra`)

**Interfaces:**
- `index-rewrite.js`: cloudfront-js-2.0 `function handler(event)`. Rules in order:
  1. Phase-2 placeholder: none yet (keep a `REDIRECTS = {}` map, `uri → location`, returning 301 when matched).
  2. If last path segment contains `.` → return request unchanged.
  3. `/` stays `/` (DefaultRootObject). Otherwise strip trailing `/` and append `/index.html` (`/es` → `/es/index.html`, `/projects/` → `/projects/index.html`).
  Query string untouched.
- Test harness: read file text, `new Function(src + '\nreturn handler;')()` → call with `{ request: { uri, querystring: { a: { value: '1' } } } }`.
- `security-headers-policy.json`: `ResponseHeadersPolicyConfig` named `fjbatresv-security-headers` with: HSTS `max-age=31536000` (IncludeSubdomains false, Preload false, Override true); ContentTypeOptions; FrameOptions DENY; ReferrerPolicy `strict-origin-when-cross-origin`; custom header `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`; custom header `Content-Security-Policy-Report-Only` with value from spec §6.3 plus `worker-src 'self' blob:` (Sentry Replay worker) and `report-uri __SENTRY_CSP_REPORT_URI__` (placeholder substituted by `apply.sh` from env `SENTRY_CSP_REPORT_URI`).
- `gha-deploy-trust.json`: Federated = OIDC provider ARN; `sts:AssumeRoleWithWebIdentity`; conditions `token.actions.githubusercontent.com:aud = sts.amazonaws.com` and `:sub = repo:fjbatresv/fjbatresv_web:ref:refs/heads/main`.
- `gha-deploy-policy.json`: exactly the current `fjbatresv_gh_action_deploy` document: `cloudfront:CreateInvalidation` on `arn:aws:cloudfront::605134457500:distribution/E2EV9RW3Q35Z60`; `s3:ListBucket`,`s3:PutObject`,`s3:DeleteObject` on `arn:aws:s3:::fjbatresv-web` and `/*`.
- `apply.sh [--dry-run]`: `set -euo pipefail`; requires `AWS_PROFILE`, `SENTRY_CSP_REPORT_URI`. Idempotent create-or-update of: function `fjbatresv-index-rewrite` (+ publish), headers policy, role `fjbatresv-web-gha-deploy` with inline policy `deploy`; then `get-distribution-config` → `jq` to set on DefaultCacheBehavior `FunctionAssociations` (viewer-request) + `ResponseHeadersPolicyId`, and `CustomErrorResponses` 403 and 404 → `ResponsePagePath=/404.html`, `ResponseCode=404`, `ErrorCachingMinTTL=60` → `update-distribution --if-match`. `--dry-run` prints the diff of the distribution config and every intended call without executing writes.

- [ ] **Step 1: Failing tests** (`index-rewrite.test.mjs`): `/`→`/`; `/projects`→`/projects/index.html`; `/projects/`→`/projects/index.html`; `/es`→`/es/index.html`; `/es/contact`→`/es/contact/index.html`; `/main-ABC123.js`, `/assets/logo.webp`, `/privacy-policy.pdf`, `/robots.txt` unchanged; querystring object identical after rewrite.
- [ ] **Step 2:** `npm run test:infra` → FAIL. Implement → PASS.
- [ ] **Step 3:** `bash -n infra/apply.sh` and `shellcheck infra/apply.sh` (if installed) clean; all JSON valid via `jq . file`.
- [ ] **Step 4:** `infra/README.md`: what each file does, rollout order (deploy build → `apply.sh --dry-run` → `apply.sh` → verify → invalidate), how to flip CSP from Report-Only to enforced (rename header in JSON, re-run).
- [ ] **Step 5:** Commit `🔧 Add CloudFront function, headers policy and OIDC role as code`.

### Task 7: Deploy/CI workflows

**Files:** Modify `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`, `.github/workflows/sonarcloud.yml`; Create `.github/PULL_REQUEST_TEMPLATE` checklist line if template exists.

- [ ] **Step 1:** `deploy.yml`: `configure-aws-credentials` with `role-to-assume: arn:aws:iam::605134457500:role/fjbatresv-web-gha-deploy`, `aws-region: ${{ secrets.AWS_REGION }}`; remove access-key inputs. Paths now `dist/javier-batres-site/browser`. Sync: `aws s3 sync … --delete --exclude "*.html" --cache-control "public, max-age=31536000, immutable"` then `aws s3 sync … --exclude "*" --include "*.html" --include "robots.txt" --include "sitemap.xml" --cache-control "no-cache"` (with `--content-type text/html` only for html). Sentry upload path updated. Keep invalidation.
- [ ] **Step 2:** All workflows: top-level `permissions: contents: read` (deploy adds `id-token: write`); pin every third-party action to a full commit SHA with `# vX.Y.Z` comment. `ci.yml` adds `npm audit --omit=dev --audit-level=high` and `npm run test:infra`; its `paths` filter adds `public/**`, `infra/**`, `scripts/**`.
- [ ] **Step 3:** Validate with `npx --yes action-validator .github/workflows/*.yml` (or `actionlint` if available) → no errors.
- [ ] **Step 4:** Commit `👷 Deploy via GitHub OIDC, pin actions, add audit gate`.

### Task 8: Verification + PR

- [ ] **Step 1:** `npm ci && npm run lint && npm run test:coverage && npm run test:infra && npm run build` → all green; paste coverage summary.
- [ ] **Step 2:** Serve `dist/javier-batres-site/browser` with `npx http-server -p 4310` (simulating rewrite is not needed locally — open `/projects/index.html` and `/es/contact/index.html`). Screenshot EN/ES × light/dark × 390px/1440px of `/` and compare to production `https://fjbatresv.com/` — expect no visible differences. Browser console: no errors.
- [ ] **Step 3:** Push branch `fjbatresv/hardening`, open PR to `main` (gitmoji title `🔒️ Phase 1: hardening`), body: summary, audit before/after numbers, leftover advisories (from Task 2), test-runner choice, screenshots, and checklist:
  - [ ] Claude: `infra/apply.sh --dry-run` reviewed, then applied after merge+deploy
  - [ ] Claude: verify `curl -I https://fjbatresv.com/projects` 200, headers present, `/nope` 404
  - [ ] Javier: GitHub secrets `AWS_ACCESS_KEY_ID/SECRET` removed after first green OIDC deploy; Claude deactivates `fjbatresv-web` key
  - [ ] Javier: stop using root credentials (Identity Center admin), deactivate/delete root access key
  - [ ] Claude: flip CSP to enforced after ~1 week without unexpected reports
