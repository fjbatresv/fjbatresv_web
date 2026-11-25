import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `<main class="container">
    <h1>{{ 'notFound.title' | translate }}</h1>
    <p>{{ 'notFound.body' | translate }}</p>
    <a routerLink="/">{{ 'notFound.cta' | translate }}</a>
  </main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
