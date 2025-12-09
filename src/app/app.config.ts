import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import * as Sentry from '@sentry/browser';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { SafeTranslateHttpLoader } from './core/i18n/safe-translate-http-loader';

export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new SafeTranslateHttpLoader(http, './assets/i18n/', '.json');
}

const sentryDsn = environment.sentryDsn;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Safer defaults; unmask selectively if required
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.3,
    replaysSessionSampleRate: 0.3,
    replaysOnErrorSampleRate: 0.8,
    environment: environment.production ? 'production' : 'development',
  });
}

class SentryErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    Sentry.captureException(error);
    // Log for local visibility without re-throwing to avoid duplicate handling
    console.error(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ],
};
