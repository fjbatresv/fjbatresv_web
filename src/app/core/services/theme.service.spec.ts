import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches,
      addListener: () => {},
      removeListener: () => {},
    }),
  });
}

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);

    TestBed.configureTestingModule({
      providers: [ThemeService, { provide: DOCUMENT, useValue: document }],
    });

    service = TestBed.inject(ThemeService);
  });

  it('should default to light when no preference stored', () => {
    expect(service.theme).toBe('light');
    expect(document.body.classList.contains('theme-light')).toBeTrue();
  });

  it('should respect stored theme', () => {
    localStorage.setItem('fj-theme', 'dark');
    mockMatchMedia(true);
    const storedService = new ThemeService(document);
    expect(storedService.theme).toBe('dark');
    expect(document.body.classList.contains('theme-dark')).toBeTrue();
  });

  it('should toggle theme and persist it', () => {
    const initial = service.theme;
    service.toggleTheme();
    expect(service.theme).toBe(initial === 'light' ? 'dark' : 'light');
    expect(localStorage.getItem('fj-theme')).toBe(service.theme);
    expect(document.body.classList.contains(`theme-${service.theme}`)).toBeTrue();
  });
});
