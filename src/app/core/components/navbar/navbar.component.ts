import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  navItems = [
    { labelKey: 'nav.home', section: 'home' },
    { labelKey: 'nav.about', section: 'about' },
    { labelKey: 'nav.career', section: 'experience' },
    { labelKey: 'nav.toolkit', section: 'skills' },
    { labelKey: 'nav.highlights', section: 'projects' },
    { labelKey: 'nav.notes', section: 'writing' },
    { labelKey: 'nav.contact', section: 'contact' },
  ];

  logoUrl = 'assets/logo.webp';
  isMenuOpen = false;
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);
  private readonly translateService = inject(TranslateService);

  navigate(section: string): void {
    this.router.navigate([section === 'home' ? '/' : `/${section}`]);
    this.isMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLanguage(lang: 'en' | 'es'): void {
    this.translationService.setLanguage(lang);
  }

  get currentTheme(): 'light' | 'dark' {
    return this.themeService.theme;
  }

  get currentLanguage(): string {
    return this.translationService.language || 'en';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
