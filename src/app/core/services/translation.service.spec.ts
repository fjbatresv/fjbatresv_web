import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let events: Subject<NavigationEnd>;
  let currentUrl: string;
  const translateSpy = { use: jasmine.createSpy('use') };
  const docMock = { documentElement: { lang: '' } } as Document;

  beforeEach(() => {
    events = new Subject<NavigationEnd>();
    currentUrl = '/';
    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TranslateService, useValue: translateSpy },
        { provide: DOCUMENT, useValue: docMock },
        {
          provide: Router,
          useValue: {
            get url() {
              return currentUrl;
            },
            events: events.asObservable(),
          },
        },
      ],
    });
    service = TestBed.inject(TranslationService);
    translateSpy.use.calls.reset();
    docMock.documentElement.lang = '';
  });

  it('sets the requested language and html lang without localStorage', () => {
    const storage = spyOn(localStorage, 'setItem');
    service.setLanguage('es');
    expect(translateSpy.use).toHaveBeenCalledWith('es');
    expect(docMock.documentElement.lang).toBe('es');
    expect(storage).not.toHaveBeenCalled();
  });

  it('initializes from the current route and tracks later navigations', () => {
    currentUrl = '/es/contact';
    service.init();
    expect(service.language).toBe('es');
    expect(docMock.documentElement.lang).toBe('es');

    events.next(new NavigationEnd(1, '/es/contact', '/projects'));
    expect(service.language).toBe('en');
    expect(translateSpy.use).toHaveBeenCalledWith('en');
  });

  it('exposes the current language through the getter', () => {
    service.setLanguage('es');
    expect(service.language).toBe('es');
  });
});
