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

export const routes: Routes = [
  ...(['en', 'es'] as const).flatMap((lang) =>
    sections.map((section) => ({
      path:
        lang === 'es'
          ? section === 'home'
            ? 'es'
            : `es/${section}`
          : section === 'home'
            ? ''
            : section,
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
