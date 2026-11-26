import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ProjectsComponent } from './projects.component';
import es from '../../../i18n/es.json';

describe('ProjectsComponent', () => {
  let fixture: ComponentFixture<ProjectsComponent>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  beforeEach(async () => {
    analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['track']);
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [provideTranslateService(), { provide: AnalyticsService, useValue: analytics }],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
  });

  it('renders all eight links with exact destinations and safe new tabs', () => {
    const links = [...fixture.nativeElement.querySelectorAll('.project')] as HTMLAnchorElement[];
    expect(links).toHaveSize(8);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      fixture.componentInstance.projects.map((p) => p.url)
    );
    links.forEach((link) => {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
    });
  });

  it('tracks project opens', () => {
    (fixture.nativeElement.querySelector('.project') as HTMLAnchorElement).click();
    expect(analytics.track).toHaveBeenCalledWith('project_open', { project: 'sdg19' });
  });

  it('features the first two projects in the agreed order', () => {
    const featured = [
      ...fixture.nativeElement.querySelectorAll('.project--feature'),
    ] as HTMLAnchorElement[];
    expect(featured.map((link) => link.getAttribute('href'))).toEqual([
      'https://sdg19.fjbatresv.com',
      'https://guso.fjbatresv.com',
    ]);
  });

  it('renders Spanish descriptive tags while leaving technology names literal', async () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', es);
    await firstValueFrom(translate.use('es'));
    fixture.detectChanges();
    const tags = [...fixture.nativeElement.querySelectorAll('.project__tags span')].map((tag) =>
      tag.textContent.trim()
    );
    expect(tags).toContain('Accesibilidad');
    expect(tags).toContain('Arquitectura');
    expect(tags).toContain('Web estática');
    expect(tags).toContain('Pagos');
    expect(tags).toContain('Biblioteca UI');
    expect(tags).toContain('Angular');
    expect(tags).not.toContain('Accessibility');
  });
});
