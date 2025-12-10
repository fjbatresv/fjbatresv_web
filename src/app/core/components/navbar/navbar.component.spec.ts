import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { NavbarComponent } from './navbar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';

describe('NavbarComponent', () => {
  const routerMock = { navigate: jasmine.createSpy('navigate') };
  const themeServiceMock = {
    theme: 'light' as 'light' | 'dark',
    toggleTheme: jasmine.createSpy('toggleTheme'),
  };
  const translationServiceMock = {
    language: 'es' as 'en' | 'es' | undefined,
    setLanguage: jasmine.createSpy('setLanguage').and.callFake((lang: 'en' | 'es') => {
      translationServiceMock.language = lang;
    }),
  };
  const translateServiceMock = { currentLang: 'es' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
    routerMock.navigate.calls.reset();
    themeServiceMock.toggleTheme.calls.reset();
    translationServiceMock.setLanguage.calls.reset();
    translateServiceMock.currentLang = 'es';
    translationServiceMock.language = 'es';
  });

  it('navigates and closes menu', () => {
    const fixture = TestBed.createComponent(NavbarComponent);
    const component = fixture.componentInstance;
    component.isMenuOpen = true;

    component.navigate('about');

    expect(routerMock.navigate).toHaveBeenCalledWith(['/about']);
    expect(component.isMenuOpen).toBeFalse();
  });

  it('navigates to home root path', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.navigate('home');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
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

  it('sets language through translation service', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.setLanguage('en');
    expect(translationServiceMock.setLanguage).toHaveBeenCalledWith('en');
  });

  it('toggles menu state', () => {
    const component = TestBed.createComponent(NavbarComponent).componentInstance;
    component.isMenuOpen = false;
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
  });
});
