import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';

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
    expect(fixture.nativeElement.querySelectorAll('h1').length).toBe(1);
    const links = [
      ...fixture.nativeElement.querySelectorAll('.hero__actions a'),
    ] as HTMLAnchorElement[];
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#how-i-work', '#experience']);
  });

  it('tracks both hero paths', () => {
    const analytics = TestBed.inject(AnalyticsService) as unknown as { track: jasmine.Spy };
    const links = [
      ...fixture.nativeElement.querySelectorAll('.hero__actions a'),
    ] as HTMLAnchorElement[];
    links[0].click();
    links[1].click();
    expect(analytics.track).toHaveBeenCalledWith('cta_project');
    expect(analytics.track).toHaveBeenCalledWith('cta_hire');
  });
});
