import 'server-only';

import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { prisma } from './db';
import type { Post, Category } from '@/generated/prisma/client';

/**
 * Post data access. Everything the pages consume flows through here, projected
 * into the requested locale — components never touch the Tr/En column pairs
 * directly.
 */

export type PostSummary = {
  id: string;
  key: string; // category key, e.g. 'ml' — used for ?cat= filters
  cat: string; // localized category name
  slug: string;
  title: string;
  excerpt: string;
  date: string; // formatted for display
  min: number;
};

export type PostDetail = PostSummary & {
  body: string; // markdown source
  otherLocaleSlug: string; // paired slug for hreflang / language toggle
  publishedAt: Date | null;
};

const dateFormat = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function toSummary(
  post: Post & { category: Category },
  locale: Locale,
): PostSummary {
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
  };
}

export const getPublishedPosts = cache(
  async (locale: Locale, categoryKey?: string): Promise<PostSummary[]> => {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        ...(categoryKey && categoryKey !== 'all'
          ? { category: { key: categoryKey } }
          : {}),
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
    });
    return posts.map((p) => toSummary(p, locale));
  },
);

export const getFeaturedPosts = cache(
  async (locale: Locale): Promise<PostSummary[]> => {
    const posts = await getPublishedPosts(locale);
    return posts.slice(0, 3);
  },
);

export const getPostBySlug = cache(
  async (locale: Locale, slug: string): Promise<PostDetail | null> => {
    const post = await prisma.post.findFirst({
      where: {
        status: 'PUBLISHED',
        ...(locale === 'en' ? { slugEn: slug } : { slugTr: slug }),
      },
      include: { category: true },
    });
    if (!post) return null;
    const en = locale === 'en';
    return {
      ...toSummary(post, locale),
      body: en ? post.bodyEn : post.bodyTr,
      otherLocaleSlug: en ? post.slugTr : post.slugEn,
      publishedAt: post.publishedAt,
    };
  },
);

/** Every published slug pair — sitemap and static params. */
export const getAllSlugs = cache(async () => {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slugTr: true, slugEn: true, updatedAt: true },
  });
});
