import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { VerdeComponent } from './verde.component';

describe('VerdeComponent', () => {
  let fixture: ComponentFixture<VerdeComponent>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    await TestBed.configureTestingModule({
      imports: [VerdeComponent],
      providers: [provideTranslateService(), { provide: AnalyticsService, useValue: analytics }],
    }).compileComponents();
    fixture = TestBed.createComponent(VerdeComponent);
    fixture.detectChanges();
  });

  it('renders five steps and the live Verde link', () => {
    expect(fixture.nativeElement.querySelectorAll('li')).toHaveSize(5);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://verde.fjbatresv.com');
    fixture.componentInstance.track();
    expect(analytics.track).toHaveBeenCalledWith('verde_open');
  });
});
