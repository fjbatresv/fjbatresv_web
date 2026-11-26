async function runThemeScript(): Promise<void> {
  const response = await fetch('/public/theme-init.js');
  const source = await response.text();
  expect(response.status).toBe(200, source);
  new Function(source)();
}

describe('theme bootstrap script', () => {
  afterEach(() => {
    localStorage.removeItem('fj-theme');
    document.body.classList.remove('theme-light', 'theme-dark');
  });

  it('uses the stored dark theme', async () => {
    localStorage.setItem('fj-theme', 'dark');
    await runThemeScript();
    expect(document.body.classList.contains('theme-dark')).toBeTrue();
  });

  it('defaults to dark regardless of system light preference', async () => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);
    await runThemeScript();
    expect(document.body.classList.contains('theme-dark')).toBeTrue();
  });

  it('uses a stored light theme', async () => {
    localStorage.setItem('fj-theme', 'light');
    await runThemeScript();
    expect(document.body.classList.contains('theme-light')).toBeTrue();
  });
});
