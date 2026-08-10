'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export type CategoryFormState = {
  error?: 'forbidden' | 'invalid' | 'key-taken' | 'in-use' | 'unknown';
} | null;

const categorySchema = z.object({
  id: z.string().optional(),
  key: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(40),
  code: z.string().trim().min(1).max(6),
  nameTr: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().min(2).max(80),
  order: z.coerce.number().int().min(0).max(999),
});

export async function saveCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await requireAdmin();
  if (!session) return { error: 'forbidden' };

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'invalid' };
  const { id, ...data } = parsed.data;

  const clash = await prisma.category.findFirst({
    where: { key: data.key, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (clash) return { error: 'key-taken' };

  try {
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch (e) {
    console.error('saveCategory failed:', e);
    return { error: 'unknown' };
  }
  revalidatePath('/admin/categories');
  return null;
}

export async function deleteCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const session = await requireAdmin();
  if (!session) return { error: 'forbidden' };
  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { error: 'invalid' };

  const postCount = await prisma.post.count({ where: { categoryId: id } });
  if (postCount > 0) return { error: 'in-use' };

  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
  return null;
}
