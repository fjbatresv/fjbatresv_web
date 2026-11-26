import { firstValueFrom } from 'rxjs';
import { JsonImportTranslateLoader, translationImports } from './json-import-translate-loader';

describe('JsonImportTranslateLoader', () => {
  it('loads Spanish translations from the bundled JSON', async () => {
    const translations = await firstValueFrom(new JsonImportTranslateLoader().getTranslation('es'));
    expect((translations['nav'] as Record<string, string>)['home']).toBe('Inicio');
  });

  it('loads English translations from the bundled JSON', async () => {
    const translations = await firstValueFrom(new JsonImportTranslateLoader().getTranslation('en'));
    expect((translations['nav'] as Record<string, string>)['home']).toBe('Home');
  });

  it('returns an empty object for an unsupported language', async () => {
    const translations = await firstValueFrom(new JsonImportTranslateLoader().getTranslation('xx'));
    expect(Object.keys(translations)).toEqual([]);
  });

  it('returns an empty object when a translation import fails', async () => {
    spyOn(translationImports, 'es').and.returnValue(Promise.reject(new Error('missing')));
    const translations = await firstValueFrom(new JsonImportTranslateLoader().getTranslation('es'));
    expect(Object.keys(translations)).toEqual([]);
  });
});
