import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
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

  let matchMediaSpy: jasmine.Spy;

  beforeEach(() => {
    matchMediaSpy = spyOn(window, 'matchMedia').and.returnValue(mockMql(false) as any);
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: DOCUMENT, useValue: docMock },
        { provide: Window, useValue: window },
      ],
    });
  });

  afterEach(() => {
    bodyClassList.remove.calls.reset();
    bodyClassList.add.calls.reset();
  });

  it('toggles theme from light to dark', () => {
    service = TestBed.inject(ThemeService);
    const setItemSpy = spyOn(localStorage, 'setItem');

    service.toggleTheme();

    expect(service.theme).toBe('dark');
    expect(setItemSpy).toHaveBeenCalledWith('fj-theme', 'dark');
    expect(bodyClassList.add).toHaveBeenCalled();
  });

  it('toggles theme from dark back to light', () => {
    service = TestBed.inject(ThemeService);
    service.theme = 'dark';
    service.toggleTheme();
    expect(service.theme).toBe('light');
  });

  it('initializes with prefers-dark when no stored value', () => {
    matchMediaSpy.and.returnValue(mockMql(true) as any);
    const prefersDarkService = TestBed.inject(ThemeService);
    expect(prefersDarkService.theme).toBe('dark');
  });

  it('handles storage access errors gracefully', () => {
    service = TestBed.inject(ThemeService);
    matchMediaSpy.and.returnValue(mockMql(false) as any);
    spyOnProperty(window, 'localStorage', 'get').and.throwError('blocked');
    service.toggleTheme();
    expect(service.theme).toBeDefined();
  });
});
