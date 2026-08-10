import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { prisma } from './db';

export type CategoryDef = {
  key: string;
  code: string;
  nameTr: string;
  nameEn: string;
};

/** The six topic pillars, ordered as in the design. Seeded by prisma/seed.ts. */
export const getCategories = cache(async (): Promise<CategoryDef[]> => {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { key: true, code: true, nameTr: true, nameEn: true },
  });
});

export function categoryName(
  cat: Pick<CategoryDef, 'nameTr' | 'nameEn'>,
  locale: Locale,
): string {
  return locale === 'en' ? cat.nameEn : cat.nameTr;
}
