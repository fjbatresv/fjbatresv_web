import { profilePageJsonLd } from './json-ld';

describe('profilePageJsonLd', () => {
  it('includes a person and the eight ordered portfolio works in both locales', () => {
    for (const lang of ['en', 'es'] as const) {
      const data = profilePageJsonLd(lang) as any;
      expect(data['@type']).toBe('ProfilePage');
      expect(data.mainEntity.name).toBe('Javier Batres');
      expect(data.mainEntity.alternateName).toBe('Fernando Javier Batres Velásquez');
      expect(data.hasPart.itemListElement.length).toBe(8);
      expect(data.hasPart.itemListElement[0].item.name).toBe('SDG19');
    }
  });
});
