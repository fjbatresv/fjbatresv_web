export type Lang = 'en' | 'es';
export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'es'];

export function langFromUrl(url: string): Lang {
  return /^\/es(?:\/|$)/.test(url.split(/[?#]/, 1)[0]) ? 'es' : 'en';
}

export function localizedPath(section: string, lang: Lang): string {
  const path = section === 'home' ? '' : `/${section}`;
  return lang === 'es' ? (path ? `/es${path}` : '/es') : path || '/';
}
