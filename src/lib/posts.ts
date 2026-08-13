import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { prisma } from './db';
import type { Prisma } from '@/generated/prisma/client';

/** Localized post projections used by public pages. */
export type PostTag = { slug: string; name: string };

export type PostSummary = {
  id: string;
  key: string;
  cat: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  min: number;
  tags: PostTag[];
  series: { slug: string; name: string; order: number | null } | null;
};

export type PostDetail = PostSummary & {
  body: string;
  references: string;
  otherLocaleSlug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  author: { id: string; name: string; image: string | null };
};

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    category: true;
    tags: true;
    series: true;
    author: { select: { id: true; name: true; image: true } };
  };
}>;

const publicPostWhere = (): Prisma.PostWhereInput => ({
  publishedAt: { lte: new Date() },
  status: { in: ['PUBLISHED', 'SCHEDULED'] },
});

const dateFormat = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function toSummary(post: PostWithRelations, locale: Locale): PostSummary {
  const en = locale === 'en';
  return {
    id: post.id,
    key: post.category.key,
    cat: en ? post.category.nameEn : post.category.nameTr,
    slug: en ? post.slugEn : post.slugTr,
    title: en ? post.titleEn : post.titleTr,
    excerpt: en ? post.excerptEn : post.excerptTr,
    date: post.publishedAt ? dateFormat(locale).format(post.publishedAt) : '',
    min: (en ? post.readMinEn : post.readMinTr) ?? 0,
    tags: post.tags.map((tag) => ({
      slug: tag.slug,
      name: en ? tag.nameEn : tag.nameTr,
    })),
    series: post.series
      ? {
          slug: post.series.slug,
          name: en ? post.series.nameEn : post.series.nameTr,
          order: post.seriesOrder,
        }
      : null,
  };
}

const includePostRelations = {
  category: true,
  tags: true,
  series: true,
  author: { select: { id: true, name: true, image: true } },
} satisfies Prisma.PostInclude;

export const getPublishedPosts = cache(
  async (
    locale: Locale,
    categoryKey?: string,
    query?: string,
    tagSlug?: string,
    seriesSlug?: string,
  ): Promise<PostSummary[]> => {
    const q = query?.trim().slice(0, 120);
    const en = locale === 'en';
    const posts = await prisma.post.findMany({
      where: {
        ...publicPostWhere(),
        ...(categoryKey && categoryKey !== 'all'
          ? { category: { key: categoryKey } }
          : {}),
        ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
        ...(seriesSlug ? { series: { slug: seriesSlug } } : {}),
        ...(q
          ? {
              OR: [
                { [en ? 'titleEn' : 'titleTr']: { contains: q, mode: 'insensitive' } },
                { [en ? 'excerptEn' : 'excerptTr']: { contains: q, mode: 'insensitive' } },
                { [en ? 'bodyEn' : 'bodyTr']: { contains: q, mode: 'insensitive' } },
                {
                  tags: {
                    some: {
                      [en ? 'nameEn' : 'nameTr']: {
                        contains: q,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
                {
                  series: {
                    [en ? 'nameEn' : 'nameTr']: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: includePostRelations,
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map((post) => toSummary(post, locale));
  },
);

export const getFeaturedPosts = cache(async (locale: Locale) => {
  const posts = await getPublishedPosts(locale);
  return posts.slice(0, 3);
});

export const getPostBySlug = cache(
  async (locale: Locale, slug: string): Promise<PostDetail | null> => {
    const post = await prisma.post.findFirst({
      where: {
        ...publicPostWhere(),
        ...(locale === 'en' ? { slugEn: slug } : { slugTr: slug }),
      },
      include: includePostRelations,
    });
    if (!post) return null;
    const en = locale === 'en';
    return {
      ...toSummary(post, locale),
      body: en ? post.bodyEn : post.bodyTr,
      references: en ? post.referencesEn : post.referencesTr,
      otherLocaleSlug: en ? post.slugTr : post.slugEn,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        name: post.author.name?.trim() || 'quantint',
        image: post.author.image,
      },
    };
  },
);

export const getRelatedPosts = cache(
  async (postId: string, locale: Locale): Promise<PostSummary[]> => {
    const source = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        categoryId: true,
        seriesId: true,
        tags: { select: { id: true } },
      },
    });
    if (!source) return [];
    const tagIds = source.tags.map((tag) => tag.id);
    const candidates = await prisma.post.findMany({
      where: {
        ...publicPostWhere(),
        id: { not: postId },
        OR: [
          { categoryId: source.categoryId },
          ...(source.seriesId ? [{ seriesId: source.seriesId }] : []),
          ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
        ],
      },
      include: includePostRelations,
      orderBy: { publishedAt: 'desc' },
      take: 12,
    });
    return candidates
      .map((post) => ({
        post,
        score:
          (post.seriesId && post.seriesId === source.seriesId ? 4 : 0) +
          (post.categoryId === source.categoryId ? 2 : 0) +
          post.tags.filter((tag) => tagIds.includes(tag.id)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ post }) => toSummary(post, locale));
  },
);

export const getPostSeriesEntries = cache(
  async (seriesSlug: string, locale: Locale) => {
    const posts = await prisma.post.findMany({
      where: { ...publicPostWhere(), series: { slug: seriesSlug } },
      include: includePostRelations,
      orderBy: [{ seriesOrder: 'asc' }, { publishedAt: 'asc' }],
    });
    return posts.map((post) => toSummary(post, locale));
  },
);

/** Every currently public slug pair — sitemap and static params. */
export const getAllSlugs = cache(async () =>
  prisma.post.findMany({
    where: publicPostWhere(),
    select: { slugTr: true, slugEn: true, updatedAt: true },
  }),
);
