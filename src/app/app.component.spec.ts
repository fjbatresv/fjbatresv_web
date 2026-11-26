import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { SeoLinksService } from './core/services/seo-links.service';
import { TranslationService } from './core/services/translation.service';

describe('AppComponent', () => {
  const translationServiceMock = {
    init: jasmine.createSpy('init'),
  };
  const seoLinksServiceMock = {
    init: jasmine.createSpy('init'),
  };

  beforeEach(async () => {
    translationServiceMock.init.calls.reset();
    seoLinksServiceMock.init.calls.reset();

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [
        provideTranslateService(),
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: SeoLinksService, useValue: seoLinksServiceMock },
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
});
