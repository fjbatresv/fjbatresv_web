import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { Lang, langFromUrl } from '../i18n/lang';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLanguage: Lang = 'en';
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  init(): void {
    const currentUrl = this.router.url;
    this.setLanguage(langFromUrl(currentUrl));
    this.normalizeSpanishRoot();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.setLanguage(langFromUrl(event.urlAfterRedirects));
        this.normalizeSpanishRoot();
      });
  }

  private normalizeSpanishRoot(): void {
    if (this.router.url.split(/[?#]/, 1)[0] !== '/es') return;
    const history = this.document.defaultView?.history;
    if (typeof history?.replaceState === 'function') {
      history.replaceState(history.state, '', '/es/');
    }
  }

  setLanguage(lang: Lang): void {
    this.currentLanguage = lang;
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
  }

  get language(): Lang {
    return this.currentLanguage;
  }
}
