import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'fj-lang';
  private readonly supported: Array<'en' | 'es'> = ['en', 'es'];

  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);

  private getStorage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (err) {
      console.warn('Local storage is not available', err);
      return null;
    }
  }

  init(): void {
    const storage = this.getStorage();
    const stored = storage?.getItem?.(this.storageKey) as 'en' | 'es' | null;
    const browserLang = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
    const lang = stored && this.supported.includes(stored) ? stored : browserLang;
    this.setLanguage(lang);
  }

  setLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    this.translate.setFallbackLang(lang);
    const storage = this.getStorage();
    storage?.setItem?.(this.storageKey, lang);
    this.document.documentElement.lang = lang;
  }
}
