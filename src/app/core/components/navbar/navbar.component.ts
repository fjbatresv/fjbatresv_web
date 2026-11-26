import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';
import { Lang, localizedPath } from '../../i18n/lang';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LogoComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  navItems = [
    { labelKey: 'nav.home', section: 'top' },
    { labelKey: 'nav.highlights', section: 'projects' },
    { labelKey: 'nav.verde', section: 'verde' },
    { labelKey: 'nav.career', section: 'experience' },
    { labelKey: 'nav.how', section: 'how-i-work' },
    { labelKey: 'nav.contact', section: 'contact' },
  ];

  isMenuOpen = false;
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly translationService = inject(TranslationService);

  navigate(section: string): void {
    void this.router.navigateByUrl(
      localizedPath(this.currentLanguage, section === 'home' ? 'top' : section)
    );
    this.isMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setLanguage(lang: Lang): void {
    void this.router.navigateByUrl(localizedPath(lang, this.router.url.split('#')[1] || ''));
  }

  get currentTheme(): 'light' | 'dark' {
    return this.themeService.theme;
  }

  get currentLanguage(): Lang {
    return this.translationService.language || 'en';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  sectionHref(section: string): string {
    return localizedPath(this.currentLanguage, section);
  }
}
