import { Component, Input, OnInit } from '@angular/core';
import * as Sentry from '@sentry/browser';

const reloadFlag = '__deferReloaded';

@Component({
  selector: 'app-defer-error',
  standalone: true,
  template: `
    <section class="skeleton-section">
      <div class="container skeleton-card"></div>
    </section>
  `,
})
export class DeferErrorComponent implements OnInit {
  @Input({ required: true }) section = '';

  ngOnInit(): void {
    const path = typeof location === 'undefined' ? '' : location.pathname;
    Sentry.captureMessage('Defer block failed to load', {
      level: 'error',
      extra: { section: this.section || 'unknown', path },
    });

    if (typeof location === 'undefined') {
      return;
    }

    const storageKey = `defer-reload:${this.section || 'unknown'}`;
    try {
      const storage = typeof sessionStorage === 'undefined' ? null : sessionStorage;
      if (storage) {
        if (storage.getItem(storageKey)) {
          return;
        }
        storage.setItem(storageKey, '1');
        setTimeout(() => location.reload(), 50);
        return;
      }
    } catch {
      // Fall through to in-memory guard if storage is unavailable.
    }

    const globalObj = globalThis as typeof globalThis & { [reloadFlag]?: boolean };
    if (!globalObj[reloadFlag]) {
      globalObj[reloadFlag] = true;
      setTimeout(() => location.reload(), 50);
    }
  }
}
