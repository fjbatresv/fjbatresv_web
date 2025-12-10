import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateSpy: { use: jasmine.Spy; setFallbackLang: jasmine.Spy };
  const docMock = { documentElement: { lang: '' } } as Document;

  beforeEach(() => {
    translateSpy = {
      use: jasmine.createSpy('use'),
      setFallbackLang: jasmine.createSpy('setFallbackLang'),
    };

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: translateSpy },
        { provide: DOCUMENT, useValue: docMock },
      ],
    });

    service = TestBed.inject(TranslationService);
    translateSpy.use.calls.reset();
    translateSpy.setFallbackLang.calls.reset();
    docMock.documentElement.lang = '';
  });

  it('setLanguage applies language, saves it and updates html lang', () => {
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.setLanguage('es');

    expect(translateSpy.use).toHaveBeenCalledWith('es');
    expect(translateSpy.setFallbackLang).toHaveBeenCalledWith('es');
    expect(docMock.documentElement.lang).toBe('es');
    expect(setItemSpy).toHaveBeenCalledWith('fj-lang', 'es');
  });

  it('init uses stored language when available', () => {
    spyOn(localStorage, 'getItem').and.returnValue('es');
    const setLanguageSpy = spyOn(service, 'setLanguage').and.callThrough();

    service.init();

    expect(setLanguageSpy).toHaveBeenCalledWith('es');
  });

  it('init falls back to browser language when nothing stored', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOnProperty(window.navigator, 'language', 'get').and.returnValue('en-US');
    const setLanguageSpy = spyOn(service, 'setLanguage').and.callThrough();

    service.init();

    expect(setLanguageSpy).toHaveBeenCalledWith('en');
  });

  it('init uses browser Spanish when available', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOnProperty(window.navigator, 'language', 'get').and.returnValue('es-ES');
    const setLanguageSpy = spyOn(service, 'setLanguage').and.callThrough();

    service.init();

    expect(setLanguageSpy).toHaveBeenCalledWith('es');
  });

  it('handles storage access errors gracefully', () => {
    spyOnProperty(window, 'localStorage', 'get').and.throwError('blocked');
    const consoleSpy = spyOn(console, 'warn');

    service.init();

    expect(consoleSpy).toHaveBeenCalled();
  });
});
