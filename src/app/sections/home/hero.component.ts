import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Lang, localizedPath } from '../../core/i18n/lang';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  private readonly analytics = inject(AnalyticsService);
  private readonly translationService = inject(TranslationService);

  sectionHref(section: string): string {
    const lang: Lang = this.translationService.language || 'en';
    return localizedPath(lang, section);
  }

  track(event: 'cta_project' | 'cta_hire'): void {
    this.analytics.track(event);
  }
}
