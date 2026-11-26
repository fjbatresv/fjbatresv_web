import { routes } from './app.routes';

describe('App routes', () => {
  it('defines sections with data and lazy components', () => {
    const sectionRoutes = routes.filter((route) => route.data?.['section']);
    expect(sectionRoutes).toHaveSize(14);
    const spanish = sectionRoutes.filter((route) => route.data?.['lang'] === 'es');
    expect(spanish.map((route) => route.path)).toEqual([
      'es',
      'es/about',
      'es/experience',
      'es/skills',
      'es/projects',
      'es/writing',
      'es/contact',
    ]);
    sectionRoutes.forEach((route) => {
      expect(['en', 'es']).toContain(route.data?.['lang']);
      expect(typeof route.loadComponent).toBe('function');
    });
  });

  it('lazy-loads the home page component for each section', async () => {
    const loaders = routes.filter((route) => route.loadComponent).map((r) => r.loadComponent);
    const components = await Promise.all(loaders.map((load) => load!()));
    components.forEach((component) => expect(component).toBeDefined());
  });

  it('renders a not-found component for unknown paths', () => {
    const fallback = routes.find((r) => r.path === '**');
    expect(fallback?.loadComponent).toBeDefined();
    expect(routes.find((r) => r.path === '404')?.loadComponent).toBeDefined();
  });
});
