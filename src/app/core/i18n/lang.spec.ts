import { langFromUrl, localizedPath } from './lang';

describe('language paths', () => {
  it('finds the locale only at the start of the path', () => {
    expect(langFromUrl('/es')).toBe('es');
    expect(langFromUrl('/es/contact?x=1')).toBe('es');
    expect(langFromUrl('/estimate')).toBe('en');
    expect(langFromUrl('/')).toBe('en');
  });

  it('localizes the page and preserves an optional section hash', () => {
    expect(localizedPath('en')).toBe('/');
    expect(localizedPath('es')).toBe('/es/');
    expect(localizedPath('es', 'projects')).toBe('/es/#projects');
  });
});
