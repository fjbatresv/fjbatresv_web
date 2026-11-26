export type ProjectId =
  'sdg19' | 'guso' | 'sinergia' | 'rockers' | 'pettzi' | 'sar' | 'migo' | 'pdei';

export interface PortfolioProject {
  id: ProjectId;
  url: string;
  tags: string[];
  image: { base: string; width: 1280; height: 800 };
}

export const PORTFOLIO_PROJECTS: readonly PortfolioProject[] = [
  {
    id: 'sdg19',
    url: 'https://sdg19.fjbatresv.com',
    tags: ['AWS', 'Angular', 'Nx', 'CDK'],
    image: { base: '/projects/sdg19', width: 1280, height: 800 },
  },
  {
    id: 'guso',
    url: 'https://guso.fjbatresv.com',
    tags: ['Flutter', 'NestJS', 'i18n:healthcare'],
    image: { base: '/projects/guso', width: 1280, height: 800 },
  },
  {
    id: 'sinergia',
    url: 'https://sinergia.fjbatresv.com',
    tags: ['Angular', 'AWS', 'i18n:accessibility'],
    image: { base: '/projects/sinergia', width: 1280, height: 800 },
  },
  {
    id: 'rockers',
    url: 'https://rockers.fjbatresv.com',
    tags: ['i18n:architecture', 'i18n:staticWeb'],
    image: { base: '/projects/rockers', width: 1280, height: 800 },
  },
  {
    id: 'pettzi',
    url: 'https://pettzi.fjbatresv.com',
    tags: ['Nx', 'Angular', 'AWS CDK'],
    image: { base: '/projects/pettzi', width: 1280, height: 800 },
  },
  {
    id: 'sar',
    url: 'https://sar.fjbatresv.com',
    tags: ['AWS', 'i18n:serverless', 'Nx'],
    image: { base: '/projects/sar', width: 1280, height: 800 },
  },
  {
    id: 'migo',
    url: 'https://migo.fjbatresv.com',
    tags: ['i18n:payments', 'i18n:architecture'],
    image: { base: '/projects/migo', width: 1280, height: 800 },
  },
  {
    id: 'pdei',
    url: 'https://pdei.fjbatresv.com',
    tags: ['i18n:fintech', 'i18n:uiLibrary'],
    image: { base: '/projects/pdei', width: 1280, height: 800 },
  },
];
