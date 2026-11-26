import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  }
}
