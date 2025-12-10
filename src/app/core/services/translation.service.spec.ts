import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let translateSpy: { use: jasmine.Spy; setDefaultLang: jasmine.Spy };
  const docMock = { documentElement: { lang: '' } } as Document;

  beforeEach(() => {
    translateSpy = {
      use: jasmine.createSpy('use'),
      setDefaultLang: jasmine.createSpy('setDefaultLang'),
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
    translateSpy.setDefaultLang.calls.reset();
    docMock.documentElement.lang = '';
  });

  it('setLanguage applies language, saves it and updates html lang', () => {
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.setLanguage('es');

    expect(translateSpy.use).toHaveBeenCalledWith('es');
    expect(translateSpy.setDefaultLang).toHaveBeenCalledWith('es');
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
});
