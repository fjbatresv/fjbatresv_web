import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';
import { ExperienceComponent } from './experience.component';

describe('ExperienceComponent', () => {
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let translation: { language: 'en' | 'es' };
  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    translation = { language: 'en' };
    await TestBed.configureTestingModule({
      imports: [ExperienceComponent],
      providers: [
        provideTranslateService(),
        { provide: AnalyticsService, useValue: analytics },
        { provide: TranslationService, useValue: translation },
      ],
    }).compileComponents();
  });

  it('shows the six employers in order with achievements', () => {
    const fixture = TestBed.createComponent(ExperienceComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.experiences.map((entry) => entry.company)).toEqual([
      'experience.companies.gtc',
      'experience.companies.halo',
      'experience.companies.truelogic',
      'experience.companies.yalutec',
      'experience.companies.paypal',
      'experience.companies.early',
    ]);
    expect(fixture.nativeElement.querySelectorAll('.timeline-item').length).toBe(6);
    expect(fixture.nativeElement.querySelectorAll('.achievements strong').length).toBe(4);
  });

  it('uses a locale-specific hiring subject and tracks the action', () => {
    const fixture = TestBed.createComponent(ExperienceComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.button') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(
      'mailto:fjbatresv@gmail.com?subject=Job%20opportunity%3A%20'
    );
    fixture.componentInstance.trackHire();
    expect(analytics.track).toHaveBeenCalledWith('contact_email', { path: 'hire' });
    translation.language = 'es';
    expect(fixture.componentInstance.hireLink).toBe(
      'mailto:fjbatresv@gmail.com?subject=Oportunidad%20laboral%3A%20'
    );
  });
});
