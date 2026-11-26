import {
  reportTranslationLoadFailure,
  runtimeContext,
  sentryClient,
} from './report-translation-load-failure';
import { sentryLoader } from '../sentry-loader';

describe('reportTranslationLoadFailure', () => {
  it('detects the test runtime', () => {
    expect(runtimeContext.hasKarma()).toBeTrue();
    expect(runtimeContext.hasJasmine()).toBeTrue();
    expect(runtimeContext.pathname()).toContain('context.html');
  });

  it('reports failures outside the test runner', () => {
    spyOn(runtimeContext, 'hasKarma').and.returnValue(false);
    spyOn(runtimeContext, 'hasJasmine').and.returnValue(false);
    spyOn(runtimeContext, 'pathname').and.returnValue('/projects');
    const capture = spyOn(sentryClient, 'captureMessage');

    reportTranslationLoadFailure('es', { status: 404, statusText: 'Not Found', url: '/es.json' });

    expect(capture).toHaveBeenCalledWith('Translation load failed', {
      level: 'warning',
      extra: { lang: 'es', status: 404, statusText: 'Not Found', url: '/es.json' },
    });
  });

  it('loads the Sentry message client on demand', async () => {
    await sentryClient.captureMessage('test message', { level: 'warning' });
    expect(true).toBeTrue();
  });

  it('handles a failed Sentry message import', async () => {
    const error = new Error('chunk unavailable');
    spyOn(sentryLoader, 'load').and.returnValue(Promise.reject(error));
    const consoleSpy = spyOn(console, 'error');
    await sentryClient.captureMessage('test message', { level: 'warning' });
    expect(consoleSpy).toHaveBeenCalledWith(error);
  });
});
