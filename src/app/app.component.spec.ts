import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { SeoLinksService } from './core/services/seo-links.service';
import { TranslationService } from './core/services/translation.service';
import { AnalyticsService } from './core/services/analytics.service';

describe('AppComponent', () => {
  const translationServiceMock = {
    init: jasmine.createSpy('init'),
    language: 'en' as 'en' | 'es',
  };
  const seoLinksServiceMock = {
    init: jasmine.createSpy('init'),
  };
  const analyticsMock = { track: jasmine.createSpy('track') };

  beforeEach(async () => {
    translationServiceMock.init.calls.reset();
    seoLinksServiceMock.init.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        provideTranslateService(),
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: SeoLinksService, useValue: seoLinksServiceMock },
        { provide: AnalyticsService, useValue: analyticsMock },
      ],
    }).compileComponents();
  });

  it('should expose the current year', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    expect(component.currentYear).toBe(new Date().getFullYear());
  });

  it('initializes locale and SEO metadata on init', () => {
    TestBed.createComponent(AppComponent).componentInstance.ngOnInit();
    expect(translationServiceMock.init).toHaveBeenCalled();
    expect(seoLinksServiceMock.init).toHaveBeenCalled();
  });

  it('builds a localized project email and tracks footer actions', () => {
    const component = TestBed.createComponent(AppComponent).componentInstance;
    expect(component.emailLink).toBe('mailto:fjbatresv@gmail.com?subject=Project%3A%20');
    translationServiceMock.language = 'es';
    expect(component.emailLink).toBe('mailto:fjbatresv@gmail.com?subject=Proyecto%3A%20');
    component.track('contact_github');
    expect(analyticsMock.track).toHaveBeenCalledWith('contact_github');
    translationServiceMock.language = 'en';
  });

  it('keeps the skip link inside the active locale', () => {
    const fixture = TestBed.createComponent(AppComponent);
    translationServiceMock.language = 'es';
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.skip-link') as HTMLAnchorElement;
    expect(new URL(link.getAttribute('href')!, 'https://fjbatresv.com/es/').href).toBe(
      'https://fjbatresv.com/es/#content'
    );
    translationServiceMock.language = 'en';
  });
});
