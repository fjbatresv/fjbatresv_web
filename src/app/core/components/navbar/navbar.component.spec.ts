import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { NavbarComponent } from './navbar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';

describe('NavbarComponent', () => {
  const routerMock = { url: '/es/#projects', navigateByUrl: jasmine.createSpy('navigateByUrl') };
  const themeServiceMock = {
    theme: 'light' as 'light' | 'dark',
    toggleTheme: jasmine.createSpy('toggleTheme'),
  };
  const translationServiceMock = {
    language: 'es' as 'en' | 'es' | undefined,
    setLanguage: jasmine.createSpy('setLanguage'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideTranslateService(),
        { provide: Router, useValue: routerMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
      ],
    }).compileComponents();
    routerMock.navigateByUrl.calls.reset();
    themeServiceMock.toggleTheme.calls.reset();
    translationServiceMock.setLanguage.calls.reset();
    routerMock.url = '/es/#projects';
    translationServiceMock.language = 'es';
  });

  it('navigates and closes menu', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    component.isMenuOpen = true;

    component.navigate('projects');

    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/es/#projects');
    expect(component.isMenuOpen).toBeFalse();
  });

  it('navigates to home root path', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.navigate('home');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/es/#top');
  });

  it('toggles theme and exposes current theme/lang', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.toggleTheme();

    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    expect(component.currentTheme).toBe('light');
    expect(component.currentLanguage).toBe('es');
  });

  it('falls back to default language when none set', () => {
    translationServiceMock.language = undefined;
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    expect(component.currentLanguage).toBe('en');
  });

  it('changes locale while keeping the current section', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.setLanguage('en');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/#projects');
  });

  it('changes locale from the page root without a hash', () => {
    routerMock.url = '/es/';
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.setLanguage('en');
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('toggles menu state', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.isMenuOpen = false;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
  });

  it('closes the mobile menu after choosing a section', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.isMenuOpen = true;
    component.closeMenu();
    expect(component.isMenuOpen).toBeFalse();
  });
});
