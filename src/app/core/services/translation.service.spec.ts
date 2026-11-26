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
  const history = { state: { navigationId: 1 }, replaceState: jasmine.createSpy('replaceState') };
  const location = { search: '', hash: '' };
  let browserWindow: Window | null = { history, location } as unknown as Window;
  const docMock = {
    documentElement: { lang: '' },
    get defaultView() {
      return browserWindow;
    },
  } as unknown as Document;

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
    history.replaceState.calls.reset();
    location.search = '';
    location.hash = '';
    browserWindow = { history, location } as unknown as Window;
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

  it('restores the trailing slash on the Spanish root for fragment-only navigation', () => {
    currentUrl = '/es';
    service.init();
    expect(history.replaceState).toHaveBeenCalledWith(history.state, '', '/es/');
  });

  it('keeps the query and fragment while normalizing the Spanish root', () => {
    currentUrl = '/es?ref=linkedin#contact';
    location.search = '?ref=linkedin';
    location.hash = '#contact';
    service.init();
    expect(history.replaceState).toHaveBeenCalledWith(
      history.state,
      '',
      '/es/?ref=linkedin#contact'
    );
  });

  it('does not replace an already-normalized Spanish root', () => {
    currentUrl = '/es/';
    service.init();
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it('does not normalize the Spanish root on the server', () => {
    currentUrl = '/es';
    browserWindow = null;
    service.init();
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it('normalizes the Spanish root after the router completes initial navigation', () => {
    currentUrl = '/es/';
    service.init();
    currentUrl = '/es';
    events.next(new NavigationEnd(1, '/es/', '/es'));
    expect(history.replaceState).toHaveBeenCalledWith(history.state, '', '/es/');
  });

  it('exposes the current language through the getter', () => {
    service.setLanguage('es');
    expect(service.language).toBe('es');
  });
});
