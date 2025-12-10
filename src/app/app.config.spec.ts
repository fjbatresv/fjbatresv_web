import { ErrorHandler } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { appConfig, HttpLoaderFactory } from './app.config';
import { SafeTranslateHttpLoader } from './core/i18n/safe-translate-http-loader';

describe('app.config', () => {
  it('creates a SafeTranslateHttpLoader with expected defaults', () => {
    const loader = HttpLoaderFactory({} as HttpClient);
    expect(loader).toEqual(jasmine.any(SafeTranslateHttpLoader));
  });

  it('provides a custom ErrorHandler', () => {
    const errorProvider = (appConfig.providers as Array<unknown>).find(
      (provider: any) => provider?.provide === ErrorHandler
    );
    expect(errorProvider).toBeDefined();
  });
});
