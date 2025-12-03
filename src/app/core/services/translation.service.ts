import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'fj-lang';
  private readonly supported: Array<'en' | 'es'> = ['en', 'es'];

  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  init(): void {
    let stored: 'en' | 'es' | null = null;
    try {
      stored = localStorage.getItem(this.storageKey) as 'en' | 'es' | null;
    } catch (err) {
      // Ignore storage access errors
      stored = null;
    }
    const browserLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
    const lang = stored && this.supported.includes(stored) ? stored : browserLang;
    this.setLanguage(lang);
  }

  setLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);
    try {
      localStorage.setItem(this.storageKey, lang);
    } catch (err) {
      // Ignore storage access errors
    }
    this.document.documentElement.lang = lang;
  }
}
