import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type AnalyticsEvent =
  | 'cta_project'
  | 'cta_hire'
  | 'project_open'
  | 'verde_open'
  | 'contact_email'
  | 'contact_linkedin'
  | 'contact_calendar'
  | 'contact_github';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  track(event: AnalyticsEvent, params?: Record<string, string>): void {
    if (!this.browser || !/(^|;\s*)analytics_consent=accepted(?:;|$)/.test(document.cookie)) return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', event, params);
  }
}
