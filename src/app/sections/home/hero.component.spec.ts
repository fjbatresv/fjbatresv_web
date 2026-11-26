import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent],
      providers: [
        provideTranslateService(),
        { provide: AnalyticsService, useValue: { track: jasmine.createSpy('track') } },
        { provide: TranslationService, useValue: { language: 'es' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one h1 and both paths with the expected anchors', () => {
    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveSize(1);
    const links = [
      ...fixture.nativeElement.querySelectorAll('.hero__paths a'),
    ] as HTMLAnchorElement[];
    expect(
      links.map((link) => new URL(link.getAttribute('href')!, 'https://fjbatresv.com/es/').href)
    ).toEqual(['https://fjbatresv.com/es/#how-i-work', 'https://fjbatresv.com/es/#experience']);
  });

  it('tracks both hero paths', () => {
    const analytics = TestBed.inject(AnalyticsService) as unknown as { track: jasmine.Spy };
    const links = [
      ...fixture.nativeElement.querySelectorAll('.hero__paths a'),
    ] as HTMLAnchorElement[];
    links.forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
    links[0].click();
    links[1].click();
    expect(analytics.track).toHaveBeenCalledWith('cta_project');
    expect(analytics.track).toHaveBeenCalledWith('cta_hire');
  });

  it('renders both path labels and descriptions', () => {
    const paths = [
      ...fixture.nativeElement.querySelectorAll('.hero__paths a'),
    ] as HTMLAnchorElement[];
    expect(
      paths.map((path) => path.querySelector('.hero__path-label')?.textContent?.trim())
    ).toEqual(['hero.paths.project.label', 'hero.paths.hire.label']);
    expect(paths.every((path) => path.querySelectorAll('span').length === 2)).toBeTrue();
  });
});
