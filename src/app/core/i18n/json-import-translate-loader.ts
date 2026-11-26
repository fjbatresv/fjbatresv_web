import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, catchError, from, map, of } from 'rxjs';
import { reportTranslationLoadFailure } from './report-translation-load-failure';
import { Lang, SUPPORTED_LANGS } from './lang';

export const translationImports: Record<Lang, () => Promise<{ default: TranslationObject }>> = {
  en: () => import('../../../i18n/en.json'),
  es: () => import('../../../i18n/es.json'),
};

@Injectable({ providedIn: 'root' })
export class JsonImportTranslateLoader extends TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    if (!SUPPORTED_LANGS.includes(lang as Lang)) {
      return of({} as TranslationObject);
    }

    return from(translationImports[lang as Lang]()).pipe(
      map((translation) => translation.default),
      catchError((error: unknown) => {
        reportTranslationLoadFailure(lang, {
          statusText: error instanceof Error ? error.message : String(error),
        });
        return of({} as TranslationObject);
      })
    );
  }
}
