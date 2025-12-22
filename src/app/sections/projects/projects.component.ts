import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ProjectItem {
  titleKey: string;
  descriptionKey: string;
  tags: string[];
  link?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  projects: ProjectItem[] = [
    {
      titleKey: 'projects.titles.journey',
      descriptionKey: 'projects.journey',
      tags: ['projects.tags.banking', 'projects.tags.azure', 'projects.tags.governance'],
    },
    {
      titleKey: 'projects.titles.vip',
      descriptionKey: 'projects.vip',
      tags: [
        'projects.tags.nestjs',
        'projects.tags.angular',
        'projects.tags.aws',
        'projects.tags.queues',
      ],
    },
    {
      titleKey: 'projects.titles.pettzi',
      descriptionKey: 'projects.pettzi',
      tags: [
        'projects.tags.health',
        'projects.tags.aws',
        'projects.tags.saas',
        'projects.tags.angular',
        'projects.tags.lambdas',
        'projects.tags.nx',
        'projects.tags.nosql',
      ],
    },
    {
      titleKey: 'projects.titles.sinergia',
      descriptionKey: 'projects.sinergia',
      tags: ['projects.tags.angular', 'projects.tags.aws', 'projects.tags.event'],
      link: 'https://sinergiadoradagt.com',
    },
    {
      titleKey: 'projects.titles.capriccio',
      descriptionKey: 'projects.capriccio',
      tags: ['projects.tags.nestjs', 'projects.tags.angular', 'projects.tags.saas'],
      link: 'https://hechocapriccio.com',
    },
    {
      titleKey: 'projects.titles.sar',
      descriptionKey: 'projects.sar',
      link: 'https://www.sar-latam.com/sar-back-office-2024/',
      tags: [
        'projects.tags.aws',
        'projects.tags.lambdas',
        'projects.tags.event',
        'projects.tags.nx',
      ],
    },
    {
      titleKey: 'projects.titles.ascend',
      descriptionKey: 'projects.ascend',
      tags: [
        'projects.tags.flutter',
        'projects.tags.gcp',
        'projects.tags.mobile',
        'projects.tags.nosql',
      ],
      link: 'https://www.novuskills.ai/',
    },
  ];
}
