import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

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
  readonly activeSection = signal('home');

  constructor() {
    this.activeSection.set(this.sectionFromUrl(this.router.url));
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e) => this.activeSection.set(this.sectionFromUrl(e.urlAfterRedirects)));
  }

  navItems = [
    { labelKey: 'nav.home', section: 'home' },
    { labelKey: 'nav.about', section: 'about' },
    { labelKey: 'nav.career', section: 'experience' },
    { labelKey: 'nav.toolkit', section: 'skills' },
    { labelKey: 'nav.highlights', section: 'projects' },
    { labelKey: 'nav.notes', section: 'writing' },
    { labelKey: 'nav.contact', section: 'contact' },
    { labelKey: 'nav.cv', section: 'cv' },
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

  private sectionFromUrl(url: string): string {
    return url.replace(/^\//, '').split('?')[0] || 'home';
  }
}
