'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export type TaxonomyFormState = {
  error?: 'forbidden' | 'invalid' | 'slug-taken' | 'in-use' | 'unknown';
} | null;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
const tagSchema = z.object({
  id: z.string().optional(),
  slug,
  nameTr: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
});
const seriesSchema = tagSchema.extend({
  descriptionTr: z.string().trim().max(500).default(''),
  descriptionEn: z.string().trim().max(500).default(''),
});

export async function saveTag(
  _previous: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  if (!(await requireAdmin())) return { error: 'forbidden' };
  const parsed = tagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'invalid' };
  const { id, ...data } = parsed.data;
  const clash = await prisma.tag.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: 'slug-taken' };
  try {
    if (id) await prisma.tag.update({ where: { id }, data });
    else await prisma.tag.create({ data });
  } catch (error) {
    console.error('saveTag failed:', error);
    return { error: 'unknown' };
  }
  revalidatePath('/admin/taxonomy');
  return null;
}

export async function deleteTag(
  _previous: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  if (!(await requireAdmin())) return { error: 'forbidden' };
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { error: 'invalid' };
  const count = await prisma.post.count({ where: { tags: { some: { id } } } });
  if (count) return { error: 'in-use' };
  await prisma.tag.delete({ where: { id } });
  revalidatePath('/admin/taxonomy');
  return null;
}

export async function saveSeries(
  _previous: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  if (!(await requireAdmin())) return { error: 'forbidden' };
  const parsed = seriesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'invalid' };
  const { id, ...data } = parsed.data;
  const clash = await prisma.series.findFirst({
    where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: 'slug-taken' };
  try {
    if (id) await prisma.series.update({ where: { id }, data });
    else await prisma.series.create({ data });
  } catch (error) {
    console.error('saveSeries failed:', error);
    return { error: 'unknown' };
  }
  revalidatePath('/admin/taxonomy');
  return null;
}

export async function deleteSeries(
  _previous: TaxonomyFormState,
  formData: FormData,
): Promise<TaxonomyFormState> {
  if (!(await requireAdmin())) return { error: 'forbidden' };
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { error: 'invalid' };
  const count = await prisma.post.count({ where: { seriesId: id } });
  if (count) return { error: 'in-use' };
  await prisma.series.delete({ where: { id } });
  revalidatePath('/admin/taxonomy');
  return null;
}
