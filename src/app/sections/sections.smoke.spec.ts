import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ContactComponent } from './contact/contact.component';
import { ExperienceComponent } from './experience/experience.component';
import { ProjectsComponent } from './projects/projects.component';
import { HowIWorkComponent } from './how-i-work/how-i-work.component';
import { VerdeComponent } from './verde/verde.component';
import { AnalyticsService } from '../core/services/analytics.service';
import { TranslationService } from '../core/services/translation.service';

describe('Section components', () => {
  it('create standalone section components', async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContactComponent,
        ExperienceComponent,
        ProjectsComponent,
        HowIWorkComponent,
        VerdeComponent,
      ],
      providers: [
        provideTranslateService(),
        { provide: AnalyticsService, useValue: jasmine.createSpyObj('analytics', ['track']) },
        { provide: TranslationService, useValue: { language: 'en' } },
      ],
    }).compileComponents();

    expect(TestBed.createComponent(ContactComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(ExperienceComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(ProjectsComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(HowIWorkComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(VerdeComponent).componentInstance).toBeTruthy();
  });
});
