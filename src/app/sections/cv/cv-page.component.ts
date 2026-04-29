import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { animate, group, query, stagger, style, transition, trigger } from '@angular/animations';

const CV_TITLE = 'Javier Batres — CV | Staff Full Stack Engineer & Solutions Architect';
const CV_DESCRIPTION =
  'Curriculum Vitae of Fernando Javier Batres Velásquez — Staff Engineer, Solutions Architect, ' +
  'and AI-First Engineering specialist with 10+ years delivering production systems across ' +
  'web, backend, mobile, and cloud (AWS / Azure).';

interface Skill {
  text: string;
  variant?: 'accent' | 'warm';
}

interface SkillGroup {
  id: string;
  labelKey: string;
  skills: Skill[];
}

interface PipelineStep {
  id: string;
  label: string;
  descKey: string;
}

interface ExpItem {
  id: string;
  roleKey: string;
  company: string;
  location: string;
  periodKey: string;
  current: boolean;
  tags: string[];
  bulletKeys: string[];
}

interface ProjectItem {
  name: string;
  descKey: string;
  url: string;
  urlType: 'github' | 'live';
  featured: boolean;
}

@Component({
  selector: 'app-cv-page',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './cv-page.component.html',
  styleUrls: ['./cv-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tags', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'scale(0.82) translateY(6px)' }),
            stagger(22, [
              animate(
                '240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                style({ opacity: 1, transform: 'none' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [stagger(12, [animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))])],
          { optional: true }
        ),
      ]),
    ]),
    trigger('stepChange', [
      transition('* => *', [
        group([
          animate('90ms ease-in', style({ opacity: 0.1 })),
          animate('220ms 90ms ease-out', style({ opacity: 1 })),
        ]),
      ]),
    ]),
  ],
})
export class CvPageComponent implements OnInit, OnDestroy {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly el = inject(ElementRef);

  private jsonLdEl: HTMLScriptElement | null = null;
  private observer: IntersectionObserver | null = null;

  readonly activeFilter = signal('all');
  readonly activeStep = signal('openapi');

  readonly filteredSkills = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.skillGroups.flatMap((g) => g.skills);
    return this.skillGroups.find((g) => g.id === f)?.skills ?? [];
  });

  readonly selectedStep = computed(
    () => this.pipelineSteps.find((s) => s.id === this.activeStep())!
  );

  readonly filterCategories = [
    { key: 'all', labelKey: 'cv.filter.all' },
    { key: 'languages', labelKey: 'cv.filter.languages' },
    { key: 'frontend', labelKey: 'cv.filter.frontend' },
    { key: 'backend', labelKey: 'cv.filter.backend' },
    { key: 'mobile', labelKey: 'cv.filter.mobile' },
    { key: 'aws', labelKey: 'cv.filter.aws' },
    { key: 'azure', labelKey: 'cv.filter.azure' },
    { key: 'devops', labelKey: 'cv.filter.devops' },
    { key: 'architecture', labelKey: 'cv.filter.architecture' },
  ];

  readonly skillGroups: SkillGroup[] = [
    {
      id: 'languages',
      labelKey: 'cv.filter.languages',
      skills: [
        { text: 'TypeScript', variant: 'accent' },
        { text: 'JavaScript' },
        { text: 'Python' },
        { text: 'Kotlin' },
        { text: 'Dart' },
        { text: 'Java' },
      ],
    },
    {
      id: 'frontend',
      labelKey: 'cv.filter.frontend',
      skills: [
        { text: 'Angular 21+', variant: 'accent' },
        { text: 'React' },
        { text: 'RxJS' },
        { text: 'i18n' },
        { text: 'Design Systems' },
        { text: 'Performance' },
      ],
    },
    {
      id: 'backend',
      labelKey: 'cv.filter.backend',
      skills: [
        { text: 'NestJS', variant: 'accent' },
        { text: 'Node.js' },
        { text: 'Serverless' },
        { text: 'Microservices' },
        { text: 'OpenAPI' },
        { text: 'REST' },
      ],
    },
    {
      id: 'mobile',
      labelKey: 'cv.filter.mobile',
      skills: [
        { text: 'Flutter' },
        { text: 'Kotlin Android' },
        { text: 'NFC / Hardware' },
        { text: 'API-first' },
      ],
    },
    {
      id: 'aws',
      labelKey: 'cv.filter.aws',
      skills: [
        { text: 'Lambda', variant: 'accent' },
        { text: 'API Gateway' },
        { text: 'DynamoDB' },
        { text: 'SQS' },
        { text: 'Kinesis' },
        { text: 'CDK' },
        { text: 'S3' },
        { text: 'RDS' },
      ],
    },
    {
      id: 'azure',
      labelKey: 'cv.filter.azure',
      skills: [
        { text: 'AKS', variant: 'accent' },
        { text: 'Container Apps' },
        { text: 'API Management' },
        { text: 'Service Bus' },
        { text: 'Entra ID' },
        { text: 'Key Vault' },
        { text: 'Monitor' },
      ],
    },
    {
      id: 'devops',
      labelKey: 'cv.filter.devops',
      skills: [
        { text: 'GitHub Actions' },
        { text: 'Azure DevOps' },
        { text: 'Terraform' },
        { text: 'Docker' },
        { text: 'Kubernetes' },
        { text: 'SonarCloud', variant: 'warm' },
        { text: 'Snyk', variant: 'warm' },
        { text: 'CodeRabbit', variant: 'warm' },
        { text: 'Kiro', variant: 'warm' },
      ],
    },
    {
      id: 'architecture',
      labelKey: 'cv.filter.architecture',
      skills: [
        { text: 'C4 Model' },
        { text: 'ADRs' },
        { text: 'Event-Driven' },
        { text: 'DDD' },
        { text: 'Nx Monorepo' },
        { text: 'Shift-Left' },
        { text: 'Observability' },
      ],
    },
  ];

  readonly pipelineSteps: PipelineStep[] = [
    { id: 'openapi', label: 'OpenAPI Contract', descKey: 'cv.pipeline.openapi' },
    { id: 'codex', label: 'Codex Generation', descKey: 'cv.pipeline.codex' },
    { id: 'kiro', label: 'Kiro Validation', descKey: 'cv.pipeline.kiro' },
    { id: 'coderabbit', label: 'CodeRabbit Review', descKey: 'cv.pipeline.coderabbit' },
    { id: 'snyk', label: 'Snyk + SonarCloud', descKey: 'cv.pipeline.snyk' },
    { id: 'cicd', label: 'CI/CD Enforcement', descKey: 'cv.pipeline.cicd' },
  ];

  readonly experience: ExpItem[] = [
    {
      id: 'gtc',
      roleKey: 'cv.exp.gtc.role',
      company: 'Banco G&T Continental',
      location: 'Guatemala City',
      periodKey: 'cv.exp.gtc.period',
      current: true,
      tags: ['Azure', 'AKS', 'Container Apps', 'GitHub Actions', 'Terraform', 'Snyk'],
      bulletKeys: [
        'cv.exp.gtc.b1',
        'cv.exp.gtc.b2',
        'cv.exp.gtc.b3',
        'cv.exp.gtc.b4',
        'cv.exp.gtc.b5',
        'cv.exp.gtc.b6',
        'cv.exp.gtc.b7',
      ],
    },
    {
      id: 'tempus',
      roleKey: 'cv.exp.tempus.role',
      company: 'Tempus · Deep6 AI Program',
      location: 'Remote',
      periodKey: 'cv.exp.tempus.period',
      current: true,
      tags: ['AWS', 'DynamoDB', 'SQS', 'Kinesis', 'React', 'Python', 'Kotlin'],
      bulletKeys: [
        'cv.exp.tempus.b1',
        'cv.exp.tempus.b2',
        'cv.exp.tempus.b3',
        'cv.exp.tempus.b4',
        'cv.exp.tempus.b5',
      ],
    },
    {
      id: 'halo',
      roleKey: 'cv.exp.halo.role',
      company: 'Halo Media',
      location: 'Remote',
      periodKey: 'cv.exp.halo.period',
      current: false,
      tags: ['Node.js', 'TypeScript', 'React', 'AWS', 'Nx'],
      bulletKeys: ['cv.exp.halo.b1', 'cv.exp.halo.b2', 'cv.exp.halo.b3'],
    },
    {
      id: 'truelogic',
      roleKey: 'cv.exp.truelogic.role',
      company: 'Truelogic',
      location: 'Remote',
      periodKey: 'cv.exp.truelogic.period',
      current: false,
      tags: ['React', 'NestJS', 'AWS', 'Blockchain'],
      bulletKeys: ['cv.exp.truelogic.b1', 'cv.exp.truelogic.b2', 'cv.exp.truelogic.b3'],
    },
    {
      id: 'paypal',
      roleKey: 'cv.exp.paypal.role',
      company: 'PayPal',
      location: 'Remote',
      periodKey: 'cv.exp.paypal.period',
      current: false,
      tags: ['Fintech', 'TypeScript', 'AWS'],
      bulletKeys: ['cv.exp.paypal.b1', 'cv.exp.paypal.b2'],
    },
    {
      id: 'early',
      roleKey: 'cv.exp.early.role',
      company: 'Yalutec · Infonet / Novuskills',
      location: 'Guatemala',
      periodKey: 'cv.exp.early.period',
      current: false,
      tags: ['Android', 'Java', 'Node.js', 'Flutter', 'API Design'],
      bulletKeys: ['cv.exp.early.b1', 'cv.exp.early.b2'],
    },
  ];

  readonly projects: ProjectItem[] = [
    {
      name: 'sdg19-final',
      descKey: 'cv.projects.sdg19.desc',
      url: 'https://github.com/fjbatresv/sdg19-final',
      urlType: 'github',
      featured: true,
    },
    {
      name: 'Pettzi',
      descKey: 'cv.projects.pettzi.desc',
      url: 'https://github.com/fjbatresv/pettzi',
      urlType: 'github',
      featured: true,
    },
    {
      name: 'flutter_smart_forms',
      descKey: 'cv.projects.flutter.desc',
      url: 'https://github.com/fjbatresv/flutter_smart_forms',
      urlType: 'github',
      featured: false,
    },
    {
      name: 'fjbatresv_web',
      descKey: 'cv.projects.web.desc',
      url: 'https://fjbatresv.com',
      urlType: 'live',
      featured: false,
    },
    {
      name: 'SerialNFC',
      descKey: 'cv.projects.nfc.desc',
      url: 'https://github.com/fjbatresv/SerialNFC',
      urlType: 'github',
      featured: false,
    },
  ];

  constructor() {
    afterNextRender(() => {
      this.setupScrollAnimations();
    });
  }

  ngOnInit(): void {
    this.setMeta();
    this.injectJsonLd();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.titleService.setTitle('Javier Batres');
    this.meta.updateTag({
      name: 'description',
      content: 'Solutions Architect and Senior Full Stack Engineer from Guatemala.',
    });
    this.meta.updateTag({ property: 'og:title', content: 'Javier Batres' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Solutions Architect and Senior Full Stack Engineer from Guatemala.',
    });
    this.jsonLdEl?.remove();
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
  }

  setActiveStep(id: string): void {
    this.activeStep.set(id);
  }

  private setupScrollAnimations(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    );
    this.el.nativeElement
      .querySelectorAll('.reveal')
      .forEach((el: Element) => this.observer!.observe(el));
  }

  private setMeta(): void {
    this.titleService.setTitle(CV_TITLE);
    this.meta.updateTag({ name: 'description', content: CV_DESCRIPTION });
    this.meta.updateTag({ property: 'og:title', content: CV_TITLE });
    this.meta.updateTag({ property: 'og:description', content: CV_DESCRIPTION });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'Javier Batres CV, Staff Engineer, Solutions Architect, Angular, AWS, Azure, TypeScript, Guatemala',
    });
  }

  private injectJsonLd(): void {
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Fernando Javier Batres Velásquez',
      alternateName: 'Javier Batres',
      url: 'https://fjbatresv.com',
      email: 'fjbatresv@gmail.com',
      jobTitle: 'Staff Full Stack Engineer & Solutions Architect',
      description: CV_DESCRIPTION,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Guatemala City',
        addressCountry: 'GT',
      },
      sameAs: [
        'https://github.com/fjbatresv',
        'https://www.linkedin.com/in/fjbatresv',
        'https://fjbatresv.medium.com',
        'https://dev.to/fjbatresv',
      ],
      knowsAbout: [
        'TypeScript',
        'JavaScript',
        'Python',
        'Kotlin',
        'Angular',
        'React',
        'Node.js',
        'NestJS',
        'AWS',
        'Azure',
        'Kubernetes',
        'Docker',
        'Terraform',
        'Solutions Architecture',
        'AI-first Engineering',
        'DevOps',
        'Microservices',
      ],
    });
    this.doc.head.appendChild(script);
    this.jsonLdEl = script;
  }
}
