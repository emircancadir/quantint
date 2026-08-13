'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { renderMarkdown } from '@/lib/markdown';

export type PostFormState = {
  error?: 'forbidden' | 'invalid' | 'slug-taken' | 'unknown';
  fieldErrors?: Record<string, string[]>;
} | null;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const postSchema = z.object({
  id: z.string().optional(),
  slugTr: z.string().regex(slugPattern).max(200),
  slugEn: z.string().regex(slugPattern).max(200),
  titleTr: z.string().trim().min(3).max(300),
  titleEn: z.string().trim().min(3).max(300),
  excerptTr: z.string().trim().min(10).max(500),
  excerptEn: z.string().trim().min(10).max(500),
  bodyTr: z.string().min(1),
  bodyEn: z.string().min(1),
  referencesTr: z.string().max(30_000).default(''),
  referencesEn: z.string().max(30_000).default(''),
  readMin: z.coerce.number().int().min(1).max(120),
  categoryId: z.string().min(1),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']),
  scheduledAt: z.string().optional(),
  seriesId: z.string().optional(),
  seriesOrder: z.string().optional(),
});

export async function savePost(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await requireAdmin();
  if (!session) return { error: 'forbidden' };

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: 'invalid', fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { id, readMin, scheduledAt, seriesId, seriesOrder, ...data } = parsed.data;
  const tagIds = formData
    .getAll('tagIds')
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  if (
    data.status === 'SCHEDULED' &&
    (!scheduledDate || Number.isNaN(scheduledDate.getTime()))
  ) {
    return { error: 'invalid', fieldErrors: { scheduledAt: ['required'] } };
  }
  const publishDate =
    data.status === 'SCHEDULED' ? scheduledDate : data.status === 'PUBLISHED' ? new Date() : null;
  const sharedRelations = {
    seriesId: seriesId || null,
    seriesOrder: seriesId && seriesOrder ? Number(seriesOrder) : null,
  };

  // Slug uniqueness across both columns (excluding the post being edited).
  const clash = await prisma.post.findFirst({
    where: {
      OR: [
        { slugTr: { in: [data.slugTr, data.slugEn] } },
        { slugEn: { in: [data.slugTr, data.slugEn] } },
      ],
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true },
  });
  if (clash) return { error: 'slug-taken' };

  try {
    if (id) {
      const existing = await prisma.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });
      await prisma.post.update({
        where: { id },
        data: {
          ...data,
          ...sharedRelations,
          tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
          readMinTr: readMin,
          readMinEn: readMin,
          // Preserve the original publication date for an already-live post;
          // scheduled posts use the selected future timestamp.
          publishedAt:
            data.status === 'PUBLISHED' && existing?.publishedAt
              ? existing.publishedAt
              : publishDate,
        },
      });
    } else {
      await prisma.post.create({
        data: {
          ...data,
          ...sharedRelations,
          tags: { connect: tagIds.map((tagId) => ({ id: tagId })) },
          readMinTr: readMin,
          readMinEn: readMin,
          publishedAt: publishDate,
          authorId: session.user.id,
        },
      });
    }
  } catch (e) {
    console.error('savePost failed:', e);
    return { error: 'unknown' };
  }

  revalidatePath('/admin/posts');
  revalidatePath('/tr');
  revalidatePath('/en');
  redirect('/admin/posts');
}

export async function deletePost(formData: FormData) {
  const session = await requireAdmin();
  if (!session) return;
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return;
  await prisma.post.delete({ where: { id } });
  redirect('/admin/posts');
}

/** Live-preview backend for the admin editor — same pipeline as the site. */
export async function previewMarkdown(src: string): Promise<string> {
  const session = await requireAdmin();
  if (!session) return '';
  return renderMarkdown(src.slice(0, 100_000));
}
