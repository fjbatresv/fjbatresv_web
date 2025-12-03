import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface WritingItem {
  titleKey: string;
  date: string;
  summaryKey: string;
  link?: string;
}

@Component({
  selector: 'app-writing',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WritingComponent {
  items: WritingItem[] = [
    {
      titleKey: 'writing.item1.title',
      date: '2024',
      summaryKey: 'writing.item1.summary',
      link: 'https://medium.com/@fjbatresv',
    },
    {
      titleKey: 'writing.item2.title',
      date: '2023',
      summaryKey: 'writing.item2.summary',
      link: 'https://dev.to/fjbatresv',
    },
    {
      titleKey: 'writing.item3.title',
      date: '2022',
      summaryKey: 'writing.item3.summary',
      link: 'https://medium.com/@fjbatresv',
    },
  ];
}
