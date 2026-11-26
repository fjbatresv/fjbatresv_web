import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly translation = inject(TranslationService);
  private readonly analytics = inject(AnalyticsService);
  get emailLink(): string {
    const subject = this.translation.language === 'es' ? 'Proyecto: ' : 'Project: ';
    return `mailto:fjbatresv@gmail.com?subject=${encodeURIComponent(subject)}`;
  }
  track(event: 'contact_email' | 'contact_linkedin' | 'contact_calendar' | 'contact_github'): void {
    this.analytics.track(event);
  }
}
