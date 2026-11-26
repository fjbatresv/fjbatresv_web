import { Routes } from '@angular/router';

const sections = [
  'home',
  'about',
  'experience',
  'skills',
  'projects',
  'writing',
  'contact',
] as const;

function routePath(section: (typeof sections)[number], lang: 'en' | 'es'): string {
  if (lang === 'es') {
    if (section === 'home') {
      return 'es';
    }
    return `es/${section}`;
  }
  if (section === 'home') {
    return '';
  }
  return section;
}

export const routes: Routes = [
  ...(['en', 'es'] as const).flatMap((lang) =>
    sections.map((section) => ({
      path: routePath(section, lang),
      loadComponent: () =>
        import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
      data: { section, lang },
    }))
  ),
  {
    path: '404',
    loadComponent: () =>
      import('./sections/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { lang: 'en' },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./sections/not-found/not-found.component').then((m) => m.NotFoundComponent),
    data: { lang: 'en' },
  },
];
