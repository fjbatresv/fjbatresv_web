import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SeoLinksService } from './seo-links.service';

describe('SeoLinksService', () => {
  let service: SeoLinksService;
  let events: Subject<NavigationEnd>;
  let lang: 'en' | 'es';
  let notFound = false;
  const meta = {
    updateTag: jasmine.createSpy('updateTag'),
    removeTag: jasmine.createSpy('removeTag'),
  };
  const title = { setTitle: jasmine.createSpy('setTitle') };
  const routerStub = {
    get routerState() {
      return {
        snapshot: {
          root: {
            firstChild: {
              data: {
                get lang() {
                  return lang;
                },
                get notFound() {
                  return notFound;
                },
              },
            },
          },
        },
      };
    },
  };

  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"]')
      .forEach((link) => link.remove());
    events = new Subject<NavigationEnd>();
    lang = 'en';
    notFound = false;
    meta.updateTag.calls.reset();
    meta.removeTag.calls.reset();
    title.setTitle.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        SeoLinksService,
        { provide: DOCUMENT, useValue: document },
        { provide: Meta, useValue: meta },
        { provide: Title, useValue: title },
        { provide: Router, useValue: { ...routerStub, events: events.asObservable() } },
      ],
    });
    service = TestBed.inject(SeoLinksService);
  });

  afterEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"]')
      .forEach((link) => link.remove());
  });

  function expectLinks(canonical: string, locale: string): void {
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonical
    );
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="en"]')?.getAttribute('href')
    ).toBe('https://fjbatresv.com/');
    expect(
      document.head.querySelector('link[rel="alternate"][hreflang="es"]')?.getAttribute('href')
    ).toBe('https://fjbatresv.com/es/');
    expect(
      document.head
        .querySelector('link[rel="alternate"][hreflang="x-default"]')
        ?.getAttribute('href')
    ).toBe('https://fjbatresv.com/');
    expect(meta.updateTag).toHaveBeenCalledWith({ property: 'og:url', content: canonical });
    expect(meta.updateTag).toHaveBeenCalledWith({ property: 'og:locale', content: locale });
    expect(title.setTitle).toHaveBeenCalledWith(
      locale === 'es_GT'
        ? 'Javier Batres — Arquitecto de Soluciones y Full Stack'
        : 'Javier Batres — Solutions Architect & Full Stack Engineer'
    );
  }

  it('sets English canonical, alternates, and Open Graph metadata', () => {
    service.init();
    expectLinks('https://fjbatresv.com/', 'en_US');
  });

  it('sets Spanish canonical, alternates, and Open Graph metadata', () => {
    lang = 'es';
    service.init();
    expectLinks('https://fjbatresv.com/es/', 'es_GT');
  });

  it('marks not-found routes noindex and removes homepage SEO links and JSON-LD', () => {
    document.head.querySelector('#profile-jsonld')?.remove();
    document.head.insertAdjacentHTML(
      'beforeend',
      '<link rel="canonical" href="/"><link rel="alternate" hreflang="en" href="/"><meta property="og:url" content="/"><script id="profile-jsonld"></script>'
    );
    notFound = true;
    service.init();
    expect(title.setTitle).toHaveBeenCalledWith('Page not found — Javier Batres');
    expect(meta.updateTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
    expect(meta.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: "The page you were looking for doesn't exist. Go back to Javier Batres' home page.",
    });
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('link[rel="alternate"][hreflang]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.head.querySelector('#profile-jsonld')).toBeNull();
  });

  it('clears noindex when navigating from not-found to home', () => {
    notFound = true;
    service.init();
    notFound = false;
    events.next(new NavigationEnd(1, '/missing', '/'));
    expect(meta.removeTag).toHaveBeenCalledWith('name="robots"');
    expectLinks('https://fjbatresv.com/', 'en_US');
  });

  it('updates the canonical when NavigationEnd changes the route language', () => {
    service.init();
    lang = 'es';
    events.next(new NavigationEnd(1, '/about', '/es/about'));
    expectLinks('https://fjbatresv.com/es/', 'es_GT');
  });
});
