# Javier Batres – Personal Site (Angular)

[![CI (lint & test)](https://github.com/fjbatresv/fjbatresv_web/actions/workflows/ci.yml/badge.svg)](https://github.com/fjbatresv/fjbatresv_web/actions/workflows/ci.yml)
[![Build and Deploy to S3](https://github.com/fjbatresv/fjbatresv_web/actions/workflows/deploy.yml/badge.svg)](https://github.com/fjbatresv/fjbatresv_web/actions/workflows/deploy.yml)
![Angular](https://img.shields.io/badge/Angular-21.x-dd0031?logo=angular)
![Node](https://img.shields.io/badge/Node-24.x-026e00?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=fjbatresv_fjbatresv_web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=fjbatresv_fjbatresv_web)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=fjbatresv_fjbatresv_web&metric=coverage)](https://sonarcloud.io/summary/new_code?id=fjbatresv_fjbatresv_web)

Front-end-only personal website for Fernando Javier Batres Velásquez (Javier). Built with Angular, TypeScript, ngx-translate (EN/ES), and light/dark theming. Static-host ready.

## Highlights

- Responsive personal site with hero, About, Career timeline, Toolkit (skills), Projects, Writing/Talks, and Contact (mailto + socials).
- Dual theme + i18n (EN/ES) toggles, smooth anchors, and NgOptimizedImage for LCP.
- WebP assets (logo/face/OG) and production build with tree shaking; sourcemaps uploaded to Sentry then removed from the deploy artifact.
- Observability-ready: Sentry (traces + replay) via env-driven DSN.
- CI for PRs a `develop`, análisis de SonarCloud, S3 deploy con invalidación opcional de CloudFront, Husky pre-commit, Renovate/Dependabot.

## Stack

- Angular 21, TypeScript, RxJS
- Styling: SCSS + CSS variables (light/dark)
- i18n: ngx-translate (EN/ES)
- Testing: Karma + Jasmine
- Tooling: ESLint + Prettier, Husky pre-commit, GitHub Actions (CI), Renovate/Dependabot
- Infra/Cloud: AWS S3 + optional CloudFront invalidation (deploy workflow)

## Prerequisites

- Node.js 24+
- npm 10+
- `.nvmrc` provided (24.11.1) for consistency

## Installation

```bash
npm install --registry=https://registry.npmjs.org
```

## Development

```bash
npm start
```

Runs the Angular dev server on `http://localhost:4300` with hot reload.

## Tests

```bash
npm test
```

## Lint

```bash
npm run lint
```

## Test coverage

```bash
npm run test:coverage
```

Coverage report will be generated under `coverage/`.

Last local coverage run (headless):

- Statements: 97.70%
- Branches: 81.25%
- Functions: 98.00%
- Lines: 97.32%

## Build

```bash
npm run build
```

Outputs production assets to `dist/javier-batres-site/`.

## Quick scripts

- `npm start` — dev server (4300)
- `npm run lint` — ESLint
- `npm run test` — unit tests (headless)
- `npm run test:coverage` — coverage report in `coverage/`
- `npm run build` — production bundle
- `npm run format` — Prettier on src

## CI

- Pull requests a `develop`: GitHub Actions workflow `.github/workflows/ci.yml` corre lint y tests.
- SonarCloud: `.github/workflows/sonarcloud.yml` corre lint, `npm run test:coverage` (usa `coverage/javier-batres-site/lcov.info`) y envía análisis; requiere secreto `SONAR_TOKEN` y `GITHUB_TOKEN` provisto por Actions.
- Dependabot mantiene npm y GitHub Actions semanalmente (ver `.github/dependabot.yml`).
- Renovate config en `renovate.json`.
- Husky pre-commit corre `npm run lint` (instalar con `npm run prepare` tras deps).

## Serve build locally

```bash
npx http-server dist/javier-batres-site -p 8080
```

(Install `http-server` globally if preferred.)

## CI/CD to Amazon S3 (GitHub Actions)

1. Set repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `S3_BUCKET` (name of your static site bucket)
2. Push to `main` and the workflow will:
   - Use Node from `.nvmrc` with npm cache
   - Install deps with `npm ci --registry=https://registry.npmjs.org`
   - Run `npm run lint` and `npm test`
   - Build optimized artifacts (`ng build --configuration production`)
   - Upload sourcemaps to Sentry, then remove them before deploy
   - Sync `dist/javier-batres-site/` to S3 with `aws s3 sync --delete` (long cache for assets, no-cache for index)
   - (Optional) Invalidate CloudFront if `CLOUDFRONT_DISTRIBUTION_ID` is set

If you need CloudFront cache invalidation, add `CLOUDFRONT_DISTRIBUTION_ID` and extend the workflow with `aws cloudfront create-invalidation`.

## Notes

- Images live in `src/assets/` and are referenced locally (no external fetch needed).
- Build uses Angular production optimizations (AOT, build optimizer, tree shaking).
- Commits use gitmoji; a commit-msg hook enforces gitmoji or `:emoji:` prefix (e.g., `✨ add hero animations`, `:bug: fix navbar overlap`). Install hooks with `npm run prepare` after `npm install`.

### Gitmoji quick reference

- `✨` / `:sparkles:` — Feature
- `🐛` / `:bug:` — Fix
- `🧪` / `:test_tube:` — Tests/coverage
- `📚` / `:books:` — Docs/README
- `🎨` / `:art:` — UI/UX/Styling
- `🔧` / `:wrench:` — Chore/tooling
- `🚀` / `:rocket:` — Performance/deploy

## Lighthouse (latest local run)

- Performance: 92
- Accessibility: 100
- Best Practices: 100
- SEO: 100
(Measured against the production build, served locally; run your own audit for fresh numbers.)

## Project structure (essentials)

```text
src/
  app/
    core/              # navbar, theme/lang services
    sections/          # hero, about, experience, skills, projects, writing, contact
    app.config.ts      # routing, i18n, Sentry init
    app.routes.ts
  assets/
    i18n/              # en.json, es.json
    logo.webp
    face.webp
    og-image.webp
```

## Contact

- Email: <fjbatresv@gmail.com>
- LinkedIn: [https://www.linkedin.com/in/fjbatresv](https://www.linkedin.com/in/fjbatresv)
- GitHub: [https://github.com/fjbatresv](https://github.com/fjbatresv)
