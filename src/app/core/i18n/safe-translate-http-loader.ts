import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/browser';

/**
 * Report a translation file load failure to the error tracking system.
 *
 * Sends a warning-level message with the key "Translation load failed" and includes
 * the language and HTTP error metadata as extra context.
 *
 * @param lang - The language code whose translation failed to load (e.g., "en", "fr").
 * @param error - HTTP error details; may include `status` (HTTP status code), `statusText`, and the requested `url`.
 */
export function reportTranslationLoadFailure(
  lang: string,
  error: { status?: number; statusText?: string; url?: string }
): void {
  Sentry.captureMessage('Translation load failed', {
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

  getTranslation(lang: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.prefix}${lang}${this.suffix}`).pipe(
      catchError((error) => {
        reportTranslationLoadFailure(lang, error);
        console.warn(
          `Falling back to empty translations because ${lang} could not be loaded.`,
          error
        );
        return of({});
      })
    );
  }
}