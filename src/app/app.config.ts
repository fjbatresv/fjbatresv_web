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

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { JsonImportTranslateLoader } from './core/i18n/json-import-translate-loader';

export const sentryErrorClient = {
  captureException: (error: unknown): Promise<void> => {
    return import('@sentry/browser').then((Sentry) => {
      Sentry.captureException(error);
    });
  },
};

export class SentryErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    sentryErrorClient.captureException(error);
    console.error(error);
  }
}

export async function initializeSentry(): Promise<void> {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || !environment.sentryDsn) return;
  const Sentry = await import('@sentry/browser');
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
