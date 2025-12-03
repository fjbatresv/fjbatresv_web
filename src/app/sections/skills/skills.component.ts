import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface SkillCategory {
  titleKey: string;
  items: string[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsComponent {
  categories: SkillCategory[] = [
    {
      titleKey: 'skills.cloud',
      items: [
        'skills.items.aws',
        'skills.items.azure',
        'skills.items.lambdas',
        'skills.items.eventbridge',
        'skills.items.sqs',
        'skills.items.cloudwatch',
        'skills.items.xray',
      ],
    },
    {
      titleKey: 'skills.backend',
      items: [
        'skills.items.node',
        'skills.items.nest',
        'skills.items.ts',
        'skills.items.python',
        'skills.items.rest',
        'skills.items.microservices',
      ],
    },
    {
      titleKey: 'skills.frontend',
      items: ['skills.items.angular', 'skills.items.react', 'skills.items.nx'],
    },
    {
      titleKey: 'skills.databases',
      items: [
        'skills.items.mongodb',
        'skills.items.mysql',
        'skills.items.dynamodb',
        'skills.items.rds',
        'skills.items.redis',
      ],
    },
    {
      titleKey: 'skills.devops',
      items: [
        'skills.items.cicd',
        'skills.items.github',
        'skills.items.sonarqube',
        'skills.items.observability',
        'skills.items.docker',
        'skills.items.kubernetes',
      ],
    },
    {
      titleKey: 'skills.soft',
      items: [
        'skills.items.architecture',
        'skills.items.mentoring',
        'skills.items.leadership',
        'skills.items.writing',
      ],
    },
  ];
}
