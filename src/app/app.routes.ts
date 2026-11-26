import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { lang: 'en' },
  },
  {
    path: 'es',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { lang: 'es' },
  },
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
