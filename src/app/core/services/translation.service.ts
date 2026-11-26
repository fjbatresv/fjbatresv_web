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
    this.setLanguage(langFromUrl(this.router.url));
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => this.setLanguage(langFromUrl(event.urlAfterRedirects)));
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
