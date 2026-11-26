import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { HowIWorkComponent } from './how-i-work.component';

describe('HowIWorkComponent', () => {
  it('shows three engagement types, four steps, and books a call', async () => {
    const analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    await TestBed.configureTestingModule({
      imports: [HowIWorkComponent],
      providers: [provideTranslateService(), { provide: AnalyticsService, useValue: analytics }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HowIWorkComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.engagements article').length).toBe(3);
    expect(fixture.nativeElement.querySelectorAll('.process li').length).toBe(4);
    const link = fixture.nativeElement.querySelector('.button') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(
      'https://calendar.notion.so/meet/javierbatres/7v3284yxr'
    );
    fixture.componentInstance.track();
    expect(analytics.track).toHaveBeenCalledWith('contact_calendar');
  });
});
