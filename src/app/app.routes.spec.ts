import { routes } from './app.routes';

describe('App routes', () => {
  it('defines exactly one page per locale and a fallback', () => {
    expect(routes.map((route) => route.path)).toEqual(['', 'es', '404', '**']);
    expect(routes[0].data?.['lang']).toBe('en');
    expect(routes[1].data?.['lang']).toBe('es');
  });

  it('lazy-loads the home page component for each section', async () => {
    const loaders = routes.filter((route) => route.loadComponent).map((r) => r.loadComponent);
    const components = await Promise.all(loaders.map((load) => load!()));
    components.forEach((component) => expect(component).toBeDefined());
  });

  it('renders a not-found component for unknown paths', () => {
    const fallback = routes.find((r) => r.path === '**');
    expect(fallback?.loadComponent).toBeDefined();
  });
});
