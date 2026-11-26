import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-how-i-work',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './how-i-work.component.html',
  styleUrls: ['./how-i-work.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowIWorkComponent {
  private readonly analytics = inject(AnalyticsService);
  track(): void {
    this.analytics.track('contact_calendar');
  }
}
