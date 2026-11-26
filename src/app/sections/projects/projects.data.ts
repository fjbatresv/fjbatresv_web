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
    tags: ['Flutter', 'NestJS', 'Healthcare'],
    image: { base: '/projects/guso', width: 1280, height: 800 },
  },
  {
    id: 'sinergia',
    url: 'https://sinergia.fjbatresv.com',
    tags: ['Angular', 'AWS', 'Accessibility'],
    image: { base: '/projects/sinergia', width: 1280, height: 800 },
  },
  {
    id: 'rockers',
    url: 'https://rockers.fjbatresv.com',
    tags: ['Architecture', 'Static web'],
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
    tags: ['AWS', 'Serverless', 'Nx'],
    image: { base: '/projects/sar', width: 1280, height: 800 },
  },
  {
    id: 'migo',
    url: 'https://migo.fjbatresv.com',
    tags: ['Payments', 'Architecture'],
    image: { base: '/projects/migo', width: 1280, height: 800 },
  },
  {
    id: 'pdei',
    url: 'https://pdei.fjbatresv.com',
    tags: ['Fintech', 'UI library'],
    image: { base: '/projects/pdei', width: 1280, height: 800 },
  },
];
