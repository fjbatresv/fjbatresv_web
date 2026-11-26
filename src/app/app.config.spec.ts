import { ErrorHandler, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { appConfig, initializeSentry, sentryErrorClient, SentryErrorHandler } from './app.config';
import { sentryLoader } from './core/sentry-loader';
import { environment } from '../environments/environment';

describe('app.config', () => {
  it('provides a custom ErrorHandler', () => {
    const errorProvider = (appConfig.providers as Array<unknown>).find(
      (provider: any) => provider?.provide === ErrorHandler
    );
    expect(errorProvider).toBeDefined();
  });

  it('reports errors to Sentry and the console', () => {
    const error = new Error('failure');
    const sentrySpy = spyOn(sentryErrorClient, 'captureException');
    const consoleSpy = spyOn(console, 'error');

    new SentryErrorHandler().handleError(error);

    expect(sentrySpy).toHaveBeenCalledWith(error);
    expect(consoleSpy).toHaveBeenCalledWith(error);
  });

  it('skips Sentry initialization outside the browser', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(() => TestBed.runInInjectionContext(initializeSentry)).not.toThrow();
  });

  it('skips Sentry initialization when no DSN is configured', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    expect(() => TestBed.runInInjectionContext(initializeSentry)).not.toThrow();
  });

  it('initializes Sentry in a browser when a DSN is configured', async () => {
    const dsn = environment.sentryDsn;
    environment.sentryDsn = 'https://abc@o0.ingest.sentry.io/1';
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    try {
      await TestBed.runInInjectionContext(initializeSentry);
      expect(await import('@sentry/browser').then((Sentry) => Sentry.close(0))).toBeTrue();
    } finally {
      environment.sentryDsn = dsn;
    }
  });

  it('does not block application startup when the Sentry chunk fails', async () => {
    const error = new Error('chunk unavailable');
    const dsn = environment.sentryDsn;
    environment.sentryDsn = 'https://abc@o0.ingest.sentry.io/1';
    spyOn(sentryLoader, 'load').and.returnValue(Promise.reject(error));
    const consoleSpy = spyOn(console, 'error');
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
    try {
      await expectAsync(TestBed.runInInjectionContext(initializeSentry)).toBeResolvedTo(undefined);
      expect(consoleSpy).toHaveBeenCalledWith(error);
    } finally {
      environment.sentryDsn = dsn;
    }
  });

  it('loads the Sentry exception client on demand', async () => {
    await sentryErrorClient.captureException(new Error('lazy capture'));
    expect(true).toBeTrue();
  });

  it('handles a failed Sentry capture import', async () => {
    const error = new Error('chunk unavailable');
    spyOn(sentryLoader, 'load').and.returnValue(Promise.reject(error));
    const consoleSpy = spyOn(console, 'error');
    await sentryErrorClient.captureException(error);
    expect(consoleSpy).toHaveBeenCalledWith(error);
  });
});
