export type Lang = 'en' | 'es';
export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'es'];

export function langFromUrl(url: string): Lang {
  if (/^\/es(?:\/|$)/.test(url.split(/[?#]/, 1)[0])) {
    return 'es';
  }
  return 'en';
}

export function localizedPath(section: string, lang: Lang): string {
  if (lang === 'es') {
    if (section === 'home') {
      return '/es';
    }
    return `/es/${section}`;
  }
  if (section === 'home') {
    return '/';
  }
  return `/${section}`;
}
