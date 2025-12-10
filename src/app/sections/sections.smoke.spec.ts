import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ContactComponent } from './contact/contact.component';
import { ExperienceComponent } from './experience/experience.component';
import { ProjectsComponent } from './projects/projects.component';
import { SkillsComponent } from './skills/skills.component';
import { WritingComponent } from './writing/writing.component';

describe('Section components', () => {
  it('create standalone section components', async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ContactComponent,
        ExperienceComponent,
        ProjectsComponent,
        SkillsComponent,
        WritingComponent,
      ],
    }).compileComponents();

    expect(TestBed.createComponent(ContactComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(ExperienceComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(ProjectsComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(SkillsComponent).componentInstance).toBeTruthy();
    expect(TestBed.createComponent(WritingComponent).componentInstance).toBeTruthy();
  });
});
