import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

export function bootstrapApp(
  bootstrapFn: typeof bootstrapApplication = bootstrapApplication
): Promise<unknown> {
  return bootstrapFn(AppComponent, appConfig).catch((err) => console.error(err));
}

/* istanbul ignore next -- bootstrap is skipped in Karma environment */
const isKarma = typeof window !== 'undefined' && (window as any).__karma__;
/* istanbul ignore next -- guard only relevant in test runner */
if (!isKarma) {
  /* istanbul ignore next -- actual bootstrap only matters outside test */
  void (async () => {
    try {
      await bootstrapApp();
    } catch (err) {
      console.error(err);
    }
  })();
}
