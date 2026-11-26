import * as Sentry from '@sentry/browser';

export const runtimeContext = {
  hasKarma: (): boolean =>
    Boolean((globalThis as typeof globalThis & { __karma__?: unknown }).__karma__),
  hasJasmine: (): boolean =>
    Boolean((globalThis as typeof globalThis & { jasmine?: unknown }).jasmine),
  pathname: (): string => (typeof location === 'undefined' ? '' : location.pathname),
};

const isTestRun = (): boolean =>
  runtimeContext.hasKarma() ||
  runtimeContext.hasJasmine() ||
  runtimeContext.pathname().includes('context.html');

export const sentryClient = { captureMessage: Sentry.captureMessage.bind(Sentry) };

export function reportTranslationLoadFailure(
  lang: string,
  error: { status?: number; statusText?: string; url?: string }
): void {
  if (isTestRun()) return;

  sentryClient.captureMessage('Translation load failed', {
    level: 'warning',
    extra: { lang, status: error?.status, statusText: error?.statusText, url: error?.url },
  });
}
