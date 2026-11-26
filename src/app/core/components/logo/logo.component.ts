import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template:
    '<img src="/brand/jb-isotipo-96.webp" [width]="dimensions" [height]="dimensions" alt="Javier Batres" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  get dimensions(): number {
    return { sm: 48, md: 72, lg: 96 }[this.size];
  }
}
