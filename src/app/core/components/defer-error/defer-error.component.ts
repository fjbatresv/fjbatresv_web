import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as Sentry from '@sentry/browser';

const reloadFlag = '__deferReloaded';

@Component({
  selector: 'app-defer-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="skeleton-section">
      <div class="container skeleton-card"></div>
    </section>
  `,
})
export class DeferErrorComponent implements OnInit {
  @Input({ required: true }) section = '';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    if (!this.isBrowser) return;
    const path = location.pathname;
    Sentry.captureMessage('Defer block failed to load', {
      level: 'error',
      extra: { section: this.section || 'unknown', path },
    });

    const storageKey = `defer-reload:${this.section || 'unknown'}`;
    try {
      const storage = typeof sessionStorage === 'undefined' ? null : sessionStorage;
      if (storage) {
        if (storage.getItem(storageKey)) {
          return;
        }
        storage.setItem(storageKey, '1');
        setTimeout(() => this.reload(), 50);
        return;
      }
    } catch {
      // Fall through to in-memory guard if storage is unavailable.
    }

    const globalObj = globalThis as typeof globalThis & { [reloadFlag]?: boolean };
    if (!globalObj[reloadFlag]) {
      globalObj[reloadFlag] = true;
      setTimeout(() => this.reload(), 50);
    }
  }

  protected reload(): void {
    this.document.defaultView?.location.reload();
  }
}
