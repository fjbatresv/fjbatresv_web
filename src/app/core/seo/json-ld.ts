import en from '../../../i18n/en.json';
import es from '../../../i18n/es.json';
import { PORTFOLIO_PROJECTS } from '../../sections/projects/projects.data';
import { Lang } from '../i18n/lang';

const STACK = [
  'AWS',
  'Azure',
  'NestJS',
  'Angular',
  'Node.js',
  'TypeScript',
  'Python',
  'Nx',
  'DynamoDB',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Redis',
  'GitHub Actions',
  'SonarQube',
  'Observability',
];

export function profilePageJsonLd(lang: Lang): Record<string, unknown> {
  const copy = lang === 'es' ? es : en;
  const projects = PORTFOLIO_PROJECTS.map((project, position) => ({
    '@type': 'ListItem',
    position: position + 1,
    item: {
      '@type': 'CreativeWork',
      name: copy.projects.items[project.id].title,
      url: project.url,
      description: copy.projects.items[project.id].summary,
    },
  }));
  const itemList = { '@type': 'ItemList', itemListElement: projects };
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: 'Javier Batres',
      alternateName: 'Fernando Javier Batres Velásquez',
      jobTitle:
        lang === 'es'
          ? 'Arquitecto de Soluciones y Senior Full Stack Engineer'
          : 'Solutions Architect & Senior Full Stack Engineer',
      url: 'https://fjbatresv.com/',
      image: 'https://fjbatresv.com/assets/face.webp',
      sameAs: ['https://www.linkedin.com/in/fjbatresv', 'https://github.com/fjbatresv'],
      address: { '@type': 'PostalAddress', addressCountry: 'GT' },
      knowsAbout: STACK,
    },
    about: itemList,
    hasPart: projects.map(({ item }) => item),
  };
}
