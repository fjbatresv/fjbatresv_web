import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NavbarComponent } from './navbar.component';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';

class ThemeServiceMock {
  theme: 'light' | 'dark' = 'light';
  toggleTheme = jasmine.createSpy('toggleTheme');
}

class TranslationServiceMock {
  setLanguage = jasmine.createSpy('setLanguage');
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let theme: ThemeServiceMock;
  let translation: TranslationServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, TranslateModule.forRoot(), NavbarComponent],
      providers: [
        { provide: ThemeService, useClass: ThemeServiceMock },
        { provide: TranslationService, useClass: TranslationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    theme = TestBed.inject(ThemeService) as unknown as ThemeServiceMock;
    translation = TestBed.inject(TranslationService) as unknown as TranslationServiceMock;
    fixture.detectChanges();
  });

  it('should render nav items', () => {
    const links = fixture.nativeElement.querySelectorAll('.navbar__link');
    expect(links.length).toBe(component.navItems.length);
  });

  it('should toggle theme', () => {
    component.toggleTheme();
    expect(theme.toggleTheme).toHaveBeenCalled();
  });

  it('should switch language', () => {
    component.setLanguage('es');
    expect(translation.setLanguage).toHaveBeenCalledWith('es');
  });
});
