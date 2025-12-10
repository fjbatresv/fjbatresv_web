import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let originalMatchMedia: typeof globalThis.matchMedia;
  let originalLocalStorage: Storage;
  const classes = new Set<string>();
  const bodyClassList = {
    remove: jasmine.createSpy('remove').and.callFake((...args: string[]) => {
      args.forEach((c) => classes.delete(c));
    }),
    add: jasmine.createSpy('add').and.callFake((c: string) => {
      classes.add(c);
    }),
  };
  const docMock = { body: { classList: bodyClassList } } as unknown as Document;

  const mockMql = (matches: boolean) => ({
    matches,
    media: '',
    onchange: null as any,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
    addListener() {},
    removeListener() {},
  });

  const configureWithMatchMedia = (matches: boolean) => {
    TestBed.resetTestingModule();
    spyOn(globalThis as any, 'matchMedia').and.returnValue(mockMql(matches) as any);
    localStorage.removeItem('fj-theme');
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: docMock },
        { provide: Window, useValue: globalThis },
      ],
    });
    service = TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    originalMatchMedia = globalThis.matchMedia;
    originalLocalStorage = (globalThis as any).localStorage;
  });

  afterEach(() => {
    bodyClassList.remove.calls.reset();
    bodyClassList.add.calls.reset();
    (globalThis as any).matchMedia = originalMatchMedia;
    try {
      (globalThis as any).localStorage = originalLocalStorage;
    } catch {
      // Ignore if localStorage is read-only in this environment
    }
    try {
      localStorage.clear();
    } catch {
      // Ignore storage errors (e.g., when access is intentionally blocked)
    }
  });

  it('toggles theme from light to dark', () => {
    configureWithMatchMedia(false);
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.toggleTheme();

    expect(service.theme).toBe('dark');
    expect(setItemSpy).toHaveBeenCalledWith('fj-theme', 'dark');
    expect(bodyClassList.add).toHaveBeenCalled();
  });

  it('toggles theme from dark back to light', () => {
    configureWithMatchMedia(false);
    service.theme = 'dark';
    service.toggleTheme();
    expect(service.theme).toBe('light');
  });

  it('initializes with prefers-dark when no stored value', () => {
    configureWithMatchMedia(true);
    expect(service.theme).toBe('dark');
  });

  it('handles storage access errors gracefully', () => {
    configureWithMatchMedia(false);
    const localStorageSpy = spyOnProperty(globalThis as any, 'localStorage', 'get').and.throwError(
      'blocked'
    );
    try {
      service.toggleTheme();
      expect(service.theme).toBeDefined();
    } finally {
      localStorageSpy.and.callFake(() => originalLocalStorage);
    }
  });

  it('falls back when matchMedia is not available', () => {
    // Remove matchMedia to hit the undefined branch
    (globalThis as any).matchMedia = undefined;
    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ThemeService,
          { provide: DOCUMENT, useValue: docMock },
          { provide: Window, useValue: globalThis },
        ],
      });
      const serviceNoMedia = TestBed.inject(ThemeService);
      expect(serviceNoMedia.theme).toBe('light');
    } finally {
      (globalThis as any).matchMedia = originalMatchMedia;
    }
  });
});
