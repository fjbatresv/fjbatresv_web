import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Lang, localizedPath } from '../../i18n/lang';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
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

  navigate(section: string): void {
    void this.router.navigateByUrl(localizedPath(section, this.currentLanguage));
    this.isMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLanguage(lang: Lang): void {
    void this.router.navigateByUrl(localizedPath(this.currentSection, lang));
  }

  get currentTheme(): 'light' | 'dark' {
    return this.themeService.theme;
  }

  get currentLanguage(): Lang {
    return this.translationService.language || 'en';
  }

  private get currentSection(): string {
    const path = this.router.url
      .split(/[?#]/, 1)[0]
      .replace(/^\/es(?=\/|$)/, '')
      .replace(/^\//, '');
    return this.navItems.some((item) => item.section === path) ? path : 'home';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
