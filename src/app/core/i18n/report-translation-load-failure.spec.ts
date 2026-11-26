import {
  reportTranslationLoadFailure,
  runtimeContext,
  sentryClient,
} from './report-translation-load-failure';

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
});
