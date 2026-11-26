import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactComponent } from '../contact/contact.component';
import { ExperienceComponent } from '../experience/experience.component';
import { ProjectsComponent } from '../projects/projects.component';
import { VerdeComponent } from '../verde/verde.component';
import { HeroComponent } from './hero.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroComponent,
    ProjectsComponent,
    VerdeComponent,
    ExperienceComponent,
    ContactComponent,
  ],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
