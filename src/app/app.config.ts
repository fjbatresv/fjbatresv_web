import {
  ApplicationConfig,
  ErrorHandler,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import * as Sentry from '@sentry/browser';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { JsonImportTranslateLoader } from './core/i18n/json-import-translate-loader';

export const sentryErrorClient = { captureException: Sentry.captureException.bind(Sentry) };

export class SentryErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    sentryErrorClient.captureException(error);
    console.error(error);
  }
}

export function initializeSentry(): void {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || !environment.sentryDsn) return;
  /* istanbul ignore next -- Sentry init depends on browser environment configuration */
  Sentry.init({
    dsn: environment.sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    tracesSampleRate: 0.3,
    replaysSessionSampleRate: 0.3,
    replaysOnErrorSampleRate: 0.8,
    environment: environment.production ? 'production' : 'development',
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    provideTranslateService({
      fallbackLang: 'en',
      lang: 'en',
      loader: provideTranslateLoader(JsonImportTranslateLoader),
    }),
    provideClientHydration(),
    provideAppInitializer(initializeSentry),
    { provide: ErrorHandler, useClass: SentryErrorHandler },
  ],
};
