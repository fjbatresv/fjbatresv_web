import { routes } from './app.routes';

describe('App routes', () => {
  it('defines sections with data and lazy components', () => {
    const expectedPaths = ['', 'about', 'experience', 'skills', 'projects', 'writing', 'contact'];
    const sectionRoutes = routes.filter((route) => route.path !== '**');

    expect(sectionRoutes.map((r) => r.path)).toEqual(expectedPaths);
    const expectedSections = [
      'home',
      'about',
      'experience',
      'skills',
      'projects',
      'writing',
      'contact',
    ];
    sectionRoutes.forEach((route, index) => {
      expect(route.data?.['section']).toBe(expectedSections[index]);
      expect(typeof route.loadComponent).toBe('function');
    });
  });

  it('lazy-loads the home page component for each section', async () => {
    const loaders = routes.filter((route) => route.loadComponent).map((r) => r.loadComponent);
    const components = await Promise.all(loaders.map((load) => load!()));
    components.forEach((component) => expect(component).toBeDefined());
  });

  it('redirects unknown paths to home', () => {
    const fallback = routes.find((r) => r.path === '**');
    expect(fallback?.redirectTo).toBe('');
  });
});
