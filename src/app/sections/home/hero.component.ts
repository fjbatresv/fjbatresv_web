import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';

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
  track(event: 'cta_project' | 'cta_hire'): void {
    this.analytics.track(event);
  }
}
