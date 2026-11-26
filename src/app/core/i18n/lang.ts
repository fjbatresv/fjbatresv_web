export type Lang = 'en' | 'es';
export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'es'];

export function langFromUrl(url: string): Lang {
  if (/^\/es(?:\/|$)/.test(url.split(/[?#]/, 1)[0])) {
    return 'es';
  }
  return 'en';
}

export function localizedPath(lang: Lang, hash = ''): string {
  return `${lang === 'es' ? '/es/' : '/'}${hash ? `#${hash}` : ''}`;
}
