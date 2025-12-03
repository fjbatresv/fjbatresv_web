import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  constructor(
    private readonly router: Router,
    private readonly themeService: ThemeService,
    private readonly translationService: TranslationService,
    private readonly translateService: TranslateService
  ) {}

  navigate(section: string): void {
    this.router.navigate([section === 'home' ? '/' : `/${section}`]);
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
    return this.translateService.currentLang || 'en';
  }
}
