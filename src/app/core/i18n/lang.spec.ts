import { langFromUrl, localizedPath } from './lang';

describe('language paths', () => {
  it('finds the locale only at the start of the path', () => {
    expect(langFromUrl('/es')).toBe('es');
    expect(langFromUrl('/es/contact?x=1')).toBe('es');
    expect(langFromUrl('/estimate')).toBe('en');
    expect(langFromUrl('/')).toBe('en');
  });

  it('localizes section paths', () => {
    expect(localizedPath('home', 'en')).toBe('/');
    expect(localizedPath('home', 'es')).toBe('/es');
    expect(localizedPath('contact', 'es')).toBe('/es/contact');
  });
});
