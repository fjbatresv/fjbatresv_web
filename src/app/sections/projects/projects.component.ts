import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PORTFOLIO_PROJECTS } from './projects.data';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly projects = PORTFOLIO_PROJECTS;
  private readonly analytics = inject(AnalyticsService);

  trackProject(id: string): void {
    this.analytics.track('project_open', { project: id });
  }
}
