import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/browser';

export const runtimeContext = {
  hasKarma: (): boolean => {
    const globalObj = globalThis as typeof globalThis & { __karma__?: unknown };
    return Boolean(globalObj.__karma__);
  },
  hasJasmine: (): boolean => {
    const globalObj = globalThis as typeof globalThis & { jasmine?: unknown };
    return Boolean(globalObj.jasmine);
  },
  pathname: (): string => (typeof location !== 'undefined' ? location.pathname : ''),
};

const isTestRun = (): boolean =>
  runtimeContext.hasKarma() ||
  runtimeContext.hasJasmine() ||
  runtimeContext.pathname().includes('context.html');

export const sentryClient = {
  captureMessage: Sentry.captureMessage.bind(Sentry),
};

/**
 * Report a translation file load failure to the error tracking system.
 *
 * Does nothing when running in a test environment; otherwise sends a warning-level
 * message labeled "Translation load failed" with the language and HTTP error metadata
 * included as extra context.
 *
 * @param lang - Language code whose translation failed to load (e.g., "en", "fr")
 * @param error - HTTP error details; may include `status`, `statusText`, and `url`
 */
export function reportTranslationLoadFailure(
  lang: string,
  error: { status?: number; statusText?: string; url?: string }
): void {
  if (isTestRun()) {
    return;
  }

  sentryClient.captureMessage('Translation load failed', {
    level: 'warning',
    extra: {
      lang,
      status: error?.status,
      statusText: error?.statusText,
      url: error?.url,
    },
  });
}

/**
 * Wraps the default HTTP loader so translation fetch failures
 * don't bubble as unhandled promise rejections.
 */
export class SafeTranslateHttpLoader implements TranslateLoader {
  constructor(
    private readonly http: HttpClient,
    private readonly prefix = './assets/i18n/',
    private readonly suffix = '.json'
  ) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`${this.prefix}${lang}${this.suffix}`).pipe(
      catchError((error) => {
        reportTranslationLoadFailure(lang, error);
        console.warn(
          `Falling back to empty translations because ${lang} could not be loaded.`,
          error
        );
        return of({} as TranslationObject);
      })
    );
  }
}
