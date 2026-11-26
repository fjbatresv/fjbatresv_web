import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let gtag: jasmine.Spy;
  beforeEach(() => {
    document.cookie = 'analytics_consent=; Max-Age=0';
    gtag = jasmine.createSpy('gtag');
    (window as Window & { gtag?: typeof gtag }).gtag = gtag;
  });
  afterEach(() => {
    document.cookie = 'analytics_consent=; Max-Age=0';
    delete (window as Window & { gtag?: typeof gtag }).gtag;
  });

  it('does not track without accepted consent', () => {
    TestBed.configureTestingModule({ providers: [AnalyticsService] });
    service = TestBed.inject(AnalyticsService);
    service.track('cta_project');
    expect(gtag).not.toHaveBeenCalled();
  });

  it('tracks with accepted consent and gtag', () => {
    document.cookie = 'analytics_consent=accepted';
    TestBed.configureTestingModule({ providers: [AnalyticsService] });
    service = TestBed.inject(AnalyticsService);
    service.track('project_open', { project: 'sdg19' });
    expect(gtag).toHaveBeenCalledWith('event', 'project_open', { project: 'sdg19' });
  });

  it('is a no-op on the server', () => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService, { provide: PLATFORM_ID, useValue: 'server' }],
    });
    service = TestBed.inject(AnalyticsService);
    service.track('cta_hire');
    expect(gtag).not.toHaveBeenCalled();
  });
});
