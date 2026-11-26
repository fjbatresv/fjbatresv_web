import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-verde',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './verde.component.html',
  styleUrls: ['./verde.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerdeComponent {
  private readonly analytics = inject(AnalyticsService);
  track(): void {
    this.analytics.track('verde_open');
  }
}
