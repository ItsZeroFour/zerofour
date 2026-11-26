import 'server-only';
import { cache } from 'react';
import config from '@payload-config';
import { getPayload } from 'payload';
import type { Locale } from '@/i18n/routing';

import type { Project, SiteContent } from './content-types';
export type { MediaDoc, Fact, SiteContent, Project } from './content-types';
export { asMedia, asImageMedia } from './content-types';

const payload = cache(() => getPayload({ config }));

export const getSite = cache(async (locale: Locale): Promise<SiteContent> => {
  const p = await payload();
  return (await p.findGlobal({ slug: 'site', locale, depth: 1 })) as unknown as SiteContent;
});

export const getProjects = cache(async (locale: Locale): Promise<Project[]> => {
  const p = await payload();
  const res = await p.find({
    collection: 'projects',
    locale,
    depth: 1,
    sort: 'order',
    limit: 50,
    where: { _status: { equals: 'published' } },
  });
  return res.docs as unknown as Project[];
});

export const getProject = cache(async (locale: Locale, slug: string): Promise<Project | null> => {
  const p = await payload();
  const res = await p.find({
    collection: 'projects', locale, depth: 1, limit: 1, draft: false, overrideAccess: false,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  });
  return (res.docs[0] as unknown as Project | undefined) ?? null;
});

