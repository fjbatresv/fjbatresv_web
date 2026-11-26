import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { NavbarComponent } from './core/components/navbar/navbar.component';
import { SeoLinksService } from './core/services/seo-links.service';
import { TranslationService } from './core/services/translation.service';
import { LogoComponent } from './core/components/logo/logo.component';
import { AnalyticsEvent, AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, TranslatePipe, LogoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly translationService = inject(TranslationService);
  private readonly seoLinksService = inject(SeoLinksService);
  private readonly analytics = inject(AnalyticsService);

  get emailLink(): string {
    const subject = this.translationService.language === 'es' ? 'Proyecto: ' : 'Project: ';
    return `mailto:fjbatresv@gmail.com?subject=${encodeURIComponent(subject)}`;
  }

  track(event: AnalyticsEvent): void {
    this.analytics.track(event);
  }

  ngOnInit(): void {
    // Initialize language first to set <html lang=""> dynamically
    this.translationService.init();
    this.seoLinksService.init();

    this.title.setTitle('Javier Batres');
    this.meta.addTags([
      {
        name: 'description',
        content: 'Solutions Architect and Senior Full Stack Engineer from Guatemala.',
      },
      { property: 'og:title', content: 'Javier Batres' },
      {
        property: 'og:description',
        content: 'Solutions Architect and Senior Full Stack Engineer from Guatemala.',
      },
      { property: 'og:type', content: 'website' },
      {
        name: 'keywords',
        content: 'Javier Batres, Solutions Architect, Cloud, Angular, NestJS, AWS, Guatemala',
      },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#1e88e5' },
      { property: 'og:image', content: 'https://fjbatresv.com/assets/og-image.webp' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Javier Batres – Solutions Architect' },
      {
        name: 'twitter:description',
        content: 'Cloud, architecture, and full-stack delivery from Guatemala.',
      },
    ]);
  }
}
