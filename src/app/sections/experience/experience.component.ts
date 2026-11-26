import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';

interface ExperienceItem {
  readonly company: string;
  readonly roleKey: string;
  readonly period: string;
  readonly bullets: readonly string[];
  readonly achievements?: { title: string; summary: string }[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  private readonly translation = inject(TranslationService);
  private readonly analytics = inject(AnalyticsService);
  readonly stack = [
    'AWS',
    'Azure',
    'NestJS',
    'Angular',
    'Node.js',
    'TypeScript',
    'Python',
    'Nx',
    'DynamoDB',
    'MongoDB',
    'PostgreSQL/MySQL',
    'Redis',
    'GitHub Actions',
    'SonarQube',
    'Observability',
  ];
  readonly experiences: readonly ExperienceItem[] = [
    {
      company: 'experience.companies.gtc',
      roleKey: 'experience.gtc.role',
      period: 'experience.periods.current',
      bullets: ['experience.gtc.b1', 'experience.gtc.b2'],
      achievements: [{ title: 'projects.titles.journey', summary: 'projects.journey' }],
    },
    {
      company: 'experience.companies.halo',
      roleKey: 'experience.halo.role',
      period: 'experience.periods.halo',
      bullets: ['experience.halo.b1', 'experience.halo.b2'],
      achievements: [{ title: 'projects.titles.vip', summary: 'projects.vip' }],
    },
    {
      company: 'experience.companies.truelogic',
      roleKey: 'experience.truelogic.role',
      period: 'experience.periods.truelogic',
      bullets: ['experience.truelogic.b1', 'experience.truelogic.b2'],
    },
    {
      company: 'experience.companies.yalutec',
      roleKey: 'experience.yalutec.role',
      period: 'experience.periods.yalutec',
      bullets: ['experience.yalutec.b1', 'experience.yalutec.b2'],
    },
    {
      company: 'experience.companies.paypal',
      roleKey: 'experience.paypal.role',
      period: 'experience.periods.paypal',
      bullets: ['experience.paypal.b1', 'experience.paypal.b2'],
    },
    {
      company: 'experience.companies.early',
      roleKey: 'experience.early.role',
      period: 'experience.periods.early',
      bullets: ['experience.early.b1', 'experience.early.b2'],
      achievements: [
        { title: 'projects.titles.capriccio', summary: 'projects.capriccio' },
        { title: 'projects.titles.ascend', summary: 'projects.ascend' },
      ],
    },
  ];

  get hireLink(): string {
    const subject =
      this.translation.language === 'es' ? 'Oportunidad laboral: ' : 'Job opportunity: ';
    return `mailto:fjbatresv@gmail.com?subject=${encodeURIComponent(subject)}`;
  }

  trackHire(): void {
    this.analytics.track('contact_email', { path: 'hire' });
  }
}
