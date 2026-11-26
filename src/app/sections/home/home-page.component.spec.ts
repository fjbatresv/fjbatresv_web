import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let fixture: ComponentFixture<HomePageComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideTranslateService(),
        { provide: AnalyticsService, useValue: { track: jasmine.createSpy('track') } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePageComponent);
    fixture.detectChanges();
  });

  it('renders all content sections in the required order', () => {
    const ids = [...fixture.nativeElement.querySelectorAll('section[id]')].map(
      (section: HTMLElement) => section.id
    );
    expect(ids).toEqual(['top', 'projects', 'verde', 'experience', 'contact']);
  });
});
