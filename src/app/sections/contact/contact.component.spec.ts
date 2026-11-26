import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let translation: { language: 'en' | 'es' };
  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    translation = { language: 'en' };
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [
        provideTranslateService(),
        { provide: AnalyticsService, useValue: analytics },
        { provide: TranslationService, useValue: translation },
      ],
    }).compileComponents();
  });

  it('has the exact project contact URLs and localized mail subject', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.detectChanges();
    const links = [
      ...fixture.nativeElement.querySelectorAll('.contact__actions a'),
    ] as HTMLAnchorElement[];
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'mailto:fjbatresv@gmail.com?subject=Project%3A%20',
      'https://www.linkedin.com/in/fjbatresv',
      'https://calendar.notion.so/meet/javierbatres/7v3284yxr',
    ]);
    expect(fixture.nativeElement.querySelector('.contact__github').getAttribute('href')).toBe(
      'https://github.com/fjbatresv'
    );
    translation.language = 'es';
    expect(fixture.componentInstance.emailLink).toBe(
      'mailto:fjbatresv@gmail.com?subject=Proyecto%3A%20'
    );
  });

  it('tracks each contact action', () => {
    const fixture = TestBed.createComponent(ContactComponent);
    fixture.componentInstance.track('contact_email');
    fixture.componentInstance.track('contact_linkedin');
    fixture.componentInstance.track('contact_calendar');
    fixture.componentInstance.track('contact_github');
    expect(analytics.track.calls.allArgs()).toEqual([
      ['contact_email'],
      ['contact_linkedin'],
      ['contact_calendar'],
      ['contact_github'],
    ]);
  });
});
