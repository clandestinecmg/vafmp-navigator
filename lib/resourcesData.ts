// lib/resourcesData.ts

export type LinkItem = { label: string; url: string };
export type TollFreeItem = { country: string; phone: string };

export const VAFMP_LINKS: LinkItem[] = [
  {
    label: 'VAFMP Overview',
    url: 'https://www.va.gov/health-care/foreign-medical-program/',
  },
  {
    label: 'Online Registration',
    url: 'https://www.va.gov/health-care/foreign-medical-program/register-form-10-7959f-1/introduction',
  },
  {
    label: 'File a Claim', // ← label fixed
    url: 'https://www.va.gov/health-care/file-foreign-medical-program-claim/', // ← URL fixed
  },
];

export const VAFMP_CONTACT = {
  email: 'HAC.FMP@va.gov',
  mainLine: {
    number: '+1-833-930-0816',
    tty: '711',
    hours: 'Monday–Friday, 8:05 a.m.–6:45 p.m. ET',
  },
};

export const VAFMP_TOLL_FREE: TollFreeItem[] = [
  { country: 'U.S. and Canada', phone: '877-345-8179' },
  { country: 'Australia', phone: '1-800-354-965' },
  { country: 'Costa Rica', phone: '0800-013-0759' },
  { country: 'Germany', phone: '0800-1800-011' },
  { country: 'Italy', phone: '800-782-655' },
  { country: 'Japan', phone: '00531-13-0871' },
  { country: 'Mexico', phone: '001-877-345-8179' },
  { country: 'Spain', phone: '900-981-776' },
  { country: 'United Kingdom', phone: '0800-032-7425' },
];
