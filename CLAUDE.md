# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server at http://localhost:4300
npm test               # unit tests (headless, no watch)
npm run test:coverage  # unit tests + coverage report under coverage/
npm run lint           # ESLint
npm run format         # Prettier on src/**
npm run build          # production bundle → dist/javier-batres-site/
```

Run a single spec file by passing the `--include` flag to karma via the angular config, or target a specific describe with `fdescribe`/`fit` (remove before committing).

## Architecture

Single-page Angular 21 personal site. All routes (`/`, `/about`, `/experience`, `/skills`, `/projects`, `/writing`, `/contact`) load the same `HomePageComponent`, which scrolls to the matching `id` anchor using `ActivatedRoute.snapshot.data['section']`.

```
src/app/
  app.config.ts        # providers: router, HttpClient, ngx-translate, SentryErrorHandler
  app.routes.ts        # all paths → HomePageComponent with data.section
  core/
    components/navbar/ # top nav with theme + language toggles
    i18n/              # SafeTranslateHttpLoader (catches HTTP errors, reports to Sentry)
    services/
      theme.service.ts        # light/dark via body class; persisted in localStorage (key: fj-theme)
      translation.service.ts  # EN/ES via ngx-translate; persisted in localStorage (key: fj-lang)
  sections/            # standalone components: hero, about, experience, skills, projects, writing, contact
```

Translation strings live in `src/assets/i18n/en.json` and `es.json`. Add keys to both files whenever adding new copy.

Theming uses CSS variables toggled by `theme-light` / `theme-dark` body classes — no Angular Material, no Tailwind.

Sentry is initialized in `app.config.ts` only when `environment.sentryDsn` is non-empty. The production DSN is injected at build time via `environment.prod.ts` (not committed).

## Commits

Commits must be prefixed with a gitmoji or `:emoji:` shortcode — enforced by the `commit-msg` Husky hook. The pre-commit hook runs `npm run lint`.

Common prefixes: `✨`/`:sparkles:` feature · `🐛`/`:bug:` fix · `🎨`/`:art:` UI · `🧪`/`:test_tube:` tests · `🔧`/`:wrench:` chore · `🚀`/`:rocket:` perf/deploy · `📚`/`:books:` docs.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): runs lint + tests on PRs to `develop`.
- **SonarCloud** (`.github/workflows/sonarcloud.yml`): runs `test:coverage`, sends `coverage/javier-batres-site/lcov.info`.
- **Deploy** (`.github/workflows/deploy.yml`): triggered on push to `main`; builds, uploads sourcemaps to Sentry, strips them, syncs `dist/javier-batres-site/` to S3.
