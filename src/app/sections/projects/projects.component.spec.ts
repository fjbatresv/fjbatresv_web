import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ProjectsComponent } from './projects.component';

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
    expect(links.length).toBe(8);
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
});
