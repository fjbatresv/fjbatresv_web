import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'home' },
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'about' },
  },
  {
    path: 'experience',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'experience' },
  },
  {
    path: 'skills',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'skills' },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'projects' },
  },
  {
    path: 'writing',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'writing' },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./sections/home/home-page.component').then((m) => m.HomePageComponent),
    data: { section: 'contact' },
  },
  { path: '**', redirectTo: '' },
];
