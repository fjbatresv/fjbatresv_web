import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Bootstraps the Angular application using the provided bootstrap function.
 *
 * @param bootstrapFn - Optional custom bootstrap function to initialize the root component; defaults to Angular's `bootstrapApplication`.
 * @returns The value produced by the bootstrap function when successful, or `undefined` if bootstrapping fails (errors are logged to the console).
 */
export const bootstrapAdapter = {
  bootstrap: bootstrapApplication,
};

export function bootstrapApp(
  bootstrapFn: typeof bootstrapApplication = bootstrapAdapter.bootstrap
): Promise<unknown> {
  return bootstrapFn(AppComponent, appConfig).catch((err) => console.error(err));
}

/* istanbul ignore next -- bootstrap is skipped in Karma environment */
const isKarma =
  typeof globalThis !== 'undefined' &&
  (globalThis as typeof globalThis & { __karma__?: unknown }).__karma__;
/* istanbul ignore next -- guard only relevant in test runner */
if (!isKarma) {
  /* istanbul ignore next -- actual bootstrap only matters outside test */
  await bootstrapApp();
}
