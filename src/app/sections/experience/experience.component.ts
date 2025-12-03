import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ExperienceItem {
  company: string;
  roleKey: string;
  period: string;
  bullets: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  experiences: ExperienceItem[] = [
    {
      company: 'Banco G&T Continental',
      roleKey: 'experience.gtc.role',
      period: '2025-Present',
      bullets: ['experience.gtc.b1', 'experience.gtc.b2', 'experience.gtc.b3', 'experience.gtc.b4'],
    },
    {
      company: 'Halo Media',
      roleKey: 'experience.halo.role',
      period: '2023 – 2025',
      bullets: ['experience.halo.b1', 'experience.halo.b2', 'experience.halo.b3'],
    },
    {
      company: 'Truelogic',
      roleKey: 'experience.truelogic.role',
      period: '2022 – 2023',
      bullets: ['experience.truelogic.b1', 'experience.truelogic.b2', 'experience.truelogic.b3'],
    },
    {
      company: 'Yalutec',
      roleKey: 'experience.yalutec.role',
      period: '2021 – 2022',
      bullets: ['experience.yalutec.b1', 'experience.yalutec.b2', 'experience.yalutec.b3'],
    },
    {
      company: 'PayPal',
      roleKey: 'experience.paypal.role',
      period: '2020 – 2021',
      bullets: ['experience.paypal.b1', 'experience.paypal.b2', 'experience.paypal.b3'],
    },
    {
      company: 'Early Journey',
      roleKey: 'experience.early.role',
      period: '2013 – 2020',
      bullets: ['experience.early.b1', 'experience.early.b2', 'experience.early.b3'],
    },
  ];
}
