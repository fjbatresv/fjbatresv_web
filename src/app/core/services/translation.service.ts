import { Injectable, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'fj-lang';
  private readonly supported: Array<'en' | 'es'> = ['en', 'es'];

  constructor(
    private readonly translate: TranslateService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  init(): void {
    const stored = localStorage.getItem(this.storageKey) as 'en' | 'es' | null;
    const browserLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
    const lang = stored && this.supported.includes(stored) ? stored : browserLang;
    this.setLanguage(lang);
  }

  setLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    localStorage.setItem(this.storageKey, lang);
    this.document.documentElement.lang = lang;
  }
}
