import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translate: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: 'es-ES',
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslationService],
    });

    service = TestBed.inject(TranslationService);
    translate = TestBed.inject(TranslateService);
  });

  it('should initialize using browser language when no storage', () => {
    service.init();
    expect(translate.currentLang).toBe('es');
    expect(localStorage.getItem('fj-lang')).toBe('es');
  });

  it('should set language and persist it', () => {
    service.setLanguage('en');
    expect(translate.currentLang).toBe('en');
    expect(localStorage.getItem('fj-lang')).toBe('en');
  });
});
